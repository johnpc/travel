/**
 * Browser helpers for the panel: snapshot the interactive elements (each tagged
 * with a stable [ref] the agent points at) and execute one agent action. Kept
 * deliberately small — click / type / scroll — so a persona interacts the way a
 * person would, through what's visibly on screen.
 */

/** Tag every visible interactive element with data-panel-ref and return a list. */
export async function snapshot(page) {
  return page.evaluate(() => {
    const sel = 'button, a, input, textarea, ion-button, ion-chip, [data-testid], [role="button"]';
    const out = [];
    let ref = 0;
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect();
      const visible = r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
      if (!visible) continue;
      // Skip pure containers that just carry a testid but wrap other controls.
      const label =
        (el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.textContent || '') // prettier-ignore
          .replace(/\s+/g, ' ')
          .trim();
      if (!label && !el.getAttribute('data-testid')) continue;
      ref += 1;
      el.setAttribute('data-panel-ref', String(ref));
      out.push({ ref, tag: el.tagName.toLowerCase(), label: label || el.getAttribute('data-testid') }); // prettier-ignore
    }
    return out;
  });
}

/** Execute one action from the agent. Returns true if the persona is done. */
export async function execute(page, act) {
  if (act.action === 'done') return true;
  if (act.action === 'scroll') {
    await page.evaluate((dir) => window.scrollBy(0, dir === 'up' ? -600 : 600), act.direction || 'down'); // prettier-ignore
    await page.waitForTimeout(400);
    return false;
  }
  const target = act.ref ? page.locator(`[data-panel-ref="${act.ref}"]`) : null;
  if (!target) return false;
  if (act.action === 'type') {
    // IonInputs nest a native input; fall back to the element itself.
    const native = target.locator('input, textarea');
    const el = (await native.count()) ? native.first() : target;
    await el.fill(act.text || '').catch(() => {});
    await page.waitForTimeout(300);
    return false;
  }
  if (act.action === 'click') {
    await target.click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1200); // let live queries / AI settle a beat
    return false;
  }
  return false;
}
