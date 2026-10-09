const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/Users/creativo/Documents/kliniu/node_modules/playwright');
const sharp = require(process.env.SHARP_PATH || '/Users/creativo/Documents/kliniu/node_modules/sharp');
const base = process.env.BASE_URL || 'http://localhost:3000';
const imagePath = name => path.join(__dirname, `phase71-${name}.png`);
const game = page => page.locator('main[data-workshop-state]');
const stable = async (page, point) => {
  await page.locator(`main[data-workshop-state="exploring"][data-world-point="${point}"]`).waitFor({ timeout: 30000 });
  await page.waitForFunction(() => !document.documentElement.dataset.portfolioTransition);
  await page.waitForTimeout(180);
};
const enter = async page => { await page.getByRole('button', { name: 'Entrar al taller', exact: true }).click(); await stable(page, 'hub'); };

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = [];
  try {
    for (const [width, height] of [[1440,1000],[1920,1080],[390,844],[320,568]]) {
      const context = await browser.newContext({ viewport: { width, height } });
      const page = await context.newPage();
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await page.goto(base);
      assert.equal(await page.locator('canvas').count(), 0, 'No GPU before activation');
      await page.screenshot({ path: imagePath(`${width}-landing`) });
      const start = performance.now();
      await enter(page);
      const entryMs = Math.round(performance.now() - start);
      await page.screenshot({ path: imagePath(`${width}-hub`) });
      await page.getByRole('button', { name: 'Ir a Kliniu', exact: true }).click();
      await page.getByRole('button', { name: 'Cancelar recorrido', exact: true }).click();
      await stable(page, 'hub');
      assert.equal(await page.getByRole('button', { name: 'El taller', exact: true }).evaluate(e => e === document.activeElement), true, 'Pointer cancellation restores focus');
      await page.getByRole('button', { name: 'Mesa de trabajo', exact: true }).last().click();
      await stable(page, 'workbench');
      await page.getByRole('button', { name: 'Ir a Kliniu', exact: true }).click();
      await stable(page, 'kliniu');
      const canvas = page.locator('canvas');
      const bounds = await canvas.boundingBox();
      await page.mouse.move(bounds.x + bounds.width * .4, bounds.y + bounds.height * .18);
      await page.mouse.down();
      await page.mouse.move(bounds.x + bounds.width * .46, bounds.y + bounds.height * .2, { steps: 8 });
      await page.mouse.up();
      assert.equal(await game(page).getAttribute('data-world-point'), 'kliniu', 'Drag does not activate a destination');
      const before = await canvas.screenshot();
      await page.screenshot({ path: imagePath(`${width}-kliniu`) });
      const open = page.getByRole('button', { name: 'Abrir caso de Kliniu', exact: true });
      await open.click();
      await page.getByRole('heading', { name: 'Kliniu', exact: true, level: 1 }).waitFor();
      await page.waitForURL(/project=kliniu/);
      await page.getByRole('button', { name: 'Volver al taller', exact: true }).click();
      await stable(page, 'kliniu');
      assert.equal(await page.getByRole('button', { name: 'Abrir caso de Kliniu', exact: true }).evaluate(e => e === document.activeElement), true, 'Restored inspection focus');
      const after = await page.locator('canvas').screenshot();
      const [a,b] = await Promise.all([sharp(before).raw().toBuffer(), sharp(after).raw().toBuffer()]);
      assert.equal(a.length, b.length);
      let diff = 0; for (let i = 0; i < a.length; i++) diff += Math.abs(a[i] - b[i]);
      const cameraDiff = diff / a.length;
      assert.ok(cameraDiff < 2, `Camera/render restore mean pixel difference ${cameraDiff}`);
      await page.screenshot({ path: imagePath(`${width}-return`) });
      await page.keyboard.press('Escape');
      await stable(page, 'hub');
      assert.equal(await page.getByRole('button', { name: 'El taller', exact: true }).evaluate(e => e === document.activeElement), true, 'Escape restores navigation focus');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'No overflow');
      const glbBytes = await page.evaluate(() => performance.getEntriesByType('resource').filter(e => e.name.includes('kliniu-interactive-v4.glb')).reduce((sum,e) => sum + e.decodedBodySize, 0));
      assert.deepEqual(errors, []);
      results.push({ width, height, entryMs, glbBytes, cameraDiff });
      await context.close();
    }

    const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const p = await reduced.newPage();
    await p.goto(base); await enter(p);
    await p.getByRole('button', { name: 'Ir a Kliniu', exact: true }).click(); await stable(p, 'kliniu');
    await p.getByRole('button', { name: 'Abrir caso de Kliniu', exact: true }).click();
    await p.waitForURL(/project=kliniu/);
    await p.goBack(); await stable(p, 'kliniu');
    await p.goForward(); await p.getByRole('heading', { name: 'Kliniu', exact: true, level: 1 }).waitFor();
    await p.goto(`${base}/?project=kliniu`); await p.getByRole('heading', { name: 'Kliniu', exact: true, level: 1 }).waitFor();
    await reduced.close();

    const failed = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const failurePage = await failed.newPage();
    await failurePage.route('**/kliniu-interactive-v4.glb', route => route.fulfill({ status: 404, body: 'missing' }));
    await failurePage.goto(base); await failurePage.getByRole('button', { name: 'Entrar al taller', exact: true }).click();
    await failurePage.getByRole('heading', { name: 'El taller no está disponible' }).waitFor();
    await failurePage.screenshot({ path: imagePath('failed-glb') });
    await failurePage.unroute('**/kliniu-interactive-v4.glb');
    await failurePage.getByRole('button', { name: 'Reintentar', exact: true }).click(); await stable(failurePage, 'hub');
    await failurePage.locator('canvas').evaluate(canvas => canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await failurePage.getByRole('heading', { name: 'El taller no está disponible' }).waitFor();
    await failurePage.screenshot({ path: imagePath('context-loss') });
    await failurePage.getByRole('button', { name: 'Ver portafolio', exact: true }).click();
    await failurePage.getByRole('heading', { name: 'Daniel Cantor', exact: true }).waitFor();
    await failed.close();

    const pendingGpu = await browser.newContext();
    const pendingPage = await pendingGpu.newPage(); let releaseGpu; let receivedGpu;
    const gpuRequested = new Promise(resolve => { receivedGpu = resolve; });
    await pendingPage.route('**/kliniu-interactive-v4.glb', async route => { await new Promise(resolve => { releaseGpu = resolve; receivedGpu(); }); await route.continue().catch(() => {}); });
    await pendingPage.goto(base); await pendingPage.getByRole('button', { name: 'Entrar al taller', exact: true }).click();
    await gpuRequested;
    await pendingPage.locator('canvas').evaluate(canvas => canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await pendingPage.getByRole('heading', { name: 'El taller no está disponible' }).waitFor();
    releaseGpu(); await pendingGpu.close();

    const slow = await browser.newContext({ reducedMotion: 'reduce' });
    const slowPage = await slow.newPage(); let release; let received;
    const requested = new Promise(resolve => { received = resolve; });
    await slowPage.route('**/kliniu-interactive-v4.glb', async route => { await new Promise(resolve => { release = resolve; received(); }); await route.continue().catch(() => {}); });
    await slowPage.goto(base); await slowPage.getByRole('button', { name: 'Entrar al taller', exact: true }).click();
    await requested;
    await slowPage.getByRole('button', { name: 'Cancelar entrada', exact: true }).click();
    release?.(); await slowPage.waitForTimeout(300);
    assert.equal(await game(slowPage).getAttribute('data-workshop-state'), 'landing');
    await slow.close();

    const noGpu = await browser.newContext();
    await noGpu.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(kind, ...args) { return /webgl/.test(kind) ? null : original.call(this, kind, ...args); };
    });
    const fallback = await noGpu.newPage(); await fallback.goto(base);
    await fallback.getByRole('button', { name: 'Entrar al taller', exact: true }).click();
    await fallback.getByRole('heading', { name: 'El taller no está disponible' }).waitFor();
    await fallback.getByRole('button', { name: 'Ver portafolio', exact: true }).click();
    await fallback.getByRole('heading', { name: 'Daniel Cantor', exact: true }).waitFor();
    await noGpu.close();

    const classic = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const legacy = await classic.newPage(); await legacy.goto(`${base}/?view=portfolio`);
    for (const name of ['Kliniu', "L'ORIGINE", '4U Studio Academy', 'Drokex']) {
      await legacy.getByRole('button', { name: `Seleccionar ${name}`, exact: true }).click();
      await legacy.getByRole('button', { name: `Entrar a ${name}`, exact: true }).click();
      await legacy.getByRole('heading', { name, exact: true, level: 1 }).waitFor();
      await legacy.getByRole('button', { name: 'Volver a la ciudad', exact: true }).click();
    }
    await legacy.goto(`${base}/?view=portfolio&project=kliniu`);
    await legacy.getByRole('heading', { name: 'Kliniu', exact: true, level: 1 }).waitFor();
    await legacy.getByRole('button', { name: 'Volver a la ciudad', exact: true }).click();
    await legacy.getByRole('heading', { name: 'Daniel Cantor', exact: true }).waitFor();
    assert.equal(new URL(legacy.url()).searchParams.has('project'), false);
    await legacy.reload(); await legacy.getByRole('heading', { name: 'Daniel Cantor', exact: true }).waitFor();
    await classic.close();
    fs.writeFileSync(path.join(__dirname, 'phase71-results.json'), JSON.stringify({ passed: true, results, scenarios: ['four viewports', 'case return and camera', 'reduced motion', 'browser history', 'direct case', 'GLB 404/retry', 'real context loss', 'context loss while GLB pending', 'cancel slow load', 'no WebGL', 'four classic cases', 'classic direct link/return/reload', 'keyboard focus'] }, null, 2));
    console.log(JSON.stringify({ passed: true, results }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
