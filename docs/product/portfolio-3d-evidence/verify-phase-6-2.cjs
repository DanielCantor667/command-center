const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const sharp = require(process.env.SHARP_PATH || 'sharp');
const base = process.env.BASE_URL || 'http://localhost:3001';
const projects = [
  ['kliniu', 'Kliniu'],
  ['lorigine', "L'ORIGINE"],
  ['4ustudio-academy', '4U Studio Academy'],
  ['drokex', 'Drokex'],
];
const capture = (page, name) => page.screenshot({ path: path.join(__dirname, `phase62-${name}.png`) });
async function fresh(page) {
  await page.goto(base);
  await page.locator('main[data-reveal="false"]').waitFor();
}
async function enter(page, name) {
  await page.getByRole('button', { name: `Seleccionar ${name}`, exact: true }).click();
  await page.getByRole('button', { name: `Entrar a ${name}`, exact: true }).click();
  await page.getByRole('heading', { name, level: 1, exact: true }).waitFor();
}
async function shown(page) {
  await page.waitForFunction(() => !document.documentElement.dataset.portfolioTransition);
  await page.waitForTimeout(80);
}
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = [];
  try {
    for (const [width, height] of [[1440, 1000], [390, 844], [320, 568]]) {
      const context = await browser.newContext({ viewport: { width, height } });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await fresh(page);
      if (width === 390) {
        await page.getByRole('button', { name: 'Explorar en 3D', exact: true }).click();
        await page.waitForFunction(() => !document.querySelector('[aria-label="Iluminación nocturna"]')?.disabled);
      }
      for (const [id, name] of (width === 320 ? [projects[3]] : projects)) {
        await enter(page, name);
        const before = await page.screenshot();
        await page.getByRole('button', { name: 'Volver a la ciudad', exact: true }).click();
        assert.equal(await page.evaluate(() => document.documentElement.dataset.portfolioTransition), 'return');
        assert.equal(await page.evaluate(() => document.documentElement.dataset.portfolioProject), id);
        await page.waitForTimeout(170);
        const middle = await capture(page, `${width}-${id}-return-mid`);
        assert.ok((await sharp(middle).stats()).channels.some(c => c.stdev > 10), 'Transition frame is not blank');
        assert.notDeepEqual(middle, before, 'Return reveals a new frame');
        await shown(page);
        assert.equal(await page.locator('main[data-project]').getAttribute('data-project'), id);
        assert.equal(await page.getByRole('button', { name: `Entrar a ${name}`, exact: true }).evaluate(e => e === document.activeElement), true);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        await capture(page, `${width}-${id}-city`);
        results.push({ width, name, return: true });
      }
      await context.close();
      assert.deepEqual(errors, []);
    }

    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    await fresh(page);
    await enter(page, 'Kliniu');
    await page.getByRole('button', { name: /Siguiente proyecto/ }).click();
    assert.equal(await page.evaluate(() => document.documentElement.dataset.portfolioTransition), 'next');
    await page.waitForTimeout(170);
    await capture(page, 'next-mid');
    await shown(page);
    assert.equal(await page.getByRole('heading', { name: "L'ORIGINE", level: 1 }).evaluate(e => e === document.activeElement), true);
    await page.getByRole('button', { name: /Proyecto anterior/ }).click();
    assert.equal(await page.evaluate(() => document.documentElement.dataset.portfolioTransition), 'previous');
    await page.waitForTimeout(170);
    await capture(page, 'previous-mid');
    await shown(page);
    assert.equal(await page.getByRole('heading', { name: 'Kliniu', level: 1 }).evaluate(e => e === document.activeElement), true);
    await page.getByRole('button', { name: 'Volver a la ciudad', exact: true }).click();
    await page.keyboard.press('Escape');
    await shown(page);
    assert.equal(await page.getByRole('button', { name: 'Entrar a Kliniu', exact: true }).isVisible(), true);
    results.push({ mode: 'next-previous-escape', passed: true });
    await context.close();

    for (const mode of ['reduced', 'no-api', 'throwing-api']) {
      const fallback = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference' });
      if (mode !== 'reduced') await fallback.addInitScript(mode => {
        document.startViewTransition = mode === 'no-api' ? undefined : () => { throw new Error('Unavailable transition'); };
      }, mode);
      const target = await fallback.newPage();
      await fresh(target);
      await enter(target, 'Drokex');
      await target.getByRole('button', { name: 'Volver a la ciudad', exact: true }).click();
      await target.getByRole('button', { name: 'Entrar a Drokex', exact: true }).waitFor();
      assert.equal(await target.evaluate(() => document.documentElement.dataset.portfolioTransition), undefined);
      results.push({ mode, passed: true });
      await fallback.close();
    }
    console.log(JSON.stringify({ passed: true, results }, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
