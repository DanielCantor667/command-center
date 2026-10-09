// Export the landing poster from the actual GLB/Three.js scene, without UI.
const path = require('node:path');
const { chromium } = require('/Users/creativo/Documents/kliniu/node_modules/playwright');
const sharp = require('/Users/creativo/Documents/kliniu/node_modules/sharp');

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    await page.addInitScript(() => {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
        supportsFiber: true, renderers: new Map(),
        inject(renderer) { const id = this.renderers.size + 1; this.renderers.set(id, renderer); return id; },
        onCommitFiberRoot(_id, root) {
          const store = root?.containerInfo;
          const state = store?.getState?.();
          if (state?.gl?.isWebGLRenderer && state.gl.domElement.closest('[data-world-canvas]')) window.__posterStore = store;
        },
        onCommitFiberUnmount() {}, onPostCommitFiberRoot() {},
      };
    });
    await page.goto(process.env.BASE_URL || 'http://localhost:3000');
    await page.getByRole('button', { name: 'Entrar al taller', exact: true }).click();
    await page.locator('main[data-workshop-state="exploring"][data-world-point="hub"]').waitFor({ timeout: 60000 });
    await page.addStyleTag({ content: 'main > :not([data-world-canvas]) {visibility:hidden!important} [data-world-canvas] button {visibility:hidden!important} nextjs-portal {display:none!important}' });
    await page.evaluate(() => {
      const state = window.__posterStore.getState();
      state.set({ frameloop: 'never' });
      // A wider review pose shows the facade sign. Navigation keeps its 7.1 poses.
      state.camera.position.set(0, 1.65, 17);
      state.camera.lookAt(0, 2, -4);
      state.camera.updateMatrixWorld();
      state.scene.traverse(object => {
        if (object.isGroup && Math.abs(object.position.z - 8.05) < .01) object.position.x = -1.8;
      });
      state.gl.shadowMap.needsUpdate = true;
      state.gl.render(state.scene, state.camera);
    });
    const source = path.join(__dirname, 'phase72-poster-source.png');
    await page.screenshot({ path: source });
    const destination = path.resolve(__dirname, '../../../apps/web/public/experience/workshop-entrance-v2.webp');
    await sharp(source).webp({ quality: 86 }).toFile(destination);
    console.log(JSON.stringify({ source, destination, pose: [0, 1.65, 17], closedDoor: true }));
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
