const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const sharp = require(process.env.SHARP_PATH || 'sharp');
const baseURL = process.env.BASE_URL || 'http://localhost:3001';

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const errors = [];
  const results = [];
  try {
    for (const width of [1440, 390, 320]) {
      const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 1000 : 844 }, reducedMotion: width === 320 ? 'reduce' : 'no-preference' });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(baseURL);
      await page.getByRole('button', { name: 'Seleccionar Kliniu', exact: true }).click();
      await page.getByRole('region', { name: 'Recorrido de Kliniu' }).waitFor();
      if (width < 801) {
        assert.equal(await page.locator('canvas').count(), 0);
        await page.getByRole('button', { name: 'Compra', exact: true }).click();
        await page.getByRole('heading', { name: 'Del producto a la cotización.' }).waitFor();
        await page.getByRole('button', { name: 'Explorar en 3D', exact: true }).click();
      }
      const stage = page.locator('div[data-detail]');
      await stage.scrollIntoViewIfNeeded();
      await page.getByRole('button', { name: 'Kliniu: Compra', exact: true }).waitFor();
      // Allow the damped camera to settle before comparing the rendered pixels.
      await page.waitForTimeout(1800);
      const day = await page.locator('canvas').screenshot({ path: path.join(__dirname, `tour-${width}-day.png`), timeout: 10000 });
      await page.getByRole('button', { name: 'Kliniu: Compra', exact: true }).click();
      assert.equal(await page.getByRole('button', { name: 'Compra', exact: true }).getAttribute('aria-pressed'), 'true');
      await page.getByRole('button', { name: 'Kliniu: Arquitectura', exact: true }).click();
      await page.getByRole('heading', { name: 'La estructura del producto.' }).waitFor();
      await page.waitForTimeout(1800);
      const moved = await page.locator('canvas').screenshot({ timeout: 10000 });
      assert.notDeepEqual(day, moved, 'Camera must move between tour stops');
      await page.getByRole('switch', { name: 'Iluminación nocturna' }).click();
      await page.waitForTimeout(400);
      const night = await page.locator('canvas').screenshot({ path: path.join(__dirname, `tour-${width}-night.png`), timeout: 10000 });
      assert.notDeepEqual(moved, night, 'Lighting must change');
      const stats = await sharp(night).stats();
      assert.ok(stats.channels.some(channel => channel.stdev > 12), 'Canvas must contain rendered geometry');
      const hotspots = await page.getByRole('button', { name: /Kliniu: / }).evaluateAll(elements => elements.map(e => {
        const r = e.getBoundingClientRect(); return { name: e.getAttribute('aria-label'), x: r.x, y: r.y, width: r.width, height: r.height };
      }));
      assert.equal(hotspots.length, 3);
      for (const h of hotspots) assert.ok(h.x >= 0 && h.x + h.width <= width, `Hotspot outside viewport: ${h.name}`);
      for (let i = 0; i < hotspots.length; i++) for (let j = i + 1; j < hotspots.length; j++) {
        const a = hotspots[i], b = hotspots[j];
        assert.ok(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y, 'Hotspots overlap');
      }
      await page.getByRole('button', { name: 'Separar capas' }).click();
      await page.waitForTimeout(1600);
      await page.screenshot({ path: path.join(__dirname, `tour-${width}-scene.png`) });
      await page.getByRole('region', { name: 'Recorrido de Kliniu' }).scrollIntoViewIfNeeded();
      await page.getByRole('region', { name: 'Recorrido de Kliniu' }).screenshot({ path: path.join(__dirname, `tour-${width}-evidence.png`) });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.getByRole('button', { name: 'Hablemos de tu proyecto' }).click();
      assert.equal(new URL(page.url()).hash, '#contacto');
      await page.getByRole('button', { name: 'Vista general', exact: true }).click();
      assert.equal(await page.getByRole('region', { name: 'Recorrido de Kliniu' }).count(), 0);
      await page.getByRole('button', { name: 'El proyecto', exact: true }).click();
      const purchaseControl = page.getByRole('button', { name: 'Compra', exact: true });
      await purchaseControl.focus();
      await page.keyboard.press('Enter');
      assert.equal(await purchaseControl.getAttribute('aria-pressed'), 'true');
      await page.getByRole('button', { name: 'Abrir caso completo de Kliniu' }).click();
      await page.getByRole('heading', { name: 'Kliniu', exact: true, level: 1 }).waitFor();
      await page.getByRole('button', { name: 'Volver a la ciudad', exact: true }).waitFor();
      results.push({ width, hotspots, pixelStdDev: stats.channels.map(channel => Math.round(channel.stdev)) });
      await context.close();
    }
    const fallback = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await fallback.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, ...args) {
        return type === 'webgl2' || type === 'webgl' ? null : original.call(this, type, ...args);
      };
    });
    const page = await fallback.newPage();
    await page.goto(baseURL);
    await page.getByText('Tu navegador no dispone de esta vista 3D.', { exact: false }).waitFor();
    await page.getByRole('button', { name: 'Seleccionar Kliniu', exact: true }).click();
    await page.getByRole('button', { name: 'Compra', exact: true }).click();
    await page.getByRole('heading', { name: 'Del producto a la cotización.' }).waitFor();
    assert.equal(await page.locator('canvas').count(), 0);
    const image = page.getByRole('img', { name: 'Ficha real de producto de Kliniu' });
    await image.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const img = document.querySelector('img[alt="Ficha real de producto de Kliniu"]');
      return img?.complete && img.naturalWidth > 0;
    });
    await page.getByRole('region', { name: 'Recorrido de Kliniu' }).screenshot({ path: path.join(__dirname, 'tour-fallback-purchase.png') });
    await fallback.close();
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ passed: true, results }, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
