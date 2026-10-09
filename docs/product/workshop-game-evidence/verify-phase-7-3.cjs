// Actual Chrome evidence for Sprint7 / Phase7.3. No production instrumentation.
// Start only after root has restarted the checkout's Next server on port3000.
// node verify-phase-7-3.cjs [--probe|--viewports|--resilience|--navigation|--memory|--rays]
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/Users/creativo/Documents/kliniu/node_modules/playwright');
const sharp = require(process.env.SHARP_PATH || '/Users/creativo/Documents/kliniu/node_modules/sharp');
const { PropertyBinding } = require(path.resolve(__dirname, '../../../apps/web/node_modules/three'));
const base = process.env.BASE_URL || 'http://localhost:3000';
const sections = ['probe', 'viewports', 'resilience', 'navigation', 'memory', 'rays', 'visibility', 'retry-snapshot', 'monitor-drag'];
const section = sections.find(name => process.argv.includes(`--${name}`)) || 'full';
const requestedViewportWidths = (process.env.QA_VIEWPORTS || '').split(',').filter(Boolean).map(Number);
const sectionLabel = section === 'viewports' && requestedViewportWidths.length ? `${section}-${requestedViewportWidths.join('-')}` : section;
const output = name => path.join(__dirname, `phase73-${name}`);
const publicRoot = path.resolve(__dirname, '../../../apps/web/public');
const rooms = [
  { id: 'kliniu', projectId: 'kliniu', name: 'Kliniu', portal: [-5.1, 1.35, -3], camera: [-5.1, 1.65, -4], target: [-5.1, 1.5, -8.7], evidence: '/projects/kliniu-desktop.png' },
  { id: 'lorigine', projectId: 'lorigine', name: "L'ORIGINE", portal: [4.8, 1.35, -3], camera: [4.8, 1.65, -4.1], target: [4.8, 1.45, -8.5], evidence: '/projects/lorigine-catalog-v4.webp' },
  { id: 'academy', projectId: '4ustudio-academy', name: '4U Studio Academy', portal: [-4, 1.35, 5.7], camera: [-6.4, 1.65, 5.7], target: [-8.6, 1.4, 5.7], evidence: '/projects/academy-lessons-v4.webp' },
  { id: 'drokex', projectId: 'drokex', name: 'Drokex', portal: [4, 1.35, 5.7], camera: [6.4, 1.65, 5.7], target: [8.6, 1.4, 5.7], evidence: '/projects/drokex-products-v4.webp' },
].map(room => ({ ...room, url: `/models/workshop-game/room-${room.id}-v1.glb`, button: `Ir a ${room.name}`, open: `Abrir caso de ${room.name}` }));
const coreUrls = ['/models/workshop-game/workshop-shell-v2.glb', '/models/workshop-game/workshop-door-v1.glb'];
const allUrls = [...coreUrls, ...rooms.map(room => room.url)];
const game = page => page.locator('main[data-workshop-state]');
const results = { passed: false, section, recordedAt: new Date().toISOString(), base, environment: {}, viewports: [], scenarios: [], limitations: [
  'Local Next dev server. Transfer and render observations are not production benchmarks.',
  'Mobile sizes use desktop Chrome emulation. Physical mobile GPU, heat, battery and touch ergonomics are not measured.',
  'GLB byte budgets include embedded images; they exclude JavaScript, CSS, poster and evidence screenshots.',
  'Frame timings are actual main camera renders under the QA hook. CPU submit time is not GPU execution time. Idle and case pause are separate.',
  'QA raycast review cameras are explicitly recorded; production drag and navigation are exercised separately.',
  'Memory counts are renderer.info live resources after warm-cache loops, not operating-system RAM or VRAM bytes.',
] };
const contexts = new Set();
const logs = [];
let activePage = null;

function assetInfo(url, id) {
  const buffer = fs.readFileSync(path.join(publicRoot, url));
  assert.equal(buffer.readUInt32LE(0), 0x46546c67, `${url}: GLB magic`);
  assert.equal(buffer.readUInt32LE(4), 2, `${url}: glTF version`);
  assert.equal(buffer.readUInt32LE(8), buffer.length, `${url}: complete GLB`);
  assert.equal(buffer.readUInt32LE(16), 0x4e4f534a, `${url}: JSON chunk`);
  const json = JSON.parse(buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString('utf8').trim());
  const meshNames = (json.nodes || []).filter(node => node.mesh !== undefined).map(node => node.name).filter(Boolean).map(PropertyBinding.sanitizeNodeName);
  assert.ok(meshNames.length, `${url}: named meshes required for useful-frame proof`);
  let triangles = 0, primitives = 0;
  for (const mesh of json.meshes || []) for (const primitive of mesh.primitives) {
    primitives += 1;
    assert.equal(primitive.mode ?? 4, 4, `${url}: triangle primitives`);
    triangles += json.accessors[primitive.indices ?? primitive.attributes.POSITION].count / 3;
  }
  if (id) { assert.ok(buffer.length < 2000000, `${id}: room under2MB`); assert.ok(triangles < 25000, `${id}: room under25k triangles`); }
  return { url, id, fileBytes: buffer.length, meshNames, triangles, primitives, materials: (json.materials || []).length, images: (json.images || []).length };
}

function installQaHook(assetGroups) {
  const expectedAssets = assetGroups.core;
  const qa = window.__WORKSHOP_PHASE73_QA__ = { stores: [], renderers: [], firstCoreByRenderer: {}, frames: [], states: [], activeMotion: null, activationAt: null, firstUsableFrame: null, roomMountedFrames: {}, roomRenderedAtPose: {}, expectedAssets, assetGroups };
  qa.focusCalls = []; qa.focusEvents = [];
  const describe = node => node ? { tag: node.tagName, text: node.textContent?.trim().slice(0, 120), id: node.id, class: String(node.className || '').slice(0, 180) } : null;
  const previousFocus = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function (...args) {
    const keeper = this.closest('[data-workshop-keeper]');
    const record = { at: performance.now(), target: describe(this), connected: this.isConnected, activeBefore: describe(document.activeElement), beforeInert: !!this.closest('[inert]'), beforeKeeperInlineVisibility: keeper?.style.visibility ?? null, beforeKeeperInlineDisplay: keeper?.style.display ?? null, documentHidden: document.hidden };
    const returned = previousFocus.apply(this, args);
    // Read computed style only after the native focus call. Reading it first
    // forces layout and can hide the very timing issue this fixture diagnoses.
    const css = getComputedStyle(this); record.computedVisibilityAfter = css.visibility; record.computedDisplayAfter = css.display; record.activeAfter = describe(document.activeElement); record.succeeded = document.activeElement === this;
    if (!record.succeeded) {
      record.ancestorsAfter = []; for (let node = this; node; node = node.parentElement) { const css = getComputedStyle(node); record.ancestorsAfter.push({ ...describe(node), inlineVisibility: node.style.visibility, inlineDisplay: node.style.display, computedVisibility: css.visibility, computedDisplay: css.display, inert: node.inert, transitionProperty: css.transitionProperty, transitionDuration: css.transitionDuration, animationName: css.animationName }); }
      record.keeperAnimations = keeper?.getAnimations().map(animation => ({ playState: animation.playState, currentTime: animation.currentTime, timing: animation.effect?.getComputedTiming(), keyframes: animation.effect?.getKeyframes() })) ?? [];
    }
    qa.focusCalls.push(record); return returned;
  };
  for (const type of ['focusin', 'focusout']) document.addEventListener(type, event => qa.focusEvents.push({ at: performance.now(), type, target: describe(event.target), related: describe(event.relatedTarget), targetInert: !!event.target?.closest?.('[inert]') }), true);
  const wrapped = new WeakSet();
  const wrappedMeshes = new WeakSet();
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
    return { position: state.camera.position.toArray(), quaternion: state.camera.quaternion.toArray(), direction: state.camera.getWorldDirection(state.camera.position.clone()).toArray(), fov: state.camera.fov, near: state.camera.near, far: state.camera.far };
  };
  const captureStore = root => {
    const store = root?.containerInfo;
    if (!store?.getState) return;
    const state = store.getState();
    const renderer = state.gl;
    if (!renderer?.isWebGLRenderer || !renderer.domElement?.closest('[data-world-canvas]')) return;
    if (!qa.stores.includes(store)) qa.stores.push(store);
    if (!qa.renderers.includes(renderer)) qa.renderers.push(renderer);
    const rendererId = qa.renderers.indexOf(renderer) + 1;
    if (wrapped.has(renderer)) return;
    wrapped.add(renderer);
    const original = renderer.render;
    renderer.render = function (...args) {
      const current = store.getState();
      const main = args[0] === current.scene && args[1] === current.camera;
      if (main) {
        qa.mainDraws = {};
        current.scene.traverse(object => {
          if (!object.isMesh || wrappedMeshes.has(object)) return;
          const asset = assetGroups.rooms.find(asset => object.name.startsWith(`room__${asset.id}__`));
          if (!asset) return;
          wrappedMeshes.add(object);
          const previous = object.onBeforeRender;
          object.onBeforeRender = function (...drawArgs) {
            if (drawArgs[0] === renderer && drawArgs[1] === store.getState().scene && drawArgs[2] === store.getState().camera) {
              (qa.mainDraws[asset.id] ||= []).push(object.name);
            }
            return previous?.apply(this, drawArgs);
          };
        });
      }
      const started = performance.now();
      const returned = original.apply(this, args);
      if (main) {
        const at = performance.now();
        const frame = { at, rendererId, cpuSubmitMs: at - started, rendererFrame: renderer.info.render.frame,
          motion: document.querySelector('main[data-workshop-state]')?.dataset.workshopState === 'moving',
          segment: qa.activeMotion, camera: current.camera.position.toArray(), roomDraws: { ...qa.mainDraws }, point: document.querySelector('main[data-workshop-state]')?.dataset.worldPoint, destination: document.querySelector('main[data-workshop-state]')?.dataset.worldDestination, ...renderer.info.render, memory: { ...renderer.info.memory } };
        qa.frames.push(frame);
        if (!qa.firstCoreByRenderer[rendererId] && expectedAssets.length && renderer.info.render.triangles > 0 && !renderer.getContext().isContextLost()) {
          const names = new Set((qa.nodes() || []).filter(node => node.visible && node.vertices > 0).map(node => node.name));
          if (expectedAssets.every(asset => asset.meshNames.every(name => names.has(name)))) {
            qa.firstCoreByRenderer[rendererId] = { at, rendererFrame: frame.rendererFrame, camera: [...frame.camera] };
            qa.firstUsableFrame ||= { at, rendererFrame: frame.rendererFrame };
          }
        }
        for (const asset of assetGroups.rooms) {
          if (!qa.roomMountedFrames[asset.id]) {
            const names = new Set((qa.nodes() || []).filter(node => node.visible && node.vertices > 0).map(node => node.name));
            if (asset.meshNames.every(name => names.has(name))) qa.roomMountedFrames[asset.id] = { at, rendererFrame: frame.rendererFrame };
          }
          if (!qa.roomRenderedAtPose[asset.id] && qa.mainDraws[asset.id]?.length && asset.camera.every((value, i) => Math.abs(value - frame.camera[i]) < 1e-6)) qa.roomRenderedAtPose[asset.id] = { at, rendererFrame: frame.rendererFrame, meshesDrawn: [...new Set(qa.mainDraws[asset.id])] };
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
    if (!last || last.status !== main.dataset.workshopState || last.point !== main.dataset.worldPoint || last.destination !== main.dataset.worldDestination) {
      qa.states.push({ at: performance.now(), status: main.dataset.workshopState, point: main.dataset.worldPoint, destination: main.dataset.worldDestination });
    }
  };
  const observe = () => { new MutationObserver(recordState).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-workshop-state', 'data-world-point', 'data-world-destination'] }); recordState(); };
  if (document.documentElement) observe(); else document.addEventListener('DOMContentLoaded', observe, { once: true });
}

async function newPage(browser, assetGroups, options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', ...options });
  contexts.add(context);
  await context.addInitScript(installQaHook, assetGroups);
  const page = await context.newPage(); activePage = page;
  page.setDefaultTimeout(30000);
  const errors = [];
  page.on('pageerror', error => { errors.push(error.message); logs.push({ type: 'pageerror', url: page.url(), message: error.message }); });
  page.on('console', message => { if (['error', 'warning'].includes(message.type())) logs.push({ type: message.type(), url: page.url(), message: message.text() }); });
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  const network = [], requests = new Map();
  cdp.on('Network.requestWillBeSent', event => requests.set(event.requestId, { url: event.request.url }));
  cdp.on('Network.responseReceived', event => Object.assign(requests.get(event.requestId) || {}, { status: event.response.status, mimeType: event.response.mimeType, fromDiskCache: event.response.fromDiskCache || false }));
  cdp.on('Network.loadingFinished', event => { const request = requests.get(event.requestId); if (request) network.push({ ...request, encodedDataLength: event.encodedDataLength }); });
  return { context, page, errors, network, cdp };
}
async function close(context) {
  if (activePage && !activePage.isClosed()) results.lastClosedContext = await activePage.evaluate(() => {
    const keeper = document.querySelector('[data-workshop-keeper]');
    return { url: location.href, title: document.title, state: document.querySelector('main[data-workshop-state]')?.dataset, active: document.activeElement?.outerHTML.slice(0, 1200), activeTag: document.activeElement?.tagName, text: document.body.innerText, keeper: keeper ? { style: keeper.getAttribute('style'), computedVisibility: getComputedStyle(keeper).visibility, inert: keeper.inert, ariaHidden: keeper.getAttribute('aria-hidden') } : null, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, states: window.__WORKSHOP_PHASE73_QA__?.states, focusCalls: window.__WORKSHOP_PHASE73_QA__?.focusCalls.slice(-30), focusEvents: window.__WORKSHOP_PHASE73_QA__?.focusEvents.slice(-40) };
  }).catch(() => null);
  contexts.delete(context); await context.close(); activePage = null;
}
async function stable(page, point) {
  await page.locator(`main[data-workshop-state="exploring"][data-world-point="${point}"]`).waitFor();
  await page.waitForFunction(() => !document.documentElement.dataset.portfolioTransition);
  await page.waitForTimeout(180);
}
async function enter(page) {
  await page.evaluate(() => { window.__WORKSHOP_PHASE73_QA__.activationAt = performance.now(); });
  await page.getByRole('button', { name: 'Entrar al taller', exact: true }).click(); await stable(page, 'hub');
  await page.waitForFunction(() => !!window.__WORKSHOP_PHASE73_QA__?.current()?.gl);
  await page.evaluate(() => { const qa = window.__WORKSHOP_PHASE73_QA__; qa.mainRenderer = qa.current().gl; qa.mainCanvas = qa.current().gl.domElement; });
}
async function screenshot(page, name, html = false) {
  await page.screenshot({ path: output(`${name}.jpg`), type: 'jpeg', quality: 88 });
  if (html) fs.writeFileSync(output(`${name}.html`), await page.content());
}
async function focused(page, name) { return page.getByRole('button', { name, exact: true }).evaluate(element => element === document.activeElement); }
async function sameRenderer(page) {
  assert.equal(await page.locator('[data-world-canvas] canvas').count(), 1, 'Exactly one workshop canvas remains mounted');
  assert.equal(await page.evaluate(() => { const qa = window.__WORKSHOP_PHASE73_QA__; return qa.current()?.gl === qa.mainRenderer && qa.current()?.gl.domElement === qa.mainCanvas && qa.mainCanvas.isConnected; }), true, 'Main renderer/canvas stays connected and identical');
}
async function camera(page) { return page.evaluate(() => window.__WORKSHOP_PHASE73_QA__.camera()); }
function compareCamera(before, after) {
  assert.ok(before && after, 'Actual camera exists before/after case');
  for (const field of ['position', 'quaternion']) for (let i = 0; i < before[field].length; i++) assert.ok(Math.abs(before[field][i] - after[field][i]) < 1e-6, `Exact camera ${field}[${i}] restored`);
  for (const field of ['fov', 'near', 'far']) assert.equal(before[field], after[field]);
}
function percentile(values, fraction) { const sorted = [...values].sort((a, b) => a - b); return sorted.length ? sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)] : null; }
function summarizeFrames(frames) {
  const intervals = frames.slice(1).map((frame, i) => frame.at - frames[i].at);
  const duration = frames.length > 1 ? frames.at(-1).at - frames[0].at : 0;
  return { actualRenderedFrames: frames.length, sampledMs: duration, fps: duration > 0 ? (frames.length - 1) * 1000 / duration : null,
    medianIntervalMs: percentile(intervals, .5), p95IntervalMs: percentile(intervals, .95), medianCpuSubmitMs: percentile(frames.map(frame => frame.cpuSubmitMs), .5), p95CpuSubmitMs: percentile(frames.map(frame => frame.cpuSubmitMs), .95),
    medianDrawCalls: percentile(frames.map(frame => frame.calls), .5), maxDrawCalls: frames.length ? Math.max(...frames.map(frame => frame.calls)) : null, maxTriangles: frames.length ? Math.max(...frames.map(frame => frame.triangles)) : null };
}
async function rendererSnapshot(page) {
  return page.evaluate(() => {
    const qa = window.__WORKSHOP_PHASE73_QA__, state = qa.current();
    if (!state) return { unavailable: true, hookError: qa.hookError || null };
    const context = state.gl.getContext(), debug = context.getExtension('WEBGL_debug_renderer_info'), shadows = [];
    state.scene.traverse(object => { if (object.isLight && object.castShadow) shadows.push({ type: object.type, requested: object.shadow.mapSize.toArray(), actual: object.shadow.map ? [object.shadow.map.width, object.shadow.map.height] : null }); });
    return { dpr: state.gl.getPixelRatio(), browserDpr: devicePixelRatio, canvas: { width: state.gl.domElement.width, height: state.gl.domElement.height },
      gpu: { renderer: context.getParameter(context.RENDERER), vendor: context.getParameter(context.VENDOR), version: context.getParameter(context.VERSION), unmaskedRenderer: debug ? context.getParameter(debug.UNMASKED_RENDERER_WEBGL) : null },
      shadows, shadowAutoUpdate: state.gl.shadowMap.autoUpdate, info: { render: { ...state.gl.info.render }, memory: { ...state.gl.info.memory }, programs: state.gl.info.programs?.length ?? null },
      frameloop: state.frameloop, camera: qa.camera(), nodes: qa.nodes(), firstUsableFrame: qa.firstUsableFrame, roomMountedFrames: qa.roomMountedFrames, roomRenderedAtPose: qa.roomRenderedAtPose,
      activationAt: qa.activationAt, states: qa.states, stores: qa.stores.length, focusCalls: qa.focusCalls.slice(-30), focusEvents: qa.focusEvents.slice(-40), hookError: qa.hookError || null };
  });
}
async function resourceTimings(page, urls) {
  return page.evaluate(urls => {
    const entries = performance.getEntriesByType('resource');
    return urls.map(url => {
      const matching = entries.filter(entry => new URL(entry.name).pathname === url);
      return { url, count: matching.length, transferSize: matching.reduce((sum, entry) => sum + entry.transferSize, 0), encodedBodySize: matching.reduce((sum, entry) => sum + entry.encodedBodySize, 0), decodedBodySize: matching.reduce((sum, entry) => sum + entry.decodedBodySize, 0), responseEnd: Math.max(0, ...matching.map(entry => entry.responseEnd)) };
    });
  }, urls);
}
async function noFrameSample(page, label, duration = 850) {
  await page.waitForTimeout(300);
  const before = await page.evaluate(() => ({ at: performance.now(), count: window.__WORKSHOP_PHASE73_QA__.frames.length }));
  await page.waitForTimeout(duration);
  const after = await page.evaluate(() => ({ at: performance.now(), count: window.__WORKSHOP_PHASE73_QA__.frames.length }));
  const sample = { sampledMs: after.at - before.at, renderedFrames: after.count - before.count };
  assert.equal(sample.renderedFrames, 0, `${label}: zero main renders`); return sample;
}
async function setVisibility(page, value) {
  await page.evaluate(value => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => value });
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => value === 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  }, value);
}
async function selectRoom(page, room, label = room.id) {
  await page.evaluate(label => { window.__WORKSHOP_PHASE73_QA__.activeMotion = label; }, label);
  await page.getByRole('button', { name: room.button, exact: true }).last().click(); await stable(page, room.id);
  await assertRoomPose(page, room);
  await page.evaluate(() => { window.__WORKSHOP_PHASE73_QA__.activeMotion = null; });
}
async function assertRoomPose(page, room) {
  const actual = await camera(page), direction = room.target.map((value, index) => value - room.camera[index]), length = Math.hypot(...direction);
  for (let index = 0; index < 3; index++) {
    assert.ok(Math.abs(actual.position[index] - room.camera[index]) < 1e-6, `${room.id}: exact approved camera coordinate${index}`);
    assert.ok(Math.abs(actual.direction[index] - direction[index] / length) < 1e-6, `${room.id}: camera faces approved target coordinate${index}`);
  }
}
async function inspectionProof(page, room) {
  const button = page.getByRole('button', { name: room.open, exact: true }); await button.waitFor();
  const section = button.locator('xpath=ancestor::section[1]');
  await section.getByRole('heading', { name: room.name, exact: true }).waitFor();
  await page.waitForFunction(expected => [...document.querySelectorAll('main[data-workshop-state] img')].some(image => {
    const url = new URL(image.currentSrc || image.src, location.href), logical = url.pathname === '/_next/image' ? url.searchParams.get('url') : url.pathname;
    if (logical !== expected || !image.complete || image.naturalWidth <= 0) return false;
    for (let node = image; node; node = node.parentElement) { const css = getComputedStyle(node); if (css.display === 'none' || css.visibility === 'hidden' || Number(css.opacity) === 0) return false; }
    const rect = image.getBoundingClientRect(); return rect.width > 0 && rect.height > 0 && rect.right > 0 && rect.bottom > 0 && rect.left < innerWidth && rect.top < innerHeight;
  }), room.evidence);
  const images = await game(page).locator('img').evaluateAll((nodes, expected) => nodes.map(image => {
    const src = image.currentSrc || image.src, url = new URL(src, location.href), logicalUrl = url.pathname === '/_next/image' ? url.searchParams.get('url') : url.pathname;
    if (logicalUrl !== expected) return null;
    let cssVisible = true;
    for (let node = image; node; node = node.parentElement) { const css = getComputedStyle(node); if (css.display === 'none' || css.visibility === 'hidden' || Number(css.opacity) === 0) cssVisible = false; }
    const rect = image.getBoundingClientRect(), left = Math.max(0, rect.left), right = Math.min(innerWidth, rect.right), top = Math.max(0, rect.top), bottom = Math.min(innerHeight, rect.bottom), samples = [];
    if (cssVisible && right > left && bottom > top) for (const fx of [.1, .3, .5, .7, .9]) for (const fy of [.1, .3, .5, .7, .9]) {
      const x = left + (right - left) * fx, y = top + (bottom - top) * fy, target = document.elementFromPoint(x, y);
      // World evidence has pointer-events:none. Canvas is the valid underlying
      // hit surface; a foreground panel/control covering a sample is excluded.
      if (target === image || target?.tagName === 'CANVAS' || (target !== document.body && target?.contains(image))) samples.push({ x, y, underlying: target.tagName, imageAncestor: target !== image && target.contains(image) });
    }
    return { src, logicalUrl, alt: image.alt, complete: image.complete, width: image.naturalWidth, height: image.naturalHeight, cssVisible, location: image.closest('[data-room-inspection]') ? 'inspection card' : 'physical world monitor', rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, uncoveredViewportSamples: samples };
  }).filter(Boolean), room.evidence);
  assert.ok(images.length, `${room.id}: actual repository evidence image exists in monitor/card`);
  results.currentEvidence = { room: room.id, images };
  assert.ok(images.some(image => image.complete && image.width > 0 && image.cssVisible && image.uncoveredViewportSamples.length > 0), `${room.id}: real evidence visibly paints in monitor/card`);
  const text = await section.innerText();
  if (room.id === 'drokex') assert.ok(text.includes('Participación descrita en el CV de Daniel. Propiedad no confirmada.'), 'Drokex inspection preserves exact ownership attribution');
  return { text, images };
}
async function layoutProof(page) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'No horizontal overflow');
  const buttons = page.getByRole('navigation', { name: 'Recorrer el taller', exact: true }).getByRole('button');
  assert.equal(await buttons.count(), 6, 'Six accessible equivalent destinations');
  const boxes = await buttons.evaluateAll(nodes => nodes.map(node => { const rect = node.getBoundingClientRect(); const target = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2); return { name: node.textContent.trim(), x: rect.x, y: rect.y, width: rect.width, height: rect.height, inside: rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth + 1 && rect.bottom <= innerHeight + 1, unobstructed: !!target && (target === node || node.contains(target)) }; }));
  for (const box of boxes) assert.ok(box.inside && box.unobstructed && box.height >= 32, `${box.name}: visible usable navigation control`);
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j]; assert.equal(a.x < b.x + b.width - 1 && a.x + a.width > b.x + 1 && a.y < b.y + b.height - 1 && a.y + a.height > b.y + 1, false, `${a.name}/${b.name}: no overlap`);
  }
  return boxes;
}
async function freeLookBeforeCase(page, room) {
  const point = await page.evaluate(() => {
    const canvas = window.__WORKSHOP_PHASE73_QA__.current().gl.domElement;
    for (const [fx, fy] of [[.65, .16], [.65, .23], [.35, .2]]) { const x = innerWidth * fx, y = innerHeight * fy; if (document.elementFromPoint(x, y) === canvas) return { x, y }; }
    return null;
  });
  assert.ok(point, `${room.id}: exposed canvas point for actual free look`); const before = await camera(page);
  await page.mouse.move(point.x, point.y); await page.mouse.down(); await page.mouse.move(point.x + 24, point.y + 6, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(100);
  const after = await camera(page); assert.ok(after.quaternion.some((value, i) => Math.abs(value - before.quaternion[i]) > .001), 'Case return exercises a changed free-look orientation');
  assert.equal(await game(page).getAttribute('data-world-point'), room.id); assert.equal(await game(page).getAttribute('data-workshop-state'), 'exploring');
  return { point, canonicalCamera: before, cameraAfterActualDrag: after };
}
function checkPath(frames, label) {
  const crossing = (a, b, axis, value) => {
    const da = a[axis] - value, db = b[axis] - value;
    if ((da > 1e-9 && db > 1e-9) || (da < -1e-9 && db < -1e-9) || Math.abs(b[axis] - a[axis]) < 1e-12) return null;
    const t = Math.max(0, Math.min(1, (value - a[axis]) / (b[axis] - a[axis]))); return a.map((v, i) => v + (b[i] - v) * t);
  };
  const crossesBench = (a, b) => {
    let enter = 0, exit = 1;
    for (const [axis, min, max] of [[0, -2.49, 2.49], [2, -1.99, .39]]) {
      const delta = b[axis] - a[axis];
      if (Math.abs(delta) < 1e-12) { if (a[axis] <= min || a[axis] >= max) return false; continue; }
      const bounds = [(min - a[axis]) / delta, (max - a[axis]) / delta].sort((x, y) => x - y);
      enter = Math.max(enter, bounds[0]); exit = Math.min(exit, bounds[1]); if (enter >= exit) return false;
    }
    return enter < exit && exit > 0 && enter < 1;
  };
  for (const frame of frames) {
    const [x, y, z] = frame.camera;
    assert.ok(Math.abs(y - 1.65) < 1e-6, `${label}: camera stays at eye height`);
    assert.equal(x > -2.49 && x < 2.49 && z > -1.99 && z < .39, false, `${label}: camera avoids bench footprint`);
  }
  for (let i = 1; i < frames.length; i++) {
    const a = frames[i - 1].camera, b = frames[i].camera;
    assert.equal(crossesBench(a, b), false, `${label}: continuous segment avoids bench footprint`);
    const rear = crossing(a, b, 2, -3);
    if (rear && ((rear[0] > -9.35 && rear[0] < -1.05) || (rear[0] > 1.05 && rear[0] < 7.35))) assert.ok(Math.abs(rear[0] + 5.1) <= 1.1 || Math.abs(rear[0] - 4.8) <= 1.1, `${label}: rear partition crosses only portal`);
    const frontBack = crossing(a, b, 2, 4.2);
    if (frontBack) assert.ok(Math.abs(frontBack[0]) <= 4.06, `${label}: camera avoids front-room back partitions`);
    for (const side of [-4, 4]) {
      const front = crossing(a, b, 0, side);
      if (front && front[2] > 3.1) assert.ok(Math.abs(front[2] - 5.7) <= 1.1, `${label}: front partition crosses only portal`);
    }
  }
  return { actualCameraSamples: frames.length, eyeHeight: 1.65, benchClear: true, partitionCrossingsClear: true };
}

async function viewportScenario(browser, assetGroups, width, height) {
  const { context, page, errors, network } = await newPage(browser, assetGroups, { viewport: { width, height }, deviceScaleFactor: 2, reducedMotion: 'no-preference', isMobile: width <= 700, hasTouch: width <= 700 });
  await page.goto(base);
  assert.equal(await page.locator('canvas').count(), 0, 'No canvas before activation');
  assert.equal((await resourceTimings(page, allUrls)).some(asset => asset.count > 0), false, 'No GLB before activation');
  await screenshot(page, `${width}-landing`); await enter(page);
  const entered = await rendererSnapshot(page);
  assert.equal(entered.unavailable, undefined); assert.equal(entered.hookError, null); assert.ok(entered.firstUsableFrame, 'Core actual meshes reached a useful frame');
  assert.ok(entered.states.find(state => state.status === 'moving')?.at >= entered.firstUsableFrame.at, 'Entry waits for useful core main frame');
  assert.equal(entered.dpr, width <= 700 ? 1 : 1.5, `${width}: correct DPR profile`);
  assert.equal(entered.shadowAutoUpdate, false, 'Static shadows remain demand-driven');
  const directional = entered.shadows.find(shadow => shadow.type === 'DirectionalLight'), shadowSize = width <= 700 ? 1024 : 2048;
  assert.ok(directional, 'Actual directional shadow map captured'); assert.deepEqual(directional.actual, [shadowSize, shadowSize], `${width}: actual shadow map follows profile`);
  const initialTimings = await resourceTimings(page, allUrls);
  for (const room of rooms) assert.equal(initialTimings.find(asset => asset.url === room.url).count, 0, `${room.id}: not fetched at core entry`);
  const core = initialTimings.filter(asset => coreUrls.includes(asset.url));
  assert.ok(core.reduce((sum, asset) => sum + asset.decodedBodySize, 0) <= 5000000, 'Actual decoded core under5MB');
  for (const asset of assetGroups.core) {
    const timing = core.find(item => item.url === asset.url); assert.equal(timing.count, 1); assert.equal(timing.decodedBodySize, asset.fileBytes); assert.ok(timing.transferSize > 0); assert.ok(timing.responseEnd <= entered.firstUsableFrame.at + 1);
  }
  await screenshot(page, `${width}-hub`); const destinations = [];
  for (const [index, room] of rooms.entries()) {
    await selectRoom(page, room, `cold-${room.id}`); await sameRenderer(page);
    const snapshot = await rendererSnapshot(page); const timings = await resourceTimings(page, rooms.map(room => room.url));
    for (const [laterIndex, other] of rooms.entries()) assert.equal(timings.find(asset => asset.url === other.url).count, laterIndex <= index ? 1 : 0, `${other.id}: lazy selected-only resource request`);
    const asset = assetGroups.rooms.find(asset => asset.id === room.id), timing = timings.find(asset => asset.url === room.url);
    assert.equal(timing.decodedBodySize, asset.fileBytes, `${room.id}: complete actual GLB body`); assert.ok(timing.encodedBodySize > 0 && timing.transferSize > 0, `${room.id}: actual cold bytes`);
    assert.ok(snapshot.roomMountedFrames[room.id], `${room.id}: room meshes mounted at main frame`);
    assert.ok(snapshot.roomRenderedAtPose[room.id]?.meshesDrawn.length, `${room.id}: actual own GLB draw at approved room pose`);
    const firstRoomMovement = snapshot.states.find(state => state.status === 'moving' && state.destination === room.id);
    assert.ok(firstRoomMovement && firstRoomMovement.at >= snapshot.roomMountedFrames[room.id].at, `${room.id}: movement starts after useful main frame`);
    assert.ok(timing.responseEnd <= snapshot.roomMountedFrames[room.id].at + 1, `${room.id}: complete response precedes useful frame`);
    const evidence = await inspectionProof(page, room), layout = await layoutProof(page);
    await screenshot(page, `${width}-${room.id}-inspection`, width === 1440);
    const freeLook = await freeLookBeforeCase(page, room);
    const canvasBefore = await page.locator('[data-world-canvas] canvas').screenshot(); const beforeCamera = await camera(page);
    await page.getByRole('button', { name: room.open, exact: true }).click();
    const caseMain = page.locator(`main[data-project="${room.projectId}"]`); await caseMain.waitFor(); await page.waitForURL(url => url.searchParams.get('project') === room.projectId);
    await page.waitForFunction(() => !document.documentElement.dataset.portfolioTransition); await sameRenderer(page);
    assert.equal(await page.locator('[data-world-canvas] canvas').isVisible(), false, 'Persistent canvas hidden while case is read');
    assert.equal(await game(page).evaluate(element => !!element.closest('[inert]') || element.inert), true, 'Hidden game is inert');
    if (room.id === 'drokex') assert.ok((await caseMain.innerText()).includes('Participación descrita en el CV de Daniel. Propiedad no confirmada.'), 'Drokex case preserves attribution');
    await screenshot(page, `${width}-${room.id}-case`, width === 1440);
    const paused = await noFrameSample(page, `${room.id}: case read`);
    await setVisibility(page, 'hidden'); await setVisibility(page, 'visible'); const visibilityPause = await noFrameSample(page, `${room.id}: case remains paused after visibility change`, 350);
    await page.getByRole('button', { name: 'Volver al taller', exact: true }).click(); await stable(page, room.id); await sameRenderer(page);
    assert.equal(await focused(page, room.open), true, `${room.id}: focus returns to source inspection CTA`);
    const afterCamera = await camera(page); compareCamera(beforeCamera, afterCamera);
    const canvasAfter = await page.locator('[data-world-canvas] canvas').screenshot();
    const [beforePixels, afterPixels] = await Promise.all([sharp(canvasBefore).ensureAlpha().raw().toBuffer(), sharp(canvasAfter).ensureAlpha().raw().toBuffer()]);
    assert.equal(beforePixels.length, afterPixels.length); let difference = 0; for (let i = 0; i < beforePixels.length; i++) difference += Math.abs(beforePixels[i] - afterPixels[i]);
    const cameraPixelDifference = difference / beforePixels.length; assert.ok(cameraPixelDifference < 2, `${room.id}: pixels match restored camera (${cameraPixelDifference}/255)`);
    await screenshot(page, `${width}-${room.id}-return`);
    const frames = await page.evaluate(segment => window.__WORKSHOP_PHASE73_QA__.frames.filter(frame => frame.motion && frame.segment === segment), `cold-${room.id}`);
    assert.ok(frames.length >= 3, `${room.id}: actual moving camera renders measured`);
    const path = checkPath(frames, `cold-${room.id}`), motion = summarizeFrames(frames);
    destinations.push({ room: room.id, projectId: room.projectId, timing, mountedAtMainFrame: snapshot.roomMountedFrames[room.id], renderedAtPose: snapshot.roomRenderedAtPose[room.id], evidence, layout, freeLook, beforeCamera, afterCamera, cameraPixelDifference, paused, visibilityPause, motion, path });
  }
  const idle = await noFrameSample(page, `${width}: demand idle`);
  const final = await rendererSnapshot(page); const finalTimings = await resourceTimings(page, allUrls);
  for (const url of allUrls) {
    assert.equal(finalTimings.find(asset => asset.url === url).count, 1, `${url}: loaded once across four cases`);
    const responses = network.filter(resource => new URL(resource.url).pathname === url); assert.equal(responses.length, 1); assert.equal(responses[0].status, 200); assert.equal(responses[0].fromDiskCache, false);
  }
  assert.deepEqual(errors, [], 'No uncaught browser errors');
  results.viewports.push({ width, height, mobileEmulation: width <= 700, deviceScaleFactor: 2, coreTimings: core, coreDecodedBytes: core.reduce((sum, item) => sum + item.decodedBodySize, 0), entered, destinations, idle, finalRenderer: final, finalTimings });
  console.log(JSON.stringify({ milestone: 'viewport complete', width, height, rooms: destinations.length }));
  await close(context);
}

async function loseContext(page) {
  const available = await page.evaluate(() => { const extension = window.__WORKSHOP_PHASE73_QA__?.current()?.gl.getContext().getExtension('WEBGL_lose_context'); if (!extension) return false; extension.loseContext(); return true; });
  assert.equal(available, true, 'Actual WEBGL_lose_context extension available');
}
async function roomError(page) { await page.locator('main[data-workshop-state="room-error"]').waitFor(); }
async function failureAndRetry(browser, assetGroups, room) {
  const { context, page, network } = await newPage(browser, assetGroups, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const matcher = `**${room.url}`;
  await page.route(matcher, route => route.fulfill({ status: 404, contentType: 'text/plain', body: 'missing QA room' }));
  try {
    await page.goto(base); await enter(page); const originCamera = await camera(page);
    await page.getByRole('button', { name: room.button, exact: true }).last().click(); await roomError(page); await sameRenderer(page);
    assert.equal(await game(page).getAttribute('data-world-point'), 'hub', `${room.id}: failed optional room preserves origin`); compareCamera(originCamera, await camera(page));
    const errorSnapshot = await rendererSnapshot(page); assert.ok(errorSnapshot.info.render.triangles > 0, 'Core remains rendered after room failure');
    await screenshot(page, `${room.id}-404`, true);
    await page.getByRole('button', { name: 'Abrir caso sin 3D', exact: true }).click();
    await page.locator(`main[data-project="${room.projectId}"]`).waitFor(); await page.waitForURL(url => url.searchParams.get('project') === room.projectId);
    await page.waitForFunction(() => !document.documentElement.dataset.portfolioTransition); await sameRenderer(page);
    const htmlPause = await noFrameSample(page, `${room.id}: failed room HTML fallback`);
    await page.getByRole('button', { name: 'Volver al taller', exact: true }).click(); await roomError(page); compareCamera(originCamera, await camera(page));
    await page.unroute(matcher); await page.getByRole('button', { name: 'Reintentar sala', exact: true }).click(); await stable(page, room.id); await sameRenderer(page);
    const retried = await rendererSnapshot(page); assert.ok(retried.roomMountedFrames[room.id], `${room.id}: retry contains actual meshes`);
    await inspectionProof(page, room); await screenshot(page, `${room.id}-retry`);
    for (const url of coreUrls) assert.equal(network.filter(resource => new URL(resource.url).pathname === url).length, 1, 'Optional retry never reloads core');
    results.scenarios.push({ name: `${room.id}:404 / exact origin / HTML fallback / targeted retry`, passed: true, errorSnapshot, retriedMemory: retried.info.memory, htmlPause });
  } finally { await close(context); }
}
async function heldRoom(browser, assetGroups, room, mode) {
  const { context, page } = await newPage(browser, assetGroups);
  let release, requestedResolve; const requested = new Promise(resolve => { requestedResolve = resolve; });
  let completedResolve; const completed = new Promise(resolve => { completedResolve = resolve; });
  page.on('requestfinished', async request => { if (new URL(request.url()).pathname === room.url) { const response = await request.response(); completedResolve({ outcome: 'finished', url: request.url(), status: response?.status() }); } });
  page.on('requestfailed', request => { if (new URL(request.url()).pathname === room.url) completedResolve({ outcome: 'failed', url: request.url(), failure: request.failure() }); });
  const releaseAndFinish = async () => {
    release(); let timer;
    const resource = await Promise.race([completed, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`Released room request did not finish/fail: ${room.id}`)), 30000); })]).finally(() => clearTimeout(timer));
    await page.waitForTimeout(500); return resource;
  };
  await page.route(`**${room.url}`, async route => { await new Promise(resolve => { release = resolve; requestedResolve(); }); if (mode === 'context-loss-late404') await route.fulfill({ status: 404, contentType: 'text/plain', body: 'late room404 after GPU loss' }).catch(() => {}); else await route.continue().catch(() => {}); });
  try {
    await page.goto(base); await enter(page); const before = await camera(page);
    await page.getByRole('button', { name: room.button, exact: true }).last().click();
    let timer; await Promise.race([requested, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`No held request for ${room.id}`)), 30000); })]).finally(() => clearTimeout(timer));
    await page.locator('main[data-workshop-state="room-loading"]').waitFor(); await sameRenderer(page);
    assert.equal(await game(page).getAttribute('data-world-point'), 'hub'); compareCamera(before, await camera(page));
    assert.equal(await page.getByText(`Cargando sala de ${room.name}`, { exact: true }).first().isVisible(), true, 'Real pending room label');
    await page.waitForTimeout(250); assert.equal(await game(page).getAttribute('data-workshop-state'), 'room-loading', 'Pending GLB cannot finish room load');
    assert.equal((await rendererSnapshot(page)).roomMountedFrames[room.id], undefined, 'Pending room has no useful frame yet');
    await screenshot(page, `${room.id}-held-${mode}`);
    let destination = 'hub', releasedResource;
    if (mode.startsWith('context-loss')) {
      await loseContext(page); await page.getByRole('heading', { name: 'El taller no está disponible', exact: true }).waitFor();
      releasedResource = await releaseAndFinish(); assert.equal(await game(page).getAttribute('data-workshop-state'), 'error', 'Late optional GLB cannot clear GPU failure');
      if (mode === 'context-loss-late404') assert.equal(releasedResource.status, 404, 'Actually completed held404 after GPU loss');
      await screenshot(page, `${room.id}-held-${mode}-result`);
      await page.getByRole('button', { name: 'Ver portafolio', exact: true }).click(); await page.getByRole('heading', { name: 'Daniel Cantor', exact: true }).waitFor();
    } else {
      if (mode === 'supersede') {
        const other = rooms[(rooms.findIndex(item => item.id === room.id) + 1) % rooms.length]; destination = other.id;
        await page.getByRole('button', { name: other.button, exact: true }).last().click(); await stable(page, other.id);
      } else if (mode === 'hub') {
        await page.getByRole('button', { name: 'El taller', exact: true }).click(); await stable(page, 'hub');
      } else {
        await page.getByRole('button', { name: 'Cancelar carga de sala', exact: true }).click(); await stable(page, 'hub');
      }
      const statesBeforeLate = await page.evaluate(() => window.__WORKSHOP_PHASE73_QA__.states.length);
      releasedResource = await releaseAndFinish(); await stable(page, destination); await sameRenderer(page);
      const lateStates = await page.evaluate(count => window.__WORKSHOP_PHASE73_QA__.states.slice(count), statesBeforeLate);
      assert.equal(lateStates.some(state => state.status === 'moving' || state.point === room.id), false, `${room.id}: late callback does not navigate`);
      if (destination === 'hub') compareCamera(before, await camera(page));
      const final = await rendererSnapshot(page); assert.ok(final.info.render.triangles > 0, 'Core remains usable after cancellation/supersession');
    }
    results.scenarios.push({ name: `${room.id}:held load / ${mode} / late callback ignored after resource completion`, passed: true, destination, releasedResource });
  } finally { release?.(); await close(context); }
}
async function coreFailure(browser, assetGroups, asset) {
  const { context, page } = await newPage(browser, assetGroups);
  const matcher = `**${asset.url}`; await page.route(matcher, route => route.fulfill({ status: 404, body: 'missing QA core' }));
  try {
    await page.goto(base); await page.getByRole('button', { name: 'Entrar al taller', exact: true }).click();
    await page.getByRole('heading', { name: 'El taller no está disponible', exact: true }).waitFor(); await screenshot(page, `${path.basename(asset.url, '.glb')}-404`);
    await page.unroute(matcher); await page.getByRole('button', { name: 'Reintentar', exact: true }).click(); await stable(page, 'hub');
    assert.ok((await rendererSnapshot(page)).firstUsableFrame, 'Core retry has actual useful main frame');
    results.scenarios.push({ name: `${path.basename(asset.url)}:core404/retry regression`, passed: true });
  } finally { await close(context); }
}
async function noWebGL(browser, assetGroups) {
  const { context, page } = await newPage(browser, assetGroups);
  await context.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (kind, ...args) { return /webgl/.test(kind) ? null : original.call(this, kind, ...args); }; });
  try {
    await page.goto(base); await page.getByRole('button', { name: 'Entrar al taller', exact: true }).click();
    await page.getByRole('heading', { name: 'El taller no está disponible', exact: true }).waitFor(); await screenshot(page, 'no-webgl');
    await page.getByRole('button', { name: 'Ver portafolio', exact: true }).click(); await page.getByRole('heading', { name: 'Daniel Cantor', exact: true }).waitFor();
    results.scenarios.push({ name: 'No WebGL / complete HTML portfolio alternative', passed: true });
  } finally { await close(context); }
}
async function visibilityAndResize(browser, assetGroups) {
  const { context, page, errors } = await newPage(browser, assetGroups, { deviceScaleFactor: 2 });
  try {
    await page.goto(base); await enter(page); await selectRoom(page, rooms[1]); const before = await camera(page), memoryBefore = (await rendererSnapshot(page)).info.memory;
    await setVisibility(page, 'hidden'); await noFrameSample(page, 'Hidden world initially paused', 350);
    const hiddenStart = await page.evaluate(() => ({ at: performance.now(), count: window.__WORKSHOP_PHASE73_QA__.frames.length }));
    await page.setViewportSize({ width: 390, height: 844 }); await page.waitForFunction(() => window.__WORKSHOP_PHASE73_QA__.current()?.size.width === 390); await page.waitForTimeout(500);
    const hiddenEnd = await page.evaluate(() => ({ at: performance.now(), count: window.__WORKSHOP_PHASE73_QA__.frames.length }));
    const hiddenResize = { sampledMs: hiddenEnd.at - hiddenStart.at, renderedFrames: hiddenEnd.count - hiddenStart.count, renderer: await rendererSnapshot(page) };
    results.scenarios.push({ name: 'Hidden world / resize / main renderer stays paused', passed: hiddenResize.renderedFrames === 0, visibilityFixture: 'QA property override plus native visibilitychange event; not physical background-tab timing', hiddenResize });
    assert.equal(hiddenResize.renderedFrames, 0, 'Hidden world resize cannot resume main rendering');
    await setVisibility(page, 'visible'); await stable(page, 'lorigine'); await sameRenderer(page); compareCamera(before, await camera(page));
    await page.setViewportSize({ width: 1440, height: 1000 }); await stable(page, 'lorigine');
    await page.getByRole('button', { name: rooms[1].open, exact: true }).click(); await page.locator('main[data-project="lorigine"]').waitFor(); await page.waitForFunction(() => !document.documentElement.dataset.portfolioTransition);
    await noFrameSample(page, 'Case initially paused', 350);
    const caseStart = await page.evaluate(() => ({ at: performance.now(), count: window.__WORKSHOP_PHASE73_QA__.frames.length }));
    const caseProfiles = [];
    for (const [width, height] of [[390, 844], [1440, 1000]]) {
      await page.setViewportSize({ width, height }); await page.waitForFunction(width => window.__WORKSHOP_PHASE73_QA__.current()?.size.width === width, width);
      await setVisibility(page, 'hidden'); await setVisibility(page, 'visible'); await page.waitForTimeout(400); caseProfiles.push(await rendererSnapshot(page));
    }
    const caseEnd = await page.evaluate(() => ({ at: performance.now(), count: window.__WORKSHOP_PHASE73_QA__.frames.length }));
    const caseResize = { sampledMs: caseEnd.at - caseStart.at, renderedFrames: caseEnd.count - caseStart.count, profiles: caseProfiles };
    results.scenarios.push({ name: 'Persistent hidden case / two resizes / visibility events / return pose', passed: caseResize.renderedFrames === 0, caseResize });
    assert.equal(caseResize.renderedFrames, 0, 'Reading case resize/visibility cannot resume main rendering');
    await page.getByRole('button', { name: 'Volver al taller', exact: true }).click(); await stable(page, 'lorigine'); await sameRenderer(page); compareCamera(before, await camera(page));
    assert.equal(await focused(page, rooms[1].open), true); const after = await rendererSnapshot(page);
    assert.equal(after.dpr, 1.5); assert.deepEqual(after.shadows.find(shadow => shadow.type === 'DirectionalLight').actual, [2048, 2048]);
    assert.ok(after.info.memory.textures <= memoryBefore.textures, 'Hidden profile changes do not retain additional renderer textures');
    await screenshot(page, 'hidden-resize-return'); assert.deepEqual(errors, []);
  } finally { await close(context); }
}
async function keyboardAndHistory(browser, assetGroups) {
  const { context, page, errors } = await newPage(browser, assetGroups, { viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', isMobile: true, hasTouch: true });
  try {
    await page.goto(base); await enter(page);
    for (const room of rooms) {
      let reached = false;
      for (let i = 0; i < 30; i++) { if (await focused(page, room.button)) { reached = true; break; } await page.keyboard.press('Tab'); }
      assert.ok(reached, `${room.id}: reachable using actual Tab sequence`); await page.keyboard.press('Enter'); await stable(page, room.id);
      assert.equal(await focused(page, room.open), true, `${room.id}: keyboard arrival focuses inspection action`);
      await page.keyboard.press('Enter'); await page.locator(`main[data-project="${room.projectId}"]`).waitFor();
      await page.waitForFunction(() => !document.documentElement.dataset.portfolioTransition); await sameRenderer(page);
      await page.getByRole('button', { name: 'Volver al taller', exact: true }).click(); await stable(page, room.id); assert.equal(await focused(page, room.open), true);
      await page.keyboard.press('Escape'); await stable(page, 'hub'); assert.equal(await focused(page, 'El taller'), true, 'Escape returns to hub control');
    }
    const origin = rooms.find(room => room.id === 'academy'); await selectRoom(page, origin); const before = await camera(page);
    await page.getByRole('button', { name: origin.open, exact: true }).click(); await page.locator('main[data-project="4ustudio-academy"]').waitFor();
    await page.getByRole('navigation', { name: 'Recorrido de proyectos', exact: true }).getByRole('button', { name: /Siguiente proyecto.*Drokex/ }).click();
    await page.locator('main[data-project="drokex"]').waitFor(); await sameRenderer(page);
    await page.goBack(); await page.locator('main[data-project="4ustudio-academy"]').waitFor();
    await page.goForward(); await page.locator('main[data-project="drokex"]').waitFor();
    await page.getByRole('button', { name: 'Volver al taller', exact: true }).click(); await stable(page, 'academy'); await sameRenderer(page); compareCamera(before, await camera(page));
    assert.equal(await focused(page, origin.open), true, 'Next-case/history returns to original Academy inspection, not viewed Drokex');
    await screenshot(page, 'history-different-case-origin'); assert.deepEqual(errors, []);
    results.scenarios.push({ name: 'Four keyboard destinations / reduced motion / Escape / next-case history preserves origin pose and focus', passed: true, origin: 'academy', viewed: 'drokex', before, after: await camera(page) });
  } finally { await close(context); }
  for (const room of rooms) {
    const { context, page, errors } = await newPage(browser, assetGroups);
    try {
      await page.goto(`${base}/?project=${room.projectId}`); await page.locator(`main[data-project="${room.projectId}"]`).waitFor();
      assert.equal(await page.locator('canvas').count(), 0, `${room.id}: direct case does not initialize GPU`); assert.equal((await resourceTimings(page, allUrls)).some(asset => asset.count > 0), false, 'Direct case does not request workshop GLB');
      await page.getByRole('button', { name: 'Volver al taller', exact: true }).click(); await page.getByRole('button', { name: 'Entrar al taller', exact: true }).waitFor();
      assert.equal(await page.locator('canvas').count(), 0); assert.equal(new URL(page.url()).searchParams.has('project'), false);
      await screenshot(page, `${room.id}-direct-case-return`); assert.deepEqual(errors, []);
      results.scenarios.push({ name: `${room.projectId}:direct link / no GPU / return to landing`, passed: true });
    } finally { await close(context); }
  }
}
async function classicCases(browser, assetGroups) {
  const { context, page, errors } = await newPage(browser, assetGroups);
  try {
    for (const room of rooms) {
      await page.goto(`${base}/?view=portfolio&project=${room.projectId}`); await page.locator(`main[data-project="${room.projectId}"]`).waitFor();
      await page.getByRole('button', { name: 'Volver a la ciudad', exact: true }).click(); await page.getByRole('heading', { name: 'Daniel Cantor', exact: true }).waitFor();
      assert.equal(new URL(page.url()).searchParams.has('project'), false); await page.reload(); await page.getByRole('heading', { name: 'Daniel Cantor', exact: true }).waitFor();
    }
    assert.deepEqual(errors, []); results.scenarios.push({ name: 'Four classic direct cases preserve Volver a la ciudad / reload behavior', passed: true });
  } finally { await close(context); }
}
async function restoredSnapshotRetry(browser, assetGroups) {
  const { context, page, errors } = await newPage(browser, assetGroups);
  try {
    await page.goto(base); await enter(page); await selectRoom(page, rooms[2]);
    await page.getByRole('button', { name: rooms[2].open, exact: true }).click(); await page.locator('main[data-project="4ustudio-academy"]').waitFor();
    await page.getByRole('button', { name: 'Next.js', exact: true }).click(); await page.getByRole('heading', { name: 'Daniel Cantor', exact: true }).waitFor();
    assert.equal(await game(page).count(), 0, 'Technology navigation genuinely unmounts workshop');
    await page.goBack(); await stable(page, 'academy');
    await page.waitForFunction(() => { const qa = window.__WORKSHOP_PHASE73_QA__, rendererId = qa.renderers.indexOf(qa.current()?.gl) + 1; return rendererId > 1 && qa.frames.some(frame => frame.rendererId === rendererId && frame.roomDraws.academy?.length); });
    await assertRoomPose(page, rooms[2]); const restored = await camera(page);
    const restoredRendererId = await page.evaluate(() => { const qa = window.__WORKSHOP_PHASE73_QA__; return qa.renderers.indexOf(qa.current().gl) + 1; });
    await loseContext(page); await page.getByRole('heading', { name: 'El taller no está disponible', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Reintentar', exact: true }).click(); await stable(page, 'hub');
    const retry = await page.evaluate(() => { const qa = window.__WORKSHOP_PHASE73_QA__, rendererId = qa.renderers.indexOf(qa.current().gl) + 1; return { rendererId, firstCore: qa.firstCoreByRenderer[rendererId], states: qa.states, camera: qa.camera() }; });
    assert.ok(retry.rendererId > restoredRendererId, 'Global retry mounts a fresh actual renderer'); assert.ok(retry.firstCore, 'Fresh renderer reached complete core frame');
    assert.deepEqual(retry.firstCore.camera, [-1.8, 1.65, 14], 'First actual core frame after snapshot retry starts at entrance');
    await screenshot(page, 'restored-snapshot-global-retry'); assert.deepEqual(errors, []);
    results.scenarios.push({ name: 'Academy snapshot / case technology navigation / history remount / actual GPU loss / global retry starts entrance', passed: true, restoredRendererId, restored, retry });
  } finally { await close(context); }
}
function visibleRooms(snapshot, assetGroups) {
  const visible = new Set(snapshot.nodes.filter(node => node.visible && node.vertices > 0).map(node => node.name));
  return assetGroups.rooms.filter(asset => asset.meshNames.every(name => visible.has(name))).map(asset => asset.id);
}
async function warmMemory(browser, assetGroups) {
  const { context, page, network, errors } = await newPage(browser, assetGroups);
  try {
    await page.goto(base); await enter(page);
    for (const room of rooms) await selectRoom(page, room);
    await page.getByRole('button', { name: 'El taller', exact: true }).click(); await stable(page, 'hub'); await page.waitForTimeout(400);
    const warm = await rendererSnapshot(page); const snapshots = [];
    assert.deepEqual(visibleRooms(warm, assetGroups), [], 'No optional room remains active at stable hub');
    for (let loop = 1; loop <= 2; loop++) {
      for (const room of rooms) {
        await selectRoom(page, room, `warm${loop}-${room.id}`); await page.waitForTimeout(350); await sameRenderer(page);
        const snapshot = await rendererSnapshot(page); assert.deepEqual(visibleRooms(snapshot, assetGroups), [room.id], 'Only selected room remains mounted after arrival');
        snapshots.push({ loop, room: room.id, memory: snapshot.info.memory, programs: snapshot.info.programs, visibleRooms: visibleRooms(snapshot, assetGroups) });
      }
      await page.getByRole('button', { name: 'El taller', exact: true }).click(); await stable(page, 'hub'); await page.waitForTimeout(400);
      const snapshot = await rendererSnapshot(page); snapshots.push({ loop, room: 'hub', memory: snapshot.info.memory, programs: snapshot.info.programs, visibleRooms: visibleRooms(snapshot, assetGroups) });
      assert.deepEqual(visibleRooms(snapshot, assetGroups), []);
      assert.ok(snapshot.info.memory.textures <= warm.info.memory.textures, `Loop${loop}: warm-cache texture count does not grow`);
      assert.ok(snapshot.info.memory.geometries <= warm.info.memory.geometries, `Loop${loop}: warm-cache geometry count does not grow`);
      assert.ok(snapshot.info.programs <= warm.info.programs, `Loop${loop}: shader programs do not grow`);
    }
    for (const url of allUrls) assert.equal(network.filter(resource => new URL(resource.url).pathname === url).length, 1, `${url}: warm cycles use same GLTF cache`);
    const idle = await noFrameSample(page, 'Warm-cache hub idle'); assert.deepEqual(errors, []);
    results.scenarios.push({ name: 'Two complete warm-cache room loops / one active room / actual renderer memory stable / resources loaded once', passed: true, baselineMemory: warm.info.memory, baselinePrograms: warm.info.programs, snapshots, idle });
  } finally { await close(context); }
}
async function projectedGlbHit(page, point) {
  return page.evaluate(coordinates => {
    const state = window.__WORKSHOP_PHASE73_QA__.current(), projected = state.camera.position.clone().set(...coordinates).project(state.camera), rect = state.gl.domElement.getBoundingClientRect();
    const x = rect.x + (projected.x + 1) * rect.width / 2, y = rect.y + (1 - projected.y) * rect.height / 2;
    state.raycaster.setFromCamera(state.pointer.clone().set(projected.x, projected.y), state.camera);
    const hit = state.raycaster.intersectObjects(state.scene.children, true).find(intersection => { if (!intersection.object.isMesh) return false; for (let node = intersection.object; node; node = node.parent) if (!node.visible) return false; return true; });
    return { worldPoint: coordinates, x, y, ndc: projected.toArray(), inside: Math.abs(projected.x) <= 1 && Math.abs(projected.y) <= 1 && Math.abs(projected.z) <= 1,
      receivesCanvas: document.elementFromPoint(x, y) === state.gl.domElement, hit: hit ? { name: hit.object.name, point: hit.point.toArray(), distance: hit.distance } : null };
  }, point);
}
async function raycastPortals(browser, assetGroups) {
  const { context, page, errors } = await newPage(browser, assetGroups);
  try {
    await page.goto(base); await enter(page); const rays = [];
    for (const room of rooms) {
      await page.getByRole('button', { name: 'El taller', exact: true }).click(); await stable(page, 'hub');
      const before = await camera(page);
      const count = await page.evaluate(point => { const qa = window.__WORKSHOP_PHASE73_QA__, state = qa.current(), count = qa.frames.length; state.camera.lookAt(...point); state.camera.updateMatrixWorld(); state.invalidate(); return count; }, room.portal);
      await page.waitForFunction(count => window.__WORKSHOP_PHASE73_QA__.frames.length > count, count);
      const reviewCamera = await camera(page); const candidates = []; let selected;
      for (const height of [1.35, 2, .75]) for (const offset of [0, -.65, .65]) {
        const point = [...room.portal]; point[1] = height; point[room.id === 'academy' || room.id === 'drokex' ? 2 : 0] += offset;
        const candidate = await projectedGlbHit(page, point); candidates.push(candidate);
        if (!selected && candidate.inside && candidate.receivesCanvas && candidate.hit?.name.includes(`roomgate__${room.id}`)) selected = candidate;
      }
      assert.ok(selected, `${room.id}: actual closed GLB gate exposes unobstructed raycast surface`);
      await screenshot(page, `${room.id}-raycast-gate-review`);
      await page.mouse.click(selected.x, selected.y); await stable(page, room.id); await assertRoomPose(page, room); await inspectionProof(page, room);
      rays.push({ room: room.id, beforeCamera: before, qaReviewCamera: reviewCamera, candidates, selected });
    }
    await page.getByRole('button', { name: 'El taller', exact: true }).click(); await stable(page, 'hub');
    const table = await projectedGlbHit(page, [1.8, 1.001, .1]); assert.ok(table.inside && table.receivesCanvas && table.hit, 'Real workbench surface is reachable');
    await page.mouse.click(table.x, table.y); await stable(page, 'workbench');
    await page.getByRole('button', { name: 'El taller', exact: true }).click(); await stable(page, 'hub');
    const beforeDrag = await camera(page), dragPoint = await projectedGlbHit(page, [1.8, 1.001, .1]);
    assert.ok(dragPoint.inside && dragPoint.receivesCanvas); const countBeforeDrag = await page.evaluate(() => window.__WORKSHOP_PHASE73_QA__.states.length);
    await page.mouse.move(dragPoint.x, dragPoint.y); await page.mouse.down(); await page.mouse.move(dragPoint.x + 40, dragPoint.y + 8, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(200);
    assert.equal(await game(page).getAttribute('data-world-point'), 'hub'); assert.equal(await game(page).getAttribute('data-workshop-state'), 'exploring');
    assert.equal(await page.evaluate(() => window.__WORKSHOP_PHASE73_QA__.states.length), countBeforeDrag, 'Drag does not trigger hidden navigation');
    const afterDrag = await camera(page); assert.ok(afterDrag.quaternion.some((value, index) => Math.abs(value - beforeDrag.quaternion[index]) > .001), 'Production drag changes actual camera orientation');
    assert.deepEqual(errors, []); results.scenarios.push({ name: 'Four real GLB portal raycasts / workbench / production drag threshold', passed: true, rays, table, beforeDrag, afterDrag });
  } finally { await close(context); }
}
async function monitorDrag(browser, assetGroups) {
  const { context, page, errors } = await newPage(browser, assetGroups);
  try {
    await page.goto(base); await enter(page); const samples = [];
    for (const room of rooms) {
      await selectRoom(page, room); const evidence = await inspectionProof(page, room);
      const monitor = evidence.images.find(image => image.location === 'physical world monitor' && image.cssVisible && image.uncoveredViewportSamples.length);
      assert.ok(monitor, `${room.id}: real exposed monitor image found`); const point = monitor.uncoveredViewportSamples[0];
      const before = await camera(page), stateCount = await page.evaluate(() => window.__WORKSHOP_PHASE73_QA__.states.length);
      const hit = await page.evaluate(({ x, y }) => { const node = document.elementFromPoint(x, y); return { tag: node?.tagName, class: String(node?.className || ''), style: node?.getAttribute('style') }; }, point);
      await page.mouse.move(point.x, point.y); await page.mouse.down(); await page.mouse.move(point.x + 42, point.y + 8, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(150);
      const after = await camera(page), changed = after.quaternion.some((value, index) => Math.abs(value - before.quaternion[index]) > .001);
      samples.push({ room: room.id, point, hit, before, after, changed }); results.currentMonitorDrag = samples;
      assert.ok(changed, `${room.id}: dragging on actual monitor image changes camera view`);
      assert.equal(await game(page).getAttribute('data-world-point'), room.id); assert.equal(await game(page).getAttribute('data-workshop-state'), 'exploring');
      assert.equal(await page.evaluate(() => window.__WORKSHOP_PHASE73_QA__.states.length), stateCount, 'Dragging monitor never starts hidden destination navigation');
      await screenshot(page, `${room.id}-monitor-drag`);
    }
    assert.deepEqual(errors, []); results.scenarios.push({ name: 'Four real monitor images pass pointer through to production canvas drag', passed: true, samples });
  } finally { await close(context); }
}

(async () => {
  const assetGroups = { core: coreUrls.map(url => assetInfo(url)), rooms: rooms.map(room => ({ ...assetInfo(room.url, room.id), camera: room.camera })) }; results.assets = assetGroups;
  assert.ok(assetGroups.core.reduce((sum, asset) => sum + asset.fileBytes, 0) <= 5000000, 'Core uncompressed file budget under5MB');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  results.environment = { browser: browser.version(), channel: 'chrome', headless: true, platform: os.platform(), architecture: os.arch(), release: os.release(), mode: 'local Next dev', cacheDisabled: true };
  try {
    if (section === 'probe') {
      const { context, page } = await newPage(browser, assetGroups); await page.goto(base); await enter(page); const core = await rendererSnapshot(page);
      assert.ok(core.firstUsableFrame); assert.equal(core.hookError, null); await selectRoom(page, rooms[0]); const room = await rendererSnapshot(page); assert.ok(room.roomMountedFrames.kliniu);
      await screenshot(page, 'probe-kliniu', true); results.probe = { core, room }; await close(context);
    }
    if (['full', 'viewports'].includes(section)) for (const [width, height] of [[1440, 1000], [1920, 1080], [390, 844], [320, 568]]) {
      if (section === 'viewports' && requestedViewportWidths.length && !requestedViewportWidths.includes(width)) continue;
      await viewportScenario(browser, assetGroups, width, height);
    }
    if (['full', 'rays'].includes(section)) await raycastPortals(browser, assetGroups);
    if (['full', 'rays', 'monitor-drag'].includes(section)) await monitorDrag(browser, assetGroups);
    if (['full', 'memory'].includes(section)) await warmMemory(browser, assetGroups);
    if (['full', 'navigation', 'visibility'].includes(section)) await visibilityAndResize(browser, assetGroups);
    if (['full', 'navigation', 'retry-snapshot'].includes(section)) await restoredSnapshotRetry(browser, assetGroups);
    if (['full', 'navigation'].includes(section)) { await keyboardAndHistory(browser, assetGroups); await classicCases(browser, assetGroups); }
    if (['full', 'resilience'].includes(section)) {
      for (const room of rooms) { await failureAndRetry(browser, assetGroups, room); for (const mode of ['cancel', 'hub', 'supersede', 'context-loss', 'context-loss-late404']) await heldRoom(browser, assetGroups, room, mode); console.log(JSON.stringify({ milestone: 'room resilience complete', room: room.id, cases: 6 })); }
      for (const asset of assetGroups.core) await coreFailure(browser, assetGroups, asset); await noWebGL(browser, assetGroups);
    }
    results.passed = true;
  } catch (error) {
    results.error = { message: error.message, stack: error.stack };
    if (activePage && !activePage.isClosed()) { await screenshot(activePage, `${section}-failure`, true).catch(() => {}); results.failureState = await activePage.evaluate(() => ({ url: location.href, title: document.title, state: document.querySelector('main[data-workshop-state]')?.dataset, active: document.activeElement?.outerHTML, text: document.body.innerText, qa: window.__WORKSHOP_PHASE73_QA__ ? { states: window.__WORKSHOP_PHASE73_QA__.states, hookError: window.__WORKSHOP_PHASE73_QA__.hookError } : null })).catch(() => null); }
    throw error;
  } finally {
    for (const context of contexts) await context.close().catch(() => {}); await browser.close();
  }
})().catch(error => { results.error ||= { message: error.message, stack: error.stack }; process.exitCode = 1; }).finally(() => {
  if (requestedViewportWidths.length) results.focusedViewportSubset = requestedViewportWidths;
  fs.writeFileSync(output(`${sectionLabel}-results.json`), JSON.stringify(results, null, 2)); fs.writeFileSync(output(`${sectionLabel}-browser.log`), logs.map(entry => JSON.stringify(entry)).join('\n') + '\n');
  console.log(JSON.stringify({ passed: results.passed, section: sectionLabel, error: results.error?.message, viewports: results.viewports.map(({ width, height, coreDecodedBytes, destinations, idle }) => ({ width, height, coreDecodedBytes, rooms: destinations.map(({ room, timing, motion, paused, cameraPixelDifference }) => ({ room, bytes: timing.decodedBodySize, motion, paused, cameraPixelDifference })), idle })), scenarios: results.scenarios.map(({ name, passed }) => ({ name, passed })), output: output(`${sectionLabel}-results.json`) }, null, 2));
});
