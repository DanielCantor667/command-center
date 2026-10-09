// Local browser evidence for Sprint 7 / Phase 7.2. No production instrumentation.
// Run after restarting the checkout's next dev server: node verify-phase-7-2.cjs
// --probe exercises the renderer hook against the current scene without asset assertions.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/Users/creativo/Documents/kliniu/node_modules/playwright');
const sharp = require(process.env.SHARP_PATH || '/Users/creativo/Documents/kliniu/node_modules/sharp');
const { PropertyBinding } = require(path.resolve(__dirname, '../../../apps/web/node_modules/three'));

const base = process.env.BASE_URL || 'http://localhost:3000';
const probe = process.argv.includes('--probe');
const resizeOnly = process.argv.includes('--resize-only');
const memoryResizeProbe = process.argv.includes('--memory-resize-probe');
const output = name => path.join(__dirname, `phase72-${name}`);
const publicRoot = path.resolve(__dirname, '../../../apps/web/public');
const coreUrls = ['/models/workshop-game/workshop-shell-v1.glb', '/models/workshop-game/workshop-door-v1.glb'];
const game = page => page.locator('main[data-workshop-state]');
const results = { passed: false, recordedAt: new Date().toISOString(), base, environment: {}, viewports: [], scenarios: [], limitations: [
  'Local Next dev server; these observations are not production benchmarks.',
  'Mobile viewports use desktop Chrome. Physical mobile GPU, touch ergonomics, heat and battery are not measured.',
  'Core byte budgets below cover the two essential GLB files, including embedded images; JS, CSS and poster are reported separately.',
  'Frame rate covers actual moving camera renders. CPU submit time is not GPU execution time. Idle is measured separately.',
  'Concept comparison is a visual review artifact; no numerical similarity score declares design approval.',
] };
const logs = [];
const contexts = new Set();

function assetInfo(url) {
  const buffer = fs.readFileSync(path.join(publicRoot, url));
  assert.equal(buffer.readUInt32LE(0), 0x46546c67, `${url}: GLB magic`);
  assert.equal(buffer.readUInt32LE(4), 2, `${url}: glTF version`);
  assert.equal(buffer.readUInt32LE(8), buffer.length, `${url}: complete GLB`);
  assert.equal(buffer.readUInt32LE(16), 0x4e4f534a, `${url}: JSON chunk`);
  const json = JSON.parse(buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString('utf8').trim());
  const meshNames = (json.nodes || []).filter(node => node.mesh !== undefined).map(node => node.name).filter(Boolean).map(PropertyBinding.sanitizeNodeName);
  assert.ok(meshNames.length, `${url}: named mesh nodes required for browser proof`);
  return { url, fileBytes: buffer.length, meshNames, materials: (json.materials || []).length, images: (json.images || []).length };
}

// R3F passes its Zustand store as the custom reconciler's containerInfo. Capture
// it through React's DevTools hook in this isolated browser context, preserving
// any existing hook. This fails explicitly if that local renderer contract changes.
function installQaHook(expectedAssets) {
  const qa = window.__WORKSHOP_PHASE72_QA__ = { stores: [], frames: [], states: [], activeMotion: null, activationAt: null, firstUsableFrame: null, expectedAssets };
  const wrapped = new WeakSet();
  const getCurrent = () => {
    for (let i = qa.stores.length - 1; i >= 0; i--) {
      const state = qa.stores[i].getState();
      if (state.gl?.domElement?.isConnected && state.gl.domElement.closest('[data-world-canvas]')) return state;
    }
    return null;
  };
  qa.current = getCurrent;
  qa.nodes = () => {
    const state = getCurrent();
    if (!state) return null;
    const nodes = [];
    state.scene.traverse(object => {
      if (!object.isMesh) return;
      let visible = true;
      for (let parent = object; parent; parent = parent.parent) visible = visible && parent.visible;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      nodes.push({ name: object.name, visible, vertices: object.geometry?.attributes?.position?.count || 0, materials: materials.map(material => ({
        name: material.name, type: material.type, color: material.color?.getHexString() || null,
        roughness: material.roughness ?? null, metalness: material.metalness ?? null,
        map: material.map ? { width: material.map.image?.width ?? null, height: material.map.image?.height ?? null } : null,
      })) });
    });
    return nodes;
  };
  qa.camera = () => {
    const state = getCurrent();
    if (!state) return null;
    return { position: state.camera.position.toArray(), quaternion: state.camera.quaternion.toArray(), fov: state.camera.fov, near: state.camera.near, far: state.camera.far };
  };
  const captureStore = root => {
    const store = root?.containerInfo;
    if (!store?.getState) return;
    const state = store.getState();
    const renderer = state.gl;
    if (!renderer?.isWebGLRenderer || !renderer.domElement?.closest('[data-world-canvas]')) return;
    if (!qa.stores.includes(store)) qa.stores.push(store);
    if (wrapped.has(renderer)) return;
    wrapped.add(renderer);
    const original = renderer.render;
    renderer.render = function (...args) {
      const current = store.getState();
      const main = args[0] === current.scene && args[1] === current.camera;
      const started = performance.now();
      const returned = original.apply(this, args);
      if (main) {
        const at = performance.now();
        const frame = { at, cpuSubmitMs: at - started, rendererFrame: renderer.info.render.frame,
          motion: document.querySelector('main[data-workshop-state]')?.dataset.workshopState === 'moving',
          segment: qa.activeMotion, ...renderer.info.render, memory: { ...renderer.info.memory } };
        qa.frames.push(frame);
        if (!qa.firstUsableFrame && expectedAssets.length && renderer.info.render.triangles > 0 && !renderer.getContext().isContextLost()) {
          const names = new Set((qa.nodes() || []).filter(node => node.visible && node.vertices > 0).map(node => node.name));
          if (expectedAssets.every(asset => asset.meshNames.every(name => names.has(name)))) qa.firstUsableFrame = { at, rendererFrame: frame.rendererFrame };
        }
      }
      return returned;
    };
  };
  const existing = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  const hook = existing || { supportsFiber: true, renderers: new Map(), inject(renderer) { const id = this.renderers.size + 1; this.renderers.set(id, renderer); return id; }, onCommitFiberUnmount() {}, onPostCommitFiberRoot() {} };
  const previousCommit = hook.onCommitFiberRoot;
  hook.onCommitFiberRoot = function (...args) {
    try { captureStore(args[1]); } catch (error) { qa.hookError = String(error); }
    return previousCommit?.apply(this, args);
  };
  if (!existing) window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = hook;
  const recordState = () => {
    const main = document.querySelector('main[data-workshop-state]');
    if (!main) return;
    const last = qa.states[qa.states.length - 1];
    if (!last || last.status !== main.dataset.workshopState || last.point !== main.dataset.worldPoint) {
      qa.states.push({ at: performance.now(), status: main.dataset.workshopState, point: main.dataset.worldPoint });
    }
  };
  const observe = () => { new MutationObserver(recordState).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-workshop-state', 'data-world-point'] }); recordState(); };
  if (document.documentElement) observe(); else document.addEventListener('DOMContentLoaded', observe, { once: true });
}

async function newPage(browser, options = {}, expectedAssets = []) {
  const context = await browser.newContext(options);
  contexts.add(context);
  await context.addInitScript(installQaHook, expectedAssets);
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  const errors = [];
  page.on('pageerror', error => { errors.push(error.message); logs.push({ type: 'pageerror', url: page.url(), message: error.message }); });
  page.on('console', message => { if (['error', 'warning'].includes(message.type())) logs.push({ type: message.type(), url: page.url(), message: message.text() }); });
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  const network = [];
  const requests = new Map();
  cdp.on('Network.requestWillBeSent', event => requests.set(event.requestId, { url: event.request.url }));
  cdp.on('Network.responseReceived', event => Object.assign(requests.get(event.requestId) || {}, { status: event.response.status, mimeType: event.response.mimeType, fromDiskCache: event.response.fromDiskCache || false }));
  cdp.on('Network.loadingFinished', event => { const request = requests.get(event.requestId); if (request) network.push({ ...request, encodedDataLength: event.encodedDataLength }); });
  return { context, page, errors, network };
}

async function close(context) { contexts.delete(context); await context.close(); }
async function stable(page, point) {
  await page.locator(`main[data-workshop-state="exploring"][data-world-point="${point}"]`).waitFor();
  await page.waitForFunction(() => !document.documentElement.dataset.portfolioTransition);
  await page.waitForTimeout(180);
}
async function enter(page) {
  await page.evaluate(() => { window.__WORKSHOP_PHASE72_QA__.activationAt = performance.now(); });
  await page.getByRole('button', { name: 'Entrar al taller', exact: true }).click();
  await stable(page, 'hub');
  await page.waitForFunction(() => !!window.__WORKSHOP_PHASE72_QA__?.current()?.gl);
}
async function screenshot(page, name) { await page.screenshot({ path: output(`${name}.png`) }); }
async function focused(page, name) { return page.getByRole('button', { name, exact: true }).evaluate(element => element === document.activeElement); }
async function loseContext(page) {
  await page.waitForFunction(() => !!window.__WORKSHOP_PHASE72_QA__?.current()?.gl);
  const supported = await page.evaluate(() => {
    const extension = window.__WORKSHOP_PHASE72_QA__.current().gl.getContext().getExtension('WEBGL_lose_context');
    if (!extension) return false;
    extension.loseContext(); return true;
  });
  assert.equal(supported, true, 'Real WEBGL_lose_context extension available');
}
async function movement(page, label, button, point) {
  await page.evaluate(value => { window.__WORKSHOP_PHASE72_QA__.activeMotion = value; }, label);
  await page.getByRole('button', { name: button, exact: true }).last().click();
  await stable(page, point);
  await page.evaluate(() => { window.__WORKSHOP_PHASE72_QA__.activeMotion = null; });
}
function percentile(values, fraction) { const sorted = [...values].sort((a, b) => a - b); return sorted.length ? sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)] : null; }
function summarizeFrames(frames) {
  const intervals = frames.slice(1).map((frame, i) => frame.at - frames[i].at);
  const duration = frames.length > 1 ? frames.at(-1).at - frames[0].at : 0;
  return { actualRenderedFrames: frames.length, sampledMs: duration, fps: duration > 0 ? (frames.length - 1) * 1000 / duration : null,
    medianIntervalMs: percentile(intervals, .5), p95IntervalMs: percentile(intervals, .95),
    medianCpuSubmitMs: percentile(frames.map(frame => frame.cpuSubmitMs), .5), p95CpuSubmitMs: percentile(frames.map(frame => frame.cpuSubmitMs), .95),
    medianDrawCalls: percentile(frames.map(frame => frame.calls), .5), maxDrawCalls: frames.length ? Math.max(...frames.map(frame => frame.calls)) : null,
    maxTriangles: frames.length ? Math.max(...frames.map(frame => frame.triangles)) : null };
}
async function rendererSnapshot(page) {
  return page.evaluate(() => {
    const qa = window.__WORKSHOP_PHASE72_QA__;
    const state = qa.current();
    if (!state) return { unavailable: true, hookError: qa.hookError || null };
    const context = state.gl.getContext();
    const debug = context.getExtension('WEBGL_debug_renderer_info');
    const shadowMaps = [];
    state.scene.traverse(object => {
      if (!object.isLight || !object.castShadow) return;
      shadowMaps.push({ type: object.type, requestedWidth: object.shadow.mapSize.x, requestedHeight: object.shadow.mapSize.y,
        actualWidth: object.shadow.map?.width ?? null, actualHeight: object.shadow.map?.height ?? null });
    });
    return { renderer: context.getParameter(context.RENDERER), vendor: context.getParameter(context.VENDOR), version: context.getParameter(context.VERSION),
      unmaskedRenderer: debug ? context.getParameter(debug.UNMASKED_RENDERER_WEBGL) : null,
      unmaskedVendor: debug ? context.getParameter(debug.UNMASKED_VENDOR_WEBGL) : null,
      dpr: state.gl.getPixelRatio(), browserDpr: devicePixelRatio, canvas: { width: state.gl.domElement.width, height: state.gl.domElement.height },
      viewport: { innerWidth, innerHeight, visualWidth: visualViewport?.width ?? null, storeWidth: state.size.width, storeHeight: state.size.height,
        meta: document.querySelector('meta[name="viewport"]')?.content ?? null, canvasRect: { width: state.gl.domElement.getBoundingClientRect().width, height: state.gl.domElement.getBoundingClientRect().height } },
      shadowMaps, shadowAutoUpdate: state.gl.shadowMap.autoUpdate,
      info: { render: { ...state.gl.info.render }, memory: { ...state.gl.info.memory }, programs: state.gl.info.programs?.length ?? null },
      camera: qa.camera(), meshNodes: qa.nodes(), firstUsableFrame: qa.firstUsableFrame, activationAt: qa.activationAt,
      entryMs: qa.states.find(state => state.status === 'exploring')?.at - qa.activationAt, states: qa.states, hookError: qa.hookError || null };
  });
}
async function pixelDifference(a, b) {
  const [before, after] = await Promise.all([sharp(a).ensureAlpha().raw().toBuffer(), sharp(b).ensureAlpha().raw().toBuffer()]);
  assert.equal(before.length, after.length);
  let difference = 0;
  for (let i = 0; i < before.length; i++) difference += Math.abs(before[i] - after[i]);
  return difference / before.length;
}
function compareCamera(before, after) {
  assert.ok(before && after, 'Real camera captured before/after case');
  for (const field of ['position', 'quaternion']) for (let i = 0; i < before[field].length; i++) assert.ok(Math.abs(before[field][i] - after[field][i]) < 1e-6, `Camera ${field}[${i}] restored`);
  for (const field of ['fov', 'near', 'far']) assert.equal(before[field], after[field], `Camera ${field} restored`);
}

async function captureReviewEntrance(page) {
  const before = await page.evaluate(() => window.__WORKSHOP_PHASE72_QA__.camera());
  const count = await page.evaluate(() => {
    const qa = window.__WORKSHOP_PHASE72_QA__; const state = qa.current(); const count = qa.frames.length;
    state.camera.position.set(-1.8, 1.65, 14); state.camera.lookAt(-.5, 1.6, -4); state.camera.updateMatrixWorld(); state.invalidate(); return count;
  });
  try {
    await page.waitForFunction(previous => window.__WORKSHOP_PHASE72_QA__.frames.length > previous, count);
    await page.locator('canvas').screenshot({ path: output('1440-browser-entrance.png') });
  } finally {
    const restoredCount = await page.evaluate(camera => {
      const qa = window.__WORKSHOP_PHASE72_QA__; const state = qa.current(); const count = qa.frames.length;
      state.camera.position.fromArray(camera.position); state.camera.quaternion.fromArray(camera.quaternion); state.camera.updateMatrixWorld(); state.invalidate(); return count;
    }, before);
    await page.waitForFunction(previous => window.__WORKSHOP_PHASE72_QA__.frames.length > previous, restoredCount);
    compareCamera(before, await page.evaluate(() => window.__WORKSHOP_PHASE72_QA__.camera()));
  }
  const width = 980, height = 700, gap = 20, header = 65;
  const [concept, browserImage] = await Promise.all([
    sharp(path.join(__dirname, '../workshop-game-concept/2026-10-07-entrada-conceptual.png')).resize(width, height, { fit: 'contain', background: '#e7e6de' }).png().toBuffer(),
    sharp(output('1440-browser-entrance.png')).resize(width, height, { fit: 'contain', background: '#e7e6de' }).png().toBuffer(),
  ]);
  const labels = Buffer.from(`<svg width="${width * 2 + gap}" height="${header}"><style>text{font:22px sans-serif;fill:#253e32}</style><text x="20" y="38">Concepto aprobado (imagegen)</text><text x="${width + gap + 20}" y="38">GLB en Chrome — cámara de revisión de entrada</text></svg>`);
  await sharp({ create: { width: width * 2 + gap, height: height + header, channels: 3, background: '#e7e6de' } }).composite([{ input: labels, top: 0, left: 0 }, { input: concept, top: header, left: 0 }, { input: browserImage, top: header, left: width + gap }]).png().toFile(output('concept-vs-browser.png'));
}

async function viewportScenario(browser, width, height, assets) {
  const { context, page, errors, network } = await newPage(browser, { viewport: { width, height }, deviceScaleFactor: 2, reducedMotion: 'no-preference', isMobile: width <= 700, hasTouch: width <= 700 }, assets);
  await page.goto(base);
  assert.equal(await page.locator('canvas').count(), 0, 'No GPU before activation');
  assert.equal(network.some(resource => coreUrls.some(url => new URL(resource.url).pathname === url)), false, 'No GLB before activation');
  await screenshot(page, `${width}-landing`);
  await enter(page);
  const entered = await rendererSnapshot(page);
  assert.equal(entered.unavailable, undefined, 'Captured actual R3F renderer');
  assert.equal(entered.hookError, null);
  assert.ok(entered.firstUsableFrame, 'Both GLB mesh sets present in a useful rendered frame');
  const firstMoving = entered.states.find(state => state.status === 'moving');
  assert.ok(firstMoving && firstMoving.at >= entered.firstUsableFrame.at, 'Loader completes after useful main frame');
  assert.ok(entered.dpr <= (width <= 700 ? 1 : 1.5), `DPR ${entered.dpr} within ${width}px profile budget (storeWidth ${entered.viewport.storeWidth}, innerWidth ${entered.viewport.innerWidth})`);
  assert.equal(await page.locator('canvas').count(), 1, 'Single main canvas');
  await screenshot(page, `${width}-hub`);

  const timings = await page.evaluate(urls => {
    const entries = performance.getEntriesByType('resource');
    return { core: urls.map(url => {
      const matches = entries.filter(entry => new URL(entry.name).pathname === url);
      return { url, count: matches.length, transferSize: matches.reduce((sum, entry) => sum + entry.transferSize, 0), encodedBodySize: matches.reduce((sum, entry) => sum + entry.encodedBodySize, 0), decodedBodySize: matches.reduce((sum, entry) => sum + entry.decodedBodySize, 0), responseEnd: Math.max(0, ...matches.map(entry => entry.responseEnd)) };
    }), totalTransferSize: entries.reduce((sum, entry) => sum + entry.transferSize, 0), totalEncodedBodySize: entries.reduce((sum, entry) => sum + entry.encodedBodySize, 0), totalDecodedBodySize: entries.reduce((sum, entry) => sum + entry.decodedBodySize, 0) };
  }, coreUrls);
  for (const asset of assets) {
    const timing = timings.core.find(resource => resource.url === asset.url);
    const responses = network.filter(resource => new URL(resource.url).pathname === asset.url);
    assert.equal(timing.count, 1, `${asset.url}: one complete core load`);
    assert.ok(timing.transferSize > 0 && timing.encodedBodySize > 0, `${asset.url}: observed cold transfer bytes`);
    assert.equal(timing.decodedBodySize, asset.fileBytes, `${asset.url}: full deployed GLB body`);
    assert.ok(timing.responseEnd <= entered.firstUsableFrame.at + 1, `${asset.url}: complete before useful frame`);
    assert.equal(responses.length, 1, `${asset.url}: one network response`);
    assert.equal(responses[0].status, 200, `${asset.url}: HTTP 200`);
    assert.equal(responses[0].fromDiskCache, false, `${asset.url}: cold cache`);
    timing.cdpEncodedDataLength = responses[0].encodedDataLength;
  }
  const coreEncodedBytes = timings.core.reduce((sum, resource) => sum + resource.encodedBodySize, 0);
  const coreDecodedBytes = timings.core.reduce((sum, resource) => sum + resource.decodedBodySize, 0);
  const byteBudget = (width <= 700 ? 5 : 8) * 1000 * 1000;
  assert.ok(coreEncodedBytes <= byteBudget, `Essential compressed GLB ${coreEncodedBytes} bytes within ${byteBudget}`);

  await page.getByRole('button', { name: 'Ir a Kliniu', exact: true }).click();
  await page.getByRole('button', { name: 'Cancelar recorrido', exact: true }).click();
  await stable(page, 'hub');
  assert.equal(await focused(page, 'El taller'), true, 'Pointer cancellation restores focus');
  for (const [label, button, point] of [['hub-to-workbench', 'Mesa de trabajo', 'workbench'], ['workbench-to-kliniu', 'Ir a Kliniu', 'kliniu'], ['kliniu-to-hub', 'El taller', 'hub'], ['hub-to-kliniu', 'Ir a Kliniu', 'kliniu']]) {
    await movement(page, label, button, point);
    if (point === 'workbench') await screenshot(page, `${width}-workbench`);
  }
  const canvas = page.locator('canvas'); const bounds = await canvas.boundingBox();
  await page.mouse.move(bounds.x + bounds.width * .4, bounds.y + bounds.height * .18);
  await page.mouse.down(); await page.mouse.move(bounds.x + bounds.width * .46, bounds.y + bounds.height * .2, { steps: 8 }); await page.mouse.up();
  assert.equal(await game(page).getAttribute('data-world-point'), 'kliniu', 'Drag does not select destination');
  await page.waitForTimeout(150);
  const beforeImage = await canvas.screenshot();
  const beforeCamera = await page.evaluate(() => window.__WORKSHOP_PHASE72_QA__.camera());
  await screenshot(page, `${width}-kliniu`);
  const frames = await page.evaluate(() => window.__WORKSHOP_PHASE72_QA__.frames.filter(frame => frame.motion && frame.segment));
  const motion = [...new Set(frames.map(frame => frame.segment))].map(segment => ({ segment, ...summarizeFrames(frames.filter(frame => frame.segment === segment)) }));
  assert.equal(motion.length, 4, 'Measured all real camera journeys');
  for (const sample of motion) assert.ok(sample.actualRenderedFrames >= 3 && sample.fps > 0 && sample.maxTriangles > 0 && sample.maxDrawCalls > 0, `Actual moving renders for ${sample.segment}`);

  await page.waitForTimeout(400);
  const idleStart = await page.evaluate(() => ({ at: performance.now(), count: window.__WORKSHOP_PHASE72_QA__.frames.length }));
  await page.waitForTimeout(1100);
  const idleEnd = await page.evaluate(() => ({ at: performance.now(), count: window.__WORKSHOP_PHASE72_QA__.frames.length }));
  const idle = { sampledMs: idleEnd.at - idleStart.at, actualRenderedFrames: idleEnd.count - idleStart.count };
  assert.equal(idle.actualRenderedFrames, 0, 'Demand renderer pauses while idle');

  await page.getByRole('button', { name: 'Abrir caso de Kliniu', exact: true }).click();
  await page.getByRole('heading', { name: 'Kliniu', exact: true, level: 1 }).waitFor(); await page.waitForURL(/project=kliniu/);
  await page.getByRole('button', { name: 'Volver al taller', exact: true }).click(); await stable(page, 'kliniu');
  assert.equal(await focused(page, 'Abrir caso de Kliniu'), true, 'Restored inspection focus');
  const afterCamera = await page.evaluate(() => window.__WORKSHOP_PHASE72_QA__.camera()); compareCamera(beforeCamera, afterCamera);
  const cameraPixelDifference = await pixelDifference(beforeImage, await page.locator('canvas').screenshot());
  assert.ok(cameraPixelDifference < 2, `Camera image restored: mean pixel difference ${cameraPixelDifference}/255`);
  await screenshot(page, `${width}-return`);
  await page.keyboard.press('Escape'); await stable(page, 'hub');
  assert.equal(await focused(page, 'El taller'), true, 'Escape restores navigation focus');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'No horizontal overflow');
  if (width === 1440) await captureReviewEntrance(page);
  const settled = await rendererSnapshot(page);
  assert.deepEqual(errors, [], 'No uncaught page errors');
  results.viewports.push({ width, height, deviceScaleFactor: 2, mobileEmulation: width <= 700, entryMs: entered.entryMs,
    firstUsableFrameMs: entered.firstUsableFrame.at - entered.activationAt, timings, coreEncodedBytes, coreDecodedBytes, byteBudget,
    renderer: settled, motion, idle, cameraBefore: beforeCamera, cameraAfter: afterCamera, cameraPixelDifference });
  await close(context);
}

async function heldAsset(browser, asset, mode, assets) {
  const { context, page } = await newPage(browser, { reducedMotion: 'reduce' }, assets);
  let release;
  let requestedResolve;
  const requested = new Promise(resolve => { requestedResolve = resolve; });
  const matcher = `**${asset.url}`;
  await page.route(matcher, async route => { await new Promise(resolve => { release = resolve; requestedResolve(); }); await route.continue().catch(() => {}); });
  try {
    await page.goto(base); await page.getByRole('button', { name: 'Entrar al taller', exact: true }).click();
    let requestTimer;
    await Promise.race([requested, new Promise((_, reject) => { requestTimer = setTimeout(() => reject(new Error(`No request for held ${asset.url}`)), 30000); })]).finally(() => clearTimeout(requestTimer));
    assert.equal(await game(page).getAttribute('data-workshop-state'), 'loading', `${asset.url}: loader waits for asset`);
    assert.equal(await page.getByRole('progressbar', { name: 'Carga del taller' }).getAttribute('aria-valuenow'), null, 'No fictitious loading percentage');
    assert.equal(await page.getByRole('button', { name: 'Ver portafolio', exact: true }).isVisible(), true, 'Alternative while pending');
    await page.waitForTimeout(200);
    assert.equal(await game(page).getAttribute('data-workshop-state'), 'loading', 'No premature scene-ready');
    if (mode === 'context-loss') {
      await loseContext(page); await page.getByRole('heading', { name: 'El taller no está disponible' }).waitFor();
      await screenshot(page, `${path.basename(asset.url, '.glb')}-pending-context-loss`);
      release(); await page.waitForTimeout(350);
      assert.equal(await game(page).getAttribute('data-workshop-state'), 'error', 'Late resource cannot clear GPU failure');
      await page.getByRole('button', { name: 'Ver portafolio', exact: true }).click();
      await page.getByRole('heading', { name: 'Daniel Cantor', exact: true }).waitFor();
    } else if (mode === 'portfolio') {
      await page.getByRole('button', { name: 'Ver portafolio', exact: true }).click();
      await page.getByRole('heading', { name: 'Daniel Cantor', exact: true }).waitFor(); release(); await page.waitForTimeout(350);
      assert.equal(await game(page).count(), 0, 'Late GLB cannot reopen abandoned workshop');
    } else {
      await page.getByRole('button', { name: 'Cancelar entrada', exact: true }).click(); release(); await page.waitForTimeout(350);
      assert.equal(await game(page).getAttribute('data-workshop-state'), 'landing', 'Late first frame cannot restart cancelled entry');
      assert.equal(await page.locator('canvas').count(), 0, 'Cancelled GPU removed');
      assert.equal(await focused(page, 'Entrar al taller'), true, 'Cancelled load restores focus');
    }
    results.scenarios.push({ name: `${mode} while ${path.basename(asset.url)} pending`, passed: true });
  } finally { release?.(); await close(context); }
}

async function failureAndRetry(browser, asset, assets) {
  const { context, page } = await newPage(browser, { viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }, assets);
  const matcher = `**${asset.url}`;
  await page.route(matcher, route => route.fulfill({ status: 404, contentType: 'text/plain', body: 'missing' }));
  await page.goto(base); await page.getByRole('button', { name: 'Entrar al taller', exact: true }).click();
  await page.getByRole('heading', { name: 'El taller no está disponible' }).waitFor();
  await screenshot(page, `${path.basename(asset.url, '.glb')}-404`);
  await page.unroute(matcher);
  await page.getByRole('button', { name: 'Reintentar', exact: true }).click(); await stable(page, 'hub');
  const retried = await rendererSnapshot(page);
  assert.ok(retried.firstUsableFrame, 'Retry actually renders all essential assets');
  results.scenarios.push({ name: `${path.basename(asset.url)} 404 / retry`, passed: true });
  await loseContext(page); await page.getByRole('heading', { name: 'El taller no está disponible' }).waitFor();
  await screenshot(page, `${path.basename(asset.url, '.glb')}-ready-context-loss`);
  await page.getByRole('button', { name: 'Ver portafolio', exact: true }).click();
  await page.getByRole('heading', { name: 'Daniel Cantor', exact: true }).waitFor();
  results.scenarios.push({ name: `ready context loss after ${path.basename(asset.url)} retry`, passed: true });
  await close(context);
}

async function reducedHistoryAndKeyboard(browser, assets) {
  const { context, page, errors } = await newPage(browser, { viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }, assets);
  await page.goto(base); await enter(page);
  let reached = false;
  for (let i = 0; i < 15; i++) {
    if (await focused(page, 'Ir a Kliniu')) { reached = true; break; }
    await page.keyboard.press('Tab');
  }
  assert.equal(reached, true, 'Keyboard reaches equivalent destination');
  await page.keyboard.press('Enter'); await stable(page, 'kliniu');
  assert.equal(await focused(page, 'Abrir caso de Kliniu'), true);
  await page.keyboard.press('Enter'); await page.waitForURL(/project=kliniu/);
  await page.goBack(); await stable(page, 'kliniu');
  await page.goForward(); await page.getByRole('heading', { name: 'Kliniu', exact: true, level: 1 }).waitFor();
  await page.goto(`${base}/?project=kliniu`); await page.getByRole('heading', { name: 'Kliniu', exact: true, level: 1 }).waitFor();
  assert.deepEqual(errors, []);
  results.scenarios.push({ name: 'reduced motion / keyboard / browser history / direct case', passed: true });
  await close(context);
}

async function resizeProfiles(browser, assets, memoryProbe = false) {
  const { context, page, errors, network } = await newPage(browser, { viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2, reducedMotion: 'reduce' }, assets);
  await page.goto(base); await enter(page);
  const initialCamera = await page.evaluate(() => {
    const qa = window.__WORKSHOP_PHASE72_QA__; qa.resizeRenderer = qa.current().gl; return qa.camera();
  });
  const snapshots = [];
  const profiles = [[1440, 1000, 1.5, 2048, 'resize-desktop']];
  if (memoryProbe) {
    for (let i = 0; i < 10; i++) profiles.push(i % 2 === 0 ? [390, 844, 1, 1024, `memory-resize-${i + 1}-mobile`] : [1440, 1000, 1.5, 2048, `memory-resize-${i + 1}-desktop`]);
  } else profiles.push([390, 844, 1, 1024, 'resize-mobile'], [1440, 1000, 1.5, 2048, 'resize-desktop-return']);
  for (const [width, height, dpr, mapSize, name] of profiles) {
    await page.setViewportSize({ width, height });
    await page.waitForFunction(expected => {
      const state = window.__WORKSHOP_PHASE72_QA__?.current();
      if (!state || state.size.width !== expected.width || state.gl.getPixelRatio() !== expected.dpr) return false;
      let valid = false;
      state.scene.traverse(object => {
        if (object.isDirectionalLight && object.castShadow) valid = object.shadow.map?.width === expected.mapSize && object.shadow.map?.height === expected.mapSize;
      });
      return valid;
    }, { width, dpr, mapSize });
    await stable(page, 'hub');
    if (memoryProbe) await page.waitForTimeout(500);
    const snapshot = await rendererSnapshot(page);
    compareCamera(initialCamera, snapshot.camera);
    assert.equal(await page.evaluate(() => {
      const qa = window.__WORKSHOP_PHASE72_QA__; return qa.current().gl === qa.resizeRenderer;
    }), true, 'Resize preserves main renderer');
    assert.equal(snapshot.shadowAutoUpdate, false, 'Static shadow profile preserved');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Resize has no horizontal overflow');
    if (!memoryProbe) await screenshot(page, name);
    snapshots.push({ width, height, dpr: snapshot.dpr, canvas: snapshot.canvas, shadowMaps: snapshot.shadowMaps, memory: snapshot.info.memory, camera: snapshot.camera });
  }
  for (const asset of assets) assert.equal(network.filter(resource => new URL(resource.url).pathname === asset.url).length, 1, 'Resize does not reload core GLB');
  assert.deepEqual(errors, []);
  const textureDifference = snapshots.at(-1).memory.textures - snapshots[0].memory.textures;
  results.scenarios.push({ name: memoryProbe ? 'ten profile resizes with 500ms idle / actual renderer memory stability' : 'desktop / mobile / desktop resize preserves renderer and camera, adapts DPR and actual shadow map',
    passed: !memoryProbe || textureDifference <= 0, textureDifference, snapshots });
  await close(context);
  if (memoryProbe) assert.ok(textureDifference <= 0, `Ten resizes retain ${textureDifference} additional renderer textures after idle`);
}

async function projectedGlbHit(page, point) {
  return page.evaluate(coordinates => {
    const qa = window.__WORKSHOP_PHASE72_QA__; const state = qa.current(); const camera = state.camera;
    const projected = camera.position.clone().set(...coordinates).project(camera);
    const rect = state.gl.domElement.getBoundingClientRect();
    const x = rect.x + (projected.x + 1) * rect.width / 2;
    const y = rect.y + (1 - projected.y) * rect.height / 2;
    const pointer = state.pointer.clone().set(projected.x, projected.y);
    state.raycaster.setFromCamera(pointer, camera);
    const hit = state.raycaster.intersectObjects(state.scene.children, true).find(intersection => intersection.object.isMesh && intersection.object.visible);
    return { worldPoint: coordinates, x, y, ndc: projected.toArray(), inside: Math.abs(projected.x) <= 1 && Math.abs(projected.y) <= 1 && Math.abs(projected.z) <= 1,
      receivesCanvas: document.elementFromPoint(x, y) === state.gl.domElement,
      hit: hit ? { name: hit.object.name, point: hit.point.toArray(), distance: hit.distance } : null };
  }, point);
}

async function raycastInteractions(browser, assets) {
  const { context, page, errors } = await newPage(browser, { viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2, reducedMotion: 'reduce' }, assets);
  await page.goto(base); await enter(page);
  const tabletop = await projectedGlbHit(page, [1.8, 1.001, .1]);
  assert.ok(tabletop.inside && tabletop.receivesCanvas, 'Table surface is visible without an HTML hotspot intercepting it');
  assert.ok(tabletop.hit && assets[0].meshNames.includes(tabletop.hit.name), 'Table click hits a real shell GLB mesh');
  await page.mouse.click(tabletop.x, tabletop.y); await stable(page, 'workbench');
  await screenshot(page, 'raycast-workbench');
  await page.getByRole('button', { name: 'El taller', exact: true }).click(); await stable(page, 'hub');
  // The near floor point may lie below the viewport at the approved FOV. Use a
  // further visible floor point, preserving the actual projected ray and hit.
  const floorCandidates = [];
  let floor;
  for (const point of [[0, .01, 3.5], [0, .01, 1]]) {
    const candidate = await projectedGlbHit(page, point); floorCandidates.push(candidate);
    if (candidate.inside && candidate.receivesCanvas && candidate.hit?.point[1] < .15) { floor = candidate; break; }
  }
  assert.ok(floor, 'Visible unobstructed real floor GLB point found');
  assert.ok(assets[0].meshNames.includes(floor.hit.name), 'Floor click hits shell GLB geometry');
  const stateCountBeforeFloor = await page.evaluate(() => window.__WORKSHOP_PHASE72_QA__.states.length);
  await page.mouse.click(floor.x, floor.y); await page.waitForTimeout(200);
  assert.equal(await game(page).getAttribute('data-world-point'), 'hub', 'Floor click does not navigate');
  assert.equal(await game(page).getAttribute('data-workshop-state'), 'exploring', 'Floor click leaves stable state');
  assert.equal(await page.evaluate(() => window.__WORKSHOP_PHASE72_QA__.states.length), stateCountBeforeFloor, 'Floor did not start and finish a hidden journey');

  const dragPoint = await projectedGlbHit(page, [1.8, 1.001, .1]);
  assert.ok(dragPoint.receivesCanvas && dragPoint.inside, 'Drag starts on the real table mesh');
  const beforeCamera = await page.evaluate(() => window.__WORKSHOP_PHASE72_QA__.camera());
  const stateCountBeforeDrag = await page.evaluate(() => window.__WORKSHOP_PHASE72_QA__.states.length);
  await page.mouse.move(dragPoint.x, dragPoint.y); await page.mouse.down();
  await page.mouse.move(dragPoint.x + 40, dragPoint.y + 8, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(200);
  const afterCamera = await page.evaluate(() => window.__WORKSHOP_PHASE72_QA__.camera());
  assert.equal(await game(page).getAttribute('data-world-point'), 'hub', 'Drag above threshold does not activate GLB destination');
  assert.equal(await game(page).getAttribute('data-workshop-state'), 'exploring');
  assert.equal(await page.evaluate(() => window.__WORKSHOP_PHASE72_QA__.states.length), stateCountBeforeDrag, 'Drag does not initiate a hidden journey');
  assert.ok(afterCamera.quaternion.some((value, i) => Math.abs(value - beforeCamera.quaternion[i]) > .001), 'Drag actually changes view orientation');
  assert.deepEqual(errors, []);
  results.scenarios.push({ name: 'real GLB raycast table / inert floor / drag threshold', passed: true, tabletop, floorCandidates, selectedFloor: floor, dragPoint, beforeCamera, afterCamera });
  await close(context);
}

async function noWebGL(browser) {
  const { context, page } = await newPage(browser);
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) { return /webgl/.test(kind) ? null : original.call(this, kind, ...args); };
  });
  await page.goto(base); await page.getByRole('button', { name: 'Entrar al taller', exact: true }).click();
  await page.getByRole('heading', { name: 'El taller no está disponible' }).waitFor();
  await screenshot(page, 'no-webgl');
  await page.getByRole('button', { name: 'Ver portafolio', exact: true }).click();
  await page.getByRole('heading', { name: 'Daniel Cantor', exact: true }).waitFor();
  results.scenarios.push({ name: 'no WebGL / complete HTML alternative', passed: true });
  await close(context);
}

async function classicCases(browser) {
  const { context, page, errors } = await newPage(browser, { viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await page.goto(`${base}/?view=portfolio`);
  for (const name of ['Kliniu', "L'ORIGINE", '4U Studio Academy', 'Drokex']) {
    await page.getByRole('button', { name: `Seleccionar ${name}`, exact: true }).click();
    await page.getByRole('button', { name: `Entrar a ${name}`, exact: true }).click();
    await page.getByRole('heading', { name, exact: true, level: 1 }).waitFor();
    await page.getByRole('button', { name: 'Volver a la ciudad', exact: true }).click();
  }
  await page.goto(`${base}/?view=portfolio&project=kliniu`); await page.getByRole('heading', { name: 'Kliniu', exact: true, level: 1 }).waitFor();
  await page.getByRole('button', { name: 'Volver a la ciudad', exact: true }).click();
  await page.getByRole('heading', { name: 'Daniel Cantor', exact: true }).waitFor();
  assert.equal(new URL(page.url()).searchParams.has('project'), false);
  await page.reload(); await page.getByRole('heading', { name: 'Daniel Cantor', exact: true }).waitFor();
  assert.deepEqual(errors, []);
  results.scenarios.push({ name: 'four classic cases / direct classic link / return / reload', passed: true });
  await close(context);
}

(async () => {
  const assets = probe ? [] : coreUrls.map(assetInfo);
  results.assets = assets;
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  results.environment = { browser: browser.version(), channel: 'chrome', headless: true, platform: os.platform(), architecture: os.arch(), release: os.release(), mode: 'local Next dev', cacheDisabled: true };
  try {
    if (probe) {
      const width = Number(process.env.PROBE_WIDTH || 1440), height = Number(process.env.PROBE_HEIGHT || 1000);
      const { context, page, network } = await newPage(browser, { viewport: { width, height }, deviceScaleFactor: 2, isMobile: width <= 700, hasTouch: width <= 700 });
      await page.goto(base); await enter(page);
      const renderer = await rendererSnapshot(page);
      assert.equal(renderer.unavailable, undefined); assert.equal(renderer.hookError, null); assert.ok(renderer.info.render.triangles > 0);
      await screenshot(page, 'renderer-probe-interior');
      results.probe = renderer; results.probeNetworkIssues = network.filter(resource => resource.status >= 400); await close(context);
    } else if (memoryResizeProbe) {
      await resizeProfiles(browser, assets, true);
    } else if (resizeOnly) {
      await resizeProfiles(browser, assets);
    } else {
      for (const [width, height] of [[1440, 1000], [1920, 1080], [390, 844], [320, 568]]) await viewportScenario(browser, width, height, assets);
      await raycastInteractions(browser, assets);
      await resizeProfiles(browser, assets);
      await reducedHistoryAndKeyboard(browser, assets);
      for (const asset of assets) {
        await failureAndRetry(browser, asset, assets);
        for (const mode of ['context-loss', 'cancel', 'portfolio']) await heldAsset(browser, asset, mode, assets);
      }
      await noWebGL(browser); await classicCases(browser);
    }
    results.passed = true;
  } finally {
    for (const context of contexts) await context.close().catch(() => {});
    await browser.close();
  }
})().catch(error => { results.error = { message: error.message, stack: error.stack }; process.exitCode = 1; }).finally(() => {
  const label = probe ? 'renderer-probe' : memoryResizeProbe ? 'memory-resize-probe' : resizeOnly ? 'resize-probe' : 'results';
  fs.writeFileSync(output(`${label}.json`), JSON.stringify(results, null, 2));
  fs.writeFileSync(output(probe ? 'renderer-probe.log' : memoryResizeProbe ? 'memory-resize-probe.log' : resizeOnly ? 'resize-probe.log' : 'browser.log'), logs.map(entry => JSON.stringify(entry)).join('\n') + '\n');
  console.log(JSON.stringify({ passed: results.passed, error: results.error?.message, viewports: results.viewports.map(({ width, height, entryMs, coreEncodedBytes, motion, idle, cameraPixelDifference }) => ({ width, height, entryMs, coreEncodedBytes, motion, idle, cameraPixelDifference })), scenarios: results.scenarios, output: output(`${label}.json`) }, null, 2));
});
