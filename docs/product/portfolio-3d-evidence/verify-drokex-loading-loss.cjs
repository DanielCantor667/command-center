const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    let release;
    const held = new Promise(resolve => { release = resolve; });
    await page.route('**/drokex-interactive-v4.glb', async route => {
      await held;
      await route.continue().catch(() => {});
    });
    try {
      await page.goto(process.env.BASE_URL || 'http://localhost:3001');
      await page.getByRole('button', { name: 'Seleccionar Drokex', exact: true }).click();
      await page.getByRole('button', { name: 'Entrar a Drokex', exact: true }).click();
      const study = page.getByRole('region', { name: 'Comercio conectado.' });
      await study.getByRole('button', { name: 'Explorar red en 3D', exact: true }).click();
      await study.locator('canvas').waitFor();
      await page.waitForTimeout(600);
      assert.equal(await page.locator('#drokex-study').getAttribute('data-live'), 'false');
      await study.locator('canvas').evaluate(c => c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
      await study.getByRole('status').waitFor({ timeout: 3000 });
      assert.equal(await study.locator('canvas').count(), 0);
      release();
      await study.getByRole('button', { name: 'Plataforma', exact: true }).click();
      await study.getByRole('link', { name: 'Ampliar plataforma' }).waitFor();
      console.log('PASS: context loss during suspended GLB load retains fallback');
    } finally { release(); }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
