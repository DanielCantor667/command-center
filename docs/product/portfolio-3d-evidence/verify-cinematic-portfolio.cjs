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
    const sizes = process.env.QUICK ? [[1440, 1000], [390, 844]] : [[1440, 1000], [1920, 1080], [390, 844], [320, 740], [320, 568], [1024, 600]];
    for (const [width, height] of sizes) {
      const context = await browser.newContext({ viewport: { width, height } });
      await context.addInitScript(() => {
        window.__transitions = [];
        if (document.startViewTransition) {
          const original = document.startViewTransition.bind(document);
          document.startViewTransition = update => {
            const source = document.querySelector('img[style*="kliniu-surface"]');
            const entry = { source: !!source, sourceWidth: source?.getBoundingClientRect().width, ready: false, finished: false };
            window.__transitions.push(entry);
            const transition = original(update);
            transition.ready.then(() => { entry.ready = true; }, error => { entry.error = error.message; });
            transition.finished.then(() => { entry.finished = true; });
            return transition;
          };
        }
      });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(baseURL);
      await page.getByRole('heading', { name: 'Daniel Cantor', level: 1 }).waitFor();
      if (width <= 800) {
        await page.screenshot({ path: path.join(__dirname, `cinematic-${width}-${height}-poster.png`) });
        await page.getByRole('button', { name: 'Explorar en 3D', exact: true }).click();
      }
      await page.locator('canvas').waitFor();
      await page.getByRole('button', { name: 'Seleccionar edificio Kliniu', exact: true }).waitFor();
      await page.waitForTimeout(1700);
      const shot = await page.screenshot({ path: path.join(__dirname, `cinematic-${width}-${height}-hero.png`) });
      const stats = await sharp(shot).stats();
      assert.ok(stats.channels.some(channel => channel.stdev > 18), 'Rendered page must not be blank');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'No horizontal overflow');
      const hero = await page.getByRole('region', { name: 'Portafolio de proyectos' }).boundingBox();
      assert.ok(hero.y + hero.height < height, 'Next section must appear in first viewport');
      const enter = await page.getByRole('button', { name: 'Entrar a Kliniu', exact: true }).boundingBox();
      const selector = await page.getByRole('group', { name: 'Seleccionar proyecto', exact: true }).boundingBox();
      assert.ok(enter.y + enter.height < selector.y, 'Hero action must not overlap the project index');
      if (width === 1440 || width === 390) {
        await page.getByRole('button', { name: 'Seleccionar Kliniu', exact: true }).click();
        await page.getByRole('button', { name: 'Kliniu: Compra', exact: true }).click();
        assert.equal(await page.getByRole('button', { name: 'Compra', exact: true }).getAttribute('aria-pressed'), 'true');
        await page.waitForTimeout(1200);
        await page.screenshot({ path: path.join(__dirname, `cinematic-${width}-detail.png`) });
        await page.getByRole('button', { name: 'Entrar a Kliniu', exact: true }).click();
        await page.getByRole('button', { name: 'Cancelar entrada', exact: true }).click();
        await page.waitForTimeout(1500);
        assert.equal(await page.getByRole('heading', { name: 'Daniel Cantor', level: 1 }).count(), 1);
        await page.getByRole('button', { name: 'Entrar a Kliniu', exact: true }).click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(__dirname, `cinematic-${width}-entrance.png`) });
        await page.getByRole('heading', { name: 'Kliniu', exact: true, level: 1 }).waitFor();
        await page.waitForFunction(() => window.__transitions.at(-1)?.finished);
        const transition = await page.evaluate(() => window.__transitions.at(-1));
        assert.equal(transition.source, true);
        assert.equal(transition.ready, true, transition.error);
        await page.screenshot({ path: path.join(__dirname, `cinematic-${width}-case.png`) });
        await page.getByRole('button', { name: 'Volver a la ciudad', exact: true }).click();
        await page.getByRole('heading', { name: 'Daniel Cantor', level: 1 }).waitFor();
        results.push({ width, height, transition });
      } else results.push({ width, height });
      await context.close();
    }
    for (const mode of ['reduced', 'no-webgl', 'no-transition', 'failed-preview']) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference' });
      await context.addInitScript(mode => {
        if (mode === 'no-transition') Object.defineProperty(document, 'startViewTransition', { value: undefined });
        if (mode === 'no-webgl') {
          const original = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function(type, ...args) {
            return type.startsWith('webgl') ? null : original.call(this, type, ...args);
          };
        }
      }, mode);
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      if (mode === 'failed-preview') await page.route('**/projects/kliniu-desktop.png', route => route.abort());
      await page.goto(baseURL);
      await page.getByRole('button', { name: 'Explorar en 3D', exact: true }).click();
      if (mode === 'no-webgl') {
        await page.getByText('Tu navegador no dispone de esta vista 3D.', { exact: false }).waitFor();
        assert.equal(await page.locator('canvas').count(), 0);
      } else {
        await page.locator('canvas').waitFor();
        await page.waitForTimeout(1500);
      }
      await page.getByRole('button', { name: 'Entrar a Kliniu' }).focus();
      await page.keyboard.press('Enter');
      await page.getByRole('heading', { name: 'Kliniu', exact: true, level: 1 }).waitFor();
      await page.getByRole('button', { name: 'Volver a la ciudad', exact: true }).click();
      await page.getByRole('heading', { name: 'Daniel Cantor', level: 1 }).waitFor();
      results.push({ mode, passed: true });
      await context.close();
    }
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ passed: true, results }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
