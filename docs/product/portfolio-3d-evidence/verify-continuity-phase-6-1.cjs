const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const sharp = require(process.env.SHARP_PATH || 'sharp');
const base = process.env.BASE_URL || 'http://localhost:3001';
const projects = ['Kliniu', "L'ORIGINE", '4U Studio Academy', 'Drokex'];
const screenshot = (page, name) => page.screenshot({ path: path.join(__dirname, `phase61-${name}.png`) });
async function active(page) {
  await page.waitForFunction(() => !document.querySelector('[role="switch"][aria-label="Iluminación nocturna"]')?.disabled);
  await page.waitForTimeout(1200);
}
async function activate(page) {
  const button = page.getByRole('button', { name: 'Explorar en 3D', exact: true });
  if (await button.isVisible()) await button.click();
  await active(page);
}
async function difference(a, b) {
  const left = await sharp(a).resize(240, 180).removeAlpha().raw().toBuffer();
  const right = await sharp(b).resize(240, 180).removeAlpha().raw().toBuffer();
  return left.reduce((total, value, i) => total + Math.abs(value - right[i]), 0) / left.length;
}
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const errors = [], results = [];
  try {
    for (const [width, height] of [[1440, 1000], [1920, 1080], [390, 844], [320, 740], [320, 568]]) {
      const context = await browser.newContext({ viewport: { width, height } });
      const page = await context.newPage();
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(base);
      await page.waitForTimeout(1000);
      if (width <= 800) assert.equal(await page.locator('canvas').count(), 0, 'Mobile stays opt-in');
      await screenshot(page, `${width}-${height}-initial`);
      await activate(page);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await screenshot(page, `${width}-${height}-city`);
      for (const name of (width === 1440 || width === 390 ? projects : ['Drokex'])) {
        console.log('Checking', width, height, name);
        await page.getByRole('button', { name: `Seleccionar ${name}`, exact: true }).click();
        await page.waitForTimeout(1600);
        await page.getByRole('switch', { name: 'Iluminación nocturna' }).click();
        const layers = page.getByRole('button', { name: 'Separar capas', exact: true });
        if (await layers.getAttribute('aria-pressed') !== 'true') await layers.click();
        await page.waitForTimeout(1300);
        const canvas = page.locator('#inicio canvas');
        const box = await canvas.boundingBox();
        await page.mouse.move(box.x + box.width * .7, box.y + box.height * .55);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width * .75, box.y + box.height * .57, { steps: 12 });
        await page.mouse.up();
        await page.waitForTimeout(1300);
        const before = await canvas.screenshot();
        assert.ok((await sharp(before).stats()).channels.some(c => c.stdev > 10), 'Nonblank city');
        const night = await page.getByRole('switch', { name: 'Iluminación nocturna' }).getAttribute('aria-checked');
        const scroll = await page.evaluate(() => scrollY);
        await page.getByRole('button', { name: `Entrar a ${name}`, exact: true }).click();
        await page.getByRole('button', { name: 'Cancelar entrada', exact: true }).waitFor();
        await page.waitForTimeout(250);
        await screenshot(page, `${width}-${name.replace(/[^a-z0-9]/gi, '')}-approach`);
        await page.getByRole('heading', { name, level: 1, exact: true }).waitFor();
        await page.getByRole('button', { name: 'Volver a la ciudad', exact: true }).click();
        try { await active(page); } catch (error) {
          await screenshot(page, `${width}-return-failure`);
          console.log(await page.evaluate(() => ({ scrollY, canvas: document.querySelectorAll('canvas').length })));
          throw error;
        }
        assert.equal(await page.getByRole('switch', { name: 'Iluminación nocturna' }).getAttribute('aria-checked'), night);
        assert.equal(await page.getByRole('button', { name: 'Separar capas', exact: true }).getAttribute('aria-pressed'), 'true');
        assert.equal(await page.getByRole('button', { name: `Entrar a ${name}`, exact: true }).evaluate(e => e === document.activeElement), true);
        assert.ok(Math.abs(await page.evaluate(() => scrollY) - scroll) <= 2, 'Scroll restored');
        const after = await canvas.screenshot();
        const delta = await difference(before, after);
        if (delta >= 3) {
          require('node:fs').writeFileSync(path.join(__dirname, 'phase61-camera-before.png'), before);
          require('node:fs').writeFileSync(path.join(__dirname, 'phase61-camera-after.png'), after);
        }
        assert.ok(delta < 3, `Camera restored ${width}/${name}: pixel difference ${delta}`);
        results.push({ width, height, name, cameraDifference: delta });
      }
      // Cancellation restores the snapshot without opening a case later.
      await page.getByRole('button', { name: 'Entrar a Drokex', exact: true }).click();
      await page.keyboard.press('Escape');
      await page.waitForTimeout(2800);
      assert.equal(await page.locator('[data-project="drokex"] h1').textContent(), 'Daniel Cantor');
      await page.getByRole('button', { name: 'Cerrar vista 3D', exact: true }).click();
      await page.getByRole('button', { name: 'Entrar a Drokex', exact: true }).click();
      await page.getByRole('heading', { name: 'Drokex', level: 1, exact: true }).waitFor();
      await page.getByRole('button', { name: 'Volver a la ciudad', exact: true }).click();
      await page.waitForTimeout(600);
      assert.equal(await page.locator('canvas').count(), 0, 'Explicit close persists');
      await context.close();
    }
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ passed: true, results }, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
