import { createBdd } from 'playwright-bdd';

const { Given } = createBdd();

/** How long each subscription registration is held back. Longer than a fast
 * add-after-load, shorter than Amplify's 15 s start-ack timeout. */
const SUBSCRIBE_DELAY_MS = 4_000;

// Reproduce a slow network's real-time handshake deterministically: every
// AppSync subscription registration ("start") reaches the server late, so a
// write made right after the trip loads lands before the live list is
// listening. Everything else on the socket flows through untouched.
Given('real-time updates are slow to connect', async ({ page }) => {
  await page.routeWebSocket(/appsync-realtime-api/, (ws) => {
    const server = ws.connectToServer();
    ws.onMessage((msg) => {
      const isStart = typeof msg === 'string' && /"type":"(start|subscribe)"/.test(msg);
      if (isStart) setTimeout(() => server.send(msg), SUBSCRIBE_DELAY_MS);
      else server.send(msg);
    });
    server.onMessage((msg) => ws.send(msg));
  });
});
