/**
 * Multi-LLM usability panel. Four personas (same model, distinct personalities)
 * each drive a REAL browser against the SAME shared trip URL — joining,
 * brainstorming, voting, marking dates, checking budget, and talking in the
 * discussion chat to converge on one destination + dates. Each then gives
 * structured feedback; a synthesis pass produces a ranked UX backlog.
 *
 *   npm run panel                 # against http://localhost:5173
 *   PANEL_BASE=https://travel.jpc.io npm run panel
 *
 * Needs AWS creds for Bedrock (AWS_PROFILE=personal) + a running dev server.
 * Writes a timestamped report + screenshots under panel-report/.
 */
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { PERSONAS, GOAL, TRIP_SLUG_BASE } from './personas.mjs';
import { nextAction, MODEL_ID } from './agent.mjs';
import { snapshot, execute } from './browser.mjs';
import { askFeedback, synthesize } from './feedback.mjs';

const BASE = process.env.PANEL_BASE || 'http://localhost:5173';
const SLUG = process.env.PANEL_SLUG || `${TRIP_SLUG_BASE}-${process.env.PANEL_RUN_ID || 'demo'}`;
const MAX_TURNS = Number(process.env.PANEL_MAX_TURNS || 22);
const OUT = 'panel-report';
mkdirSync(OUT, { recursive: true });

const log = (...a) => console.log(...a);

/** Run one persona's browsing session; returns its transcript + feedback. */
async function runPersona(browser, persona) {
  const ctx = await browser.newContext({ viewport: { width: 420, height: 900 } });
  const page = await ctx.newPage();
  const system = `${persona.persona}\n\n${GOAL}\n\nYour name for the roster is "${persona.name}". Act one step at a time.`;
  const history = [];
  const transcript = [];
  let lastSig = '';
  let repeats = 0;
  await page.goto(`${BASE}/${SLUG}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const elements = await snapshot(page);
    const shot = await page.screenshot();
    // If the agent keeps repeating the same action, nudge it to change tack.
    const hint =
      repeats >= 2
        ? ' NOTE: your last action repeated with no effect — try a DIFFERENT action now (e.g. type into the field instead of clicking it).'
        : '';
    let act;
    try {
      act = await nextAction({
        system: system + hint,
        history,
        screenshotB64: shot.toString('base64'),
        elements,
      });
    } catch (e) {
      log(`  [${persona.id}] model error: ${e.message}`);
      break;
    }
    const sig = `${act.action}:${act.ref ?? ''}`;
    repeats = sig === lastSig ? repeats + 1 : 0;
    lastSig = sig;
    const line = `${act.action}${act.ref ? ` [${act.ref}]` : ''}${act.text ? ` "${act.text}"` : ''} — ${act.think}`; // prettier-ignore
    transcript.push(line);
    log(`  [${persona.id}] ${line}`);
    history.push({ role: 'assistant', content: `${act.action} ${act.ref ?? ''} ${act.text ?? ''}`.trim() }); // prettier-ignore
    history.push({ role: 'user', content: 'ok, next step.' });
    if (history.length > 16) history.splice(0, 2); // keep context bounded
    const done = await execute(page, act);
    if (done) {
      transcript.push('(done — felt the group had converged)');
      break;
    }
  }

  await page.screenshot({ path: `${OUT}/${persona.id}-final.png`, fullPage: true });
  const feedback = await askFeedback(persona, transcript.join('\n')).catch((e) => ({ error: e.message })); // prettier-ignore
  await ctx.close();
  return { persona: persona.name, id: persona.id, transcript, feedback };
}

async function main() {
  log(`\n🧭 Travel usability panel — ${PERSONAS.length} personas on ${BASE}/${SLUG}`);
  log(`   model: ${MODEL_ID}\n`);
  const browser = await chromium.launch();
  // Run sequentially so they see each other's contributions build up on the
  // shared board (a real group trickles in, and it keeps Bedrock calls modest).
  const results = [];
  for (const p of PERSONAS) {
    log(`▶ ${p.name} (${p.id}) is planning…`);
    results.push(await runPersona(browser, p));
  }
  await browser.close();

  log('\n🧪 Synthesizing feedback into a backlog…');
  const synthesis = await synthesize(results.map((r) => ({ persona: r.persona, ...r.feedback })));

  const report = { base: BASE, slug: SLUG, model: MODEL_ID, results, synthesis };
  const stamp = process.env.PANEL_RUN_ID || 'latest';
  writeFileSync(`${OUT}/report-${stamp}.json`, JSON.stringify(report, null, 2));

  // Human-readable summary
  log('\n════════ PANEL RESULTS ════════');
  for (const r of results) {
    const f = r.feedback || {};
    log(`\n${r.persona} — score ${f.score ?? '?'}/10, consensus: ${f.reachedConsensus ? 'yes' : 'no'}`); // prettier-ignore
    (f.confused || []).forEach((c) => log(`  ✗ ${c}`));
  }
  log('\n──────── SYNTHESIS ────────');
  (synthesis.topStrengths || []).forEach((s) => log(`  ✓ ${s}`));
  log(`  consensus: ${synthesis.consensusRate ?? '?'}`);
  (synthesis.backlog || []).forEach((b) => log(`  [${b.severity}] ${b.issue}\n      → ${b.fix}`));
  log(`\n📄 Full report: ${OUT}/report-${stamp}.json`);
}

main().catch((e) => {
  console.error('panel run failed:', e);
  process.exit(1);
});
