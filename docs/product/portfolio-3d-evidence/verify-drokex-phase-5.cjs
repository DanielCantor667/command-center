const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const sharp = require(process.env.SHARP_PATH || 'sharp');
const baseURL = process.env.BASE_URL || 'http://localhost:3001';
const capture = (page, name) =>
  page.screenshot({ path: path.join(__dirname, `phase5-${name}.png`) });
async function enter(page) {
  await page.goto(baseURL);
  await page.locator('main[data-reveal="false"]').waitFor();
  await page.getByRole('button', { name: "Seleccionar Drokex", exact: true }).click();
  await page.getByRole('button', { name: "Entrar a Drokex", exact: true }).click();
  await page.getByRole('heading', { name: "Drokex", level: 1, exact: true }).waitFor();
}
async function ready(page) {
  await page.waitForFunction(
    () => document.querySelector('#drokex-study')?.dataset.live === 'true',
  );
  await page.waitForTimeout(1400);
}
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const errors = [],
    results = [],
    expected = [];
  try {
    for (const [width, height] of [
      [1440, 1000],
      [1920, 1080],
      [390, 844],
      [320, 740],
    ]) {
      const context = await browser.newContext({ viewport: { width, height } });
      const page = await context.newPage();
      page.on('pageerror', (e) => errors.push(e.message));
      await enter(page);
      await page.waitForTimeout(900);
      await capture(page, `${width}-case`);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      const study = page.getByRole('region', { name: 'Comercio conectado.' });
      await study.scrollIntoViewIfNeeded();
      const button = (name) => study.getByRole('button', { name, exact: true });
      await button('Explorar red en 3D').focus();
      await page.keyboard.press('Enter');
      await ready(page);
      assert.equal(await button('Cerrar red 3D').evaluate(e => e === document.activeElement), true, 'Activation retains keyboard focus');
      const canvas = study.locator('canvas');
      const gallery = await canvas.screenshot();
      assert.ok(
        (await sharp(gallery).stats()).channels.some((c) => c.stdev > 10),
        'Nonblank gallery',
      );
      await study.screenshot({ path: path.join(__dirname, `phase5-${width}-gallery.png`) });
      await button('Detalle').focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1700);
      const detail = await canvas.screenshot();
      assert.ok(
        (await sharp(detail).stats()).channels.some((c) => c.stdev > 10),
        'Nonblank detail',
      );
      assert.notDeepEqual(detail, gallery, 'Detail changes rendered model');
      await canvas.focus();
      assert.equal(await canvas.evaluate((e) => e === document.activeElement), true);
      const beforeKey = await canvas.screenshot();
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(500);
      assert.notDeepEqual(beforeKey, await canvas.screenshot(), 'Keyboard rotates the model');
      await page.keyboard.press('Home');
      await page.waitForTimeout(1500);
      await study.screenshot({ path: path.join(__dirname, `phase5-${width}-detail.png`) });
      const box = await canvas.boundingBox();
      await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.5);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.5, { steps: 12 });
      await page.mouse.up();
      await page.waitForTimeout(900);
      assert.notDeepEqual(detail, await canvas.screenshot(), 'Drag changes camera');
      await button('Restablecer red').click();
      await page.waitForTimeout(1500);
      const before = await page.locator('#drokex-study').boundingBox();
      await button('Plataforma').click();
      const after = await page.locator('#drokex-study').boundingBox();
      assert.ok(Math.abs(before.y - after.y) < 1, 'Stable stage');
      assert.equal(await canvas.count(), 0);
      await page.waitForFunction(() => {
        const i = document.querySelector('#drokex-study>img');
        return i?.complete && i.naturalWidth > 0;
      });
      await study.screenshot({ path: path.join(__dirname, `phase5-${width}-site.png`) });
      const targets = await study
        .getByRole('group')
        .locator('button')
        .evaluateAll((elements) =>
          elements.map((e) => {
            const r = e.getBoundingClientRect();
            return [r.width, r.height];
          }),
        );
      assert.ok(targets.every(([w, h]) => w >= 44 && h >= 44));
      await button('Red').click();
      await ready(page);
      await button('Cerrar red 3D').click();
      await page.waitForTimeout(100);
      assert.equal(await canvas.count(), 0);
      assert.equal(
        await button('Explorar red en 3D').evaluate((e) => e === document.activeElement),
        true,
      );
      await page
        .getByRole('img', { name: 'Directorio público de Drokex' })
        .scrollIntoViewIfNeeded();
      await capture(page, `${width}-evidence`);
      await page.getByRole('button', { name: 'Volver a la ciudad', exact: true }).click();
      await page.getByRole('heading', { name: 'Daniel Cantor', level: 1 }).waitFor();
      results.push({
        width,
        height,
        canvas: true,
        detail: true,
        drag: true,
        keyboard: true,
        return: true,
      });
      await context.close();
    }
    for (const mode of ['no-webgl', 'reduced', 'failed-model', 'context-loss']) {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference',
      });
      if (mode === 'no-webgl')
        await context.addInitScript(() => {
          const original = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (type, ...args) {
            return type.startsWith('webgl') ? null : original.call(this, type, ...args);
          };
        });
      const page = await context.newPage();
      page.on('pageerror', (e) => {
        if (
          mode === 'failed-model' &&
          e.message.includes('Could not load /models/workshop/drokex-interactive-v4.glb:')
        )
          expected.push(e.message);
        else errors.push(e.message);
      });
      if (mode === 'failed-model')
        await page.route('**/drokex-interactive-v4.glb', (r) => r.abort());
      await enter(page);
      const study = page.getByRole('region', { name: 'Comercio conectado.' });
      await study.scrollIntoViewIfNeeded();
      await study.getByRole('button', { name: 'Explorar red en 3D', exact: true }).click();
      if (mode === 'reduced' || mode === 'context-loss') {
        await ready(page);
        if (mode === 'context-loss')
          await study
            .locator('canvas')
            .evaluate((c) =>
              c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext(),
            );
        else {
          await study.getByRole('button', { name: 'Detalle', exact: true }).click();
          await page.waitForTimeout(300);
          await capture(page, 'reduced');
        }
      }
      if (mode !== 'reduced') {
        await study.getByRole('status').waitFor();
        assert.equal(await study.locator('canvas').count(), 0);
      }
      await study.getByRole('button', { name: 'Plataforma', exact: true }).click();
      await page.waitForFunction(() => {
        const i = document.querySelector('#drokex-study>img');
        return i?.complete && i.naturalWidth > 0;
      });
      await capture(page, mode);
      results.push({ mode, passed: true });
      await context.close();
    }
    assert.deepEqual(errors, []);
    assert.ok(expected.length > 0);
    console.log(
      JSON.stringify({ passed: true, results, expectedModelErrors: expected.length }, null, 2),
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
