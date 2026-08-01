/**
 * Idempotent seed runner: resets the shared sandbox to a known set of demo
 * trips + rosters. Clears every model, then inserts the fixtures so re-running
 * converges to the same state. Signs in as an editor so writes are authorized;
 * helpers live in ./seedClient, data in ./fixtures.
 *
 * Usage:
 *   npm run e2e-config   # ensure amplify_outputs.json exists
 *   npm run seed         # runs this script via tsx (needs editor creds)
 */
import { signIn, signOut } from 'aws-amplify/auth';
import './seedClient'; // configures Amplify + loads .env.local
import { clearAll, seedTripData } from './seedTrips';

async function main() {
  const username = process.env.TEST_USERNAME;
  const password = process.env.TEST_PASSWORD;
  if (!username || !password) {
    throw new Error(
      'TEST_USERNAME / TEST_PASSWORD required to seed (writes need an editor session).',
    );
  }
  await signOut().catch(() => {});
  await signIn({ username, password });

  await clearAll();
  console.log('Cleared all models.');

  await seedTripData();

  await signOut().catch(() => {});
  console.log('Seed complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
