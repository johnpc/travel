#!/usr/bin/env node
/**
 * Per-run ephemeral Amplify sandbox management for CI (pattern from johnpc/stoop).
 *
 * WHY: CI used to read ONE hardcoded developer sandbox stack. When that stack was
 * deleted, every CI job failed with StackDoesNotExistError. Now each CI run
 * deploys its OWN sandbox (`ci-<run_id>`), seeds it, tests against it, and a
 * final `if: always()` job deletes it — no shared state, no standing cost.
 *
 * Stack names are DETERMINISTIC (see @aws-amplify/platform-core):
 *   amplify-<namespace sans non-alnum>-<identifier>-sandbox-<hash>
 * where hash = sha512(packageName + identifier)[:10]. We always hand `ampx` an
 * already-sanitized identifier, so the name in the stack round-trips exactly.
 *
 * Usage:
 *   node scripts/sandbox.mjs id                 print the resolved identifier
 *   node scripts/sandbox.mjs name               print the derived stack name
 *   node scripts/sandbox.mjs deploy             ampx sandbox --once, then verify the stack
 *   node scripts/sandbox.mjs config             ampx generate outputs (retried)
 *   node scripts/sandbox.mjs ensure-user [--group G]
 *                                               create TEST_USERNAME in the fresh pool
 *   node scripts/sandbox.mjs delete             delete THIS run's CI sandbox (idempotent)
 *   node scripts/sandbox.mjs sweep [--hours 6] [--apply]
 *                                               delete leaked CI sandboxes older than N hours
 *
 * Identifier: --id flag → SANDBOX_IDENTIFIER env → system user (ampx's own
 * default, so local `npm run e2e-config` still targets your personal sandbox).
 * `delete` and `sweep` ONLY ever touch CI identifiers (`ci<digits>`).
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir, userInfo } from 'node:os';
import { join } from 'node:path';

const REGION = 'us-west-2';
const PROFILE = process.env.AWS_PROFILE ?? 'personal';
const PKG = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).name;
const sanitize = (s) => (s ?? '').replace(/[^A-Za-z0-9]/g, '');
const NS = sanitize(PKG);
const OUTPUTS = new URL('../amplify_outputs.json', import.meta.url);

// The ONLY identifiers delete/sweep may act on: what CI creates (`ci-<run_id>`).
const CI_ID = /^ci\d+$/;
const ROOT_STACK = new RegExp(`^amplify-${NS}-(ci\\d+)-sandbox-[a-f0-9]{10}$`);

const flag = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && i + 1 < process.argv.length ? process.argv[i + 1] : undefined;
};
const has = (name) => process.argv.includes(`--${name}`);

const resolveId = () => {
  const id = sanitize(flag('id') || process.env.SANDBOX_IDENTIFIER || userInfo().username);
  // ampx enforces /^[a-zA-Z0-9-]{1,15}$/. Fail loudly rather than truncate, so a
  // CI id can never silently stop matching the sweep's `ci<digits>` pattern.
  if (!id || id.length > 15) throw new Error(`sandbox: bad identifier "${id}" (1-15 alnum)`);
  return id;
};

const stackName = (id) => {
  const hash = createHash('sha512').update(PKG).update(id).digest('hex').slice(0, 10);
  return ['amplify', NS, id, 'sandbox', hash].join('-');
};

const npx = (args) => execFileSync('npx', args, { stdio: 'inherit' });
// stderr is captured (not echoed) so an expected "does not exist" stays quiet.
const aws = (args) =>
  execFileSync('aws', [...args, '--region', REGION, '--profile', PROFILE], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

/** Run an aws call whose params include a secret via a 0600 temp JSON file, so
 * the secret never lands in argv (process list) or in an error message. */
const awsWithSecretInput = (args, params) => {
  const dir = mkdtempSync(join(tmpdir(), 'sandbox-'));
  const file = join(dir, 'input.json');
  writeFileSync(file, JSON.stringify(params), { mode: 0o600 });
  try {
    return aws([...args, '--cli-input-json', `file://${file}`]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Stack status, or null when the stack does not exist. */
const stackStatus = (name) => {
  try {
    const out = aws([
      'cloudformation',
      'describe-stacks',
      '--stack-name',
      name,
      '--output',
      'json',
    ]);
    return JSON.parse(out).Stacks[0].StackStatus;
  } catch (err) {
    if (String(err.stderr ?? err.message).includes('does not exist')) return null;
    throw err;
  }
};

const HEALTHY = ['CREATE_COMPLETE', 'UPDATE_COMPLETE', 'UPDATE_ROLLBACK_COMPLETE'];

/**
 * `ampx sandbox --once` can exit 0 over a ROLLED-BACK stack (it prints the
 * error and returns success), so the stack's own status is the success signal.
 */
const deploy = (id) => {
  npx(['ampx', 'sandbox', '--once', '--identifier', id, '--profile', PROFILE]);
  const name = stackName(id);
  const status = stackStatus(name);
  if (!HEALTHY.includes(status)) throw new Error(`sandbox: ${name} is ${status} after deploy`);
  console.log(`sandbox: ${name} is ${status}`);
};

const outputsValid = () => {
  try {
    const o = JSON.parse(readFileSync(OUTPUTS, 'utf8'));
    return Boolean(o?.auth?.user_pool_id && o?.data?.url);
  } catch {
    return false;
  }
};

/**
 * Pull amplify_outputs.json. A valid file is the success signal, not the exit
 * code (ampx can crash on shutdown after writing it), and a transient network
 * blip that writes nothing is retried.
 */
const config = async (id) => {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      npx(['ampx', 'generate', 'outputs', '--stack', stackName(id), '--profile', PROFILE]);
    } catch (err) {
      console.error(`sandbox: ampx generate outputs exited ${err.status}`);
    }
    if (outputsValid()) return;
    if (attempt < 3) await sleep(5000);
  }
  throw new Error('sandbox: no valid amplify_outputs.json after 3 attempts');
};

/**
 * A fresh sandbox has a brand-new, EMPTY Cognito pool, so the CI test account
 * has to be created on every run: create (no invite email), set the permanent
 * password (which confirms it), and join --group if given. Each step is
 * idempotent.
 */
const ensureUser = () => {
  const { auth } = JSON.parse(readFileSync(OUTPUTS, 'utf8'));
  const pool = ['--user-pool-id', auth.user_pool_id];
  const user = process.env.TEST_USERNAME;
  const password = process.env.TEST_PASSWORD;
  if (!user || !password) throw new Error('ensure-user: TEST_USERNAME / TEST_PASSWORD required');
  const idp = (args) => aws(['cognito-idp', ...args, ...pool]);
  try {
    idp(['admin-get-user', '--username', user]);
  } catch (err) {
    if (!String(err.stderr ?? err.message).includes('UserNotFoundException')) throw err;
    idp([
      'admin-create-user',
      '--username',
      user,
      '--message-action',
      'SUPPRESS',
      '--user-attributes',
      `Name=email,Value=${user}`,
      'Name=email_verified,Value=true',
    ]);
  }
  awsWithSecretInput(['cognito-idp', 'admin-set-user-password'], {
    UserPoolId: auth.user_pool_id,
    Username: user,
    Password: password,
    Permanent: true,
  });
  const group = flag('group');
  if (group) idp(['admin-add-user-to-group', '--username', user, '--group-name', group]);
  console.log(`ensure-user: test user ready in ${auth.user_pool_id}${group ? ` (${group})` : ''}`);
};

/** Wait out any in-flight create/update (e.g. a deploy cancelled mid-way). */
const waitSettled = async (name) => {
  for (let i = 0; i < 120; i++) {
    const status = stackStatus(name);
    if (!status?.endsWith('_IN_PROGRESS') || status === 'DELETE_IN_PROGRESS') return status;
    console.log(`sandbox: ${name} is ${status}, waiting before delete…`);
    await sleep(15000);
  }
  throw new Error(`sandbox: ${name} never settled`);
};

/** Delete one CI sandbox and PROVE it is gone. Missing stack = success. */
const remove = async (id) => {
  if (!CI_ID.test(id)) throw new Error(`sandbox: refusing to delete non-CI sandbox "${id}"`);
  const name = stackName(id);
  const before = await waitSettled(name);
  if (before === null) return console.log(`sandbox: ${name} does not exist, nothing to delete`);
  if (before !== 'DELETE_IN_PROGRESS')
    npx(['ampx', 'sandbox', 'delete', '--identifier', id, '--profile', PROFILE, '--yes']);
  aws(['cloudformation', 'wait', 'stack-delete-complete', '--stack-name', name]);
  const after = stackStatus(name);
  if (after !== null && after !== 'DELETE_COMPLETE')
    throw new Error(`sandbox: ${name} is ${after} after delete`);
  console.log(`sandbox: ${name} deleted`);
};

/**
 * Delete leaked CI sandboxes (a run whose teardown never ran or failed). Only
 * root stacks whose name is EXACTLY the derived name for a `ci<digits>` id are
 * in scope — never a developer sandbox, never the prod `branch` stacks. Ages
 * off CreationTime: a per-run sandbox older than --hours is always a leak.
 * Dry run unless --apply.
 */
const sweep = async () => {
  const hours = Number(flag('hours') ?? 6);
  const cutoff = Date.now() - hours * 3_600_000;
  const out = aws([
    'cloudformation',
    'describe-stacks',
    '--output',
    'json',
    '--query',
    'Stacks[].{name:StackName,created:CreationTime,status:StackStatus}',
  ]);
  const leaked = JSON.parse(out)
    .map((s) => ({ ...s, id: s.name.match(ROOT_STACK)?.[1] }))
    .filter((s) => s.id && s.name === stackName(s.id) && Date.parse(s.created) < cutoff);
  if (!leaked.length) return console.log(`sweep: no CI sandbox older than ${hours}h`);
  let failed = 0;
  for (const s of leaked) {
    console.log(
      `${has('apply') ? 'DELETING' : 'would delete'} ${s.name} (${s.status}, ${s.created})`,
    );
    if (!has('apply')) continue;
    await remove(s.id).catch((err) => {
      failed++;
      console.error(err);
    });
  }
  if (failed) throw new Error(`sweep: ${failed} sandbox(es) failed to delete`);
};

const actions = {
  id: () => console.log(resolveId()),
  name: () => console.log(stackName(resolveId())),
  deploy: () => deploy(resolveId()),
  config: () => config(resolveId()),
  'ensure-user': ensureUser,
  delete: () => remove(resolveId()),
  sweep,
};
const cmd = process.argv[2];
if (!actions[cmd]) {
  console.error(`Unknown command "${cmd ?? ''}". One of: ${Object.keys(actions).join(', ')}`);
  process.exit(1);
}
if (cmd === 'ensure-user' && !existsSync(OUTPUTS)) {
  console.error('ensure-user: run `npm run e2e-config` first (no amplify_outputs.json)');
  process.exit(1);
}
try {
  await actions[cmd]();
} catch (err) {
  console.error(err.message ?? err);
  process.exit(1);
}
