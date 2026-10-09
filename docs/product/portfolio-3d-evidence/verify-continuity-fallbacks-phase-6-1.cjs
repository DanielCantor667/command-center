const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const base = process.env.BASE_URL || 'http://localhost:3001';
const modes = ['no-webgl', 'slow-model', 'failed-model', 'context-loading', 'context-ready', 'reduced', 'no-transition', 'broken-transition', 'cancel-skip'];
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = [];
  try {
    for (const mode of modes) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference' });
      if (mode === 'no-webgl') await context.addInitScript(() => {
        const get = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (type, ...args) { return type.startsWith('webgl') ? null : get.call(this, type, ...args); };
      });
      if (mode.includes('transition')) await context.addInitScript(mode => {
        document.startViewTransition = mode === 'no-transition' ? undefined : () => { throw new Error('Unavailable transition'); };
      }, mode);
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => { if (!(mode === 'failed-model' && e.message.includes('Could not load'))) errors.push(e.message); });
      let release;
      const held = new Promise(resolve => { release = resolve; });
      if (mode === 'slow-model' || mode === 'context-loading') await page.route('**/models/workshop/*.glb', async route => { await held; await route.abort().catch(() => {}); });
      if (mode === 'failed-model') await page.route('**/models/workshop/*.glb', route => route.abort());
      await page.goto(base);
      await page.getByRole('button', { name: 'Seleccionar Drokex', exact: true }).click();
      if (mode === 'context-loading' || mode === 'context-ready') {
        if (mode === 'context-ready') await page.waitForFunction(() => !document.querySelector('[aria-label="Iluminación nocturna"]')?.disabled);
        await page.locator('#inicio canvas').waitFor({ state: 'attached' });
        console.log(mode, await page.locator('#inicio canvas').evaluate(canvas => { const gl = canvas.getContext('webgl2'); gl.getExtension('WEBGL_lose_context').loseContext(); return { width: canvas.width, lost: gl.isContextLost() }; }));
        try { await page.getByText('Tu navegador no dispone de esta vista 3D.', { exact: false }).waitFor({ timeout: 5000 }); }
        catch (error) { console.log(await page.locator('#inicio').innerText()); throw error; }
      }
      const direct = ['no-webgl', 'slow-model', 'failed-model', 'context-loading', 'context-ready', 'reduced'].includes(mode);
      if (!direct || mode === 'reduced') await page.waitForFunction(() => !document.querySelector('[aria-label="Iluminación nocturna"]')?.disabled);
      if (mode === 'slow-model') assert.ok(await page.getByRole('img', { name: 'Maqueta del taller de Daniel con sus cuatro proyectos' }).isVisible());
      const enter = page.getByRole('button', { name: 'Entrar a Drokex', exact: true });
      await enter.click();
      if (mode === 'cancel-skip') {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(2800);
        assert.equal(await enter.isVisible(), true);
        await enter.click();
        await page.getByRole('button', { name: 'Omitir entrada', exact: true }).click();
      }
      await page.getByRole('heading', { name: 'Drokex', level: 1, exact: true }).waitFor({ timeout: direct ? 2500 : 6000 });
      assert.equal(await page.getByRole('button', { name: 'Cancelar entrada', exact: true }).count(), 0);
      assert.deepEqual(errors, []);
      release();
      results.push({ mode, passed: true });
      console.log(mode, 'passed');
      await context.close();
    }
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(base);
    await page.waitForFunction(() => !document.querySelector('[aria-label="Iluminación nocturna"]')?.disabled);
    await page.getByRole('button', { name: 'Entrar a Kliniu', exact: true }).click();
    await page.getByRole('heading', { name: 'Kliniu', level: 1, exact: true }).waitFor();
    await page.getByRole('button', { name: /Siguiente proyecto/ }).click();
    await page.getByRole('heading', { name: "L'ORIGINE", level: 1, exact: true }).waitFor();
    assert.equal(await page.getByRole('heading', { name: "L'ORIGINE", level: 1, exact: true }).evaluate(e => e === document.activeElement), true);
    await page.getByRole('button', { name: 'Volver a la ciudad', exact: true }).click();
    await page.getByRole('button', { name: "Entrar a L'ORIGINE", exact: true }).waitFor();
    assert.equal(await page.locator('main[data-reveal]').getAttribute('data-reveal'), 'false');
    assert.equal(await page.locator('#inicio').getAttribute('data-detail'), 'true');
    await page.getByRole('button', { name: "Entrar a L'ORIGINE", exact: true }).click();
    await page.getByRole('button', { name: 'Tecnologías', exact: true }).click();
    assert.equal(await page.evaluate(() => location.hash), '#tecnologias');
    await page.waitForTimeout(400);
    assert.ok(await page.evaluate(() => scrollY > 500));
    results.push({ mode: 'next-case-and-section-priority', passed: true });
    await context.close();
    console.log(JSON.stringify({ passed: true, results }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
