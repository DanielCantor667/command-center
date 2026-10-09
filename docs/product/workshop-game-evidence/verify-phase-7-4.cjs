// Actual Chrome evidence for Sprint7 / Phase7.4. No production instrumentation.
// Start only after root has restarted the checkout's Next server on port3000.
// node verify-phase-7-4.cjs [--probe|--viewports|--readers|--resilience|--navigation|--memory|--rays|--visibility]
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/Users/creativo/Documents/kliniu/node_modules/playwright');
const sharp = require(process.env.SHARP_PATH || '/Users/creativo/Documents/kliniu/node_modules/sharp');
const { PropertyBinding } = require(path.resolve(__dirname, '../../../apps/web/node_modules/three'));
const base = process.env.BASE_URL || 'http://localhost:3000';
const sections = ['selfcheck', 'probe', 'viewports', 'readers', 'resilience', 'navigation', 'memory', 'rays', 'paths', 'visibility'];
const section = sections.find(name => process.argv.includes(`--${name}`)) || 'full';
const requestedViewportWidths = (process.env.QA_VIEWPORTS || '').split(',').filter(Boolean).map(Number);
const sectionLabel = section === 'viewports' && requestedViewportWidths.length ? `${section}-${requestedViewportWidths.join('-')}` : section;
const output = name => path.join(__dirname, `phase74-${name}`);
const publicRoot = path.resolve(__dirname, '../../../apps/web/public');
const rooms = [
  { id: 'kliniu', projectId: 'kliniu', name: 'Kliniu', portal: [-5.1, 1.35, -3], camera: [-5.1, 1.65, -4], target: [-5.1, 1.5, -8.7], evidence: '/projects/kliniu-desktop.png' },
  { id: 'lorigine', projectId: 'lorigine', name: "L'ORIGINE", portal: [4.8, 1.35, -3], camera: [4.8, 1.65, -4.1], target: [4.8, 1.45, -8.5], evidence: '/projects/lorigine-catalog-v4.webp' },
  { id: 'academy', projectId: '4ustudio-academy', name: '4U Studio Academy', portal: [-4, 1.35, 5.7], camera: [-6.4, 1.65, 5.7], target: [-8.6, 1.4, 5.7], evidence: '/projects/academy-lessons-v4.webp' },
  { id: 'drokex', projectId: 'drokex', name: 'Drokex', portal: [4, 1.35, 5.7], camera: [6.4, 1.65, 5.7], target: [8.6, 1.4, 5.7], evidence: '/projects/drokex-products-v4.webp' },
].map(room => ({ ...room, url: `/models/workshop-game/room-${room.id}-v1.glb`, button: `Ir a ${room.name}`, open: `Abrir caso de ${room.name}` }));
const stationsUrl = '/models/workshop-game/workshop-stations-v1.glb';
const coreUrls = ['/models/workshop-game/workshop-shell-v2.glb', '/models/workshop-game/workshop-door-v1.glb', stationsUrl];
const stations = [
  { id: 'technologies', name: 'Tecnologías', open: 'Explorar tecnologías', camera: [-6.8,1.65,1.55], target: [-9.14,1.6,1.55], hit: [-8.948,2.45,1.55] },
  { id: 'trajectory', name: 'Trayectoria', open: 'Ver trayectoria', camera: [-7.7,1.65,.8], target: [-8.1,1.55,-2.65], hit: [-8.1,2.445,-2.389] },
  { id: 'contact', name: 'Contacto', open: 'Ver contacto', camera: [6.7,1.65,2.7], target: [6.7,1.3,1.45], hit: [6.7,1.74,1.512] },
].map(station => ({ ...station, button: `Ir a ${station.name}` }));
const destinations = [{id:'hub', name:'El taller', button:'El taller'}, {id:'workbench',name:'Mesa de trabajo',button:'Mesa de trabajo'}, ...rooms, ...stations];
const reader = (page, kind) => page.locator(`[data-workshop-reading="${kind}"]`).filter({visible:true});
let canonical;
const stationManifest=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../workshop-game-stations/manifest.json'),'utf8'));
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
  const qa = window.__WORKSHOP_PHASE74_QA__ = { stores: [], renderers: [], firstCoreByRenderer: {}, frames: [], states: [], activeMotion: null, activationAt: null, firstUsableFrame: null, roomMountedFrames: {}, roomRenderedAtPose: {}, expectedAssets, assetGroups };
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
          const asset = [...assetGroups.rooms, ...assetGroups.stations].find(asset => asset.meshNames.includes(object.name));
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
        for (const asset of [...assetGroups.rooms, ...assetGroups.stations]) {
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
  page.on('crash',()=>logs.push({type:'page-crash',url:page.url(),at:new Date().toISOString()}));
  page.on('close',()=>logs.push({type:'page-closed',url:page.url(),at:new Date().toISOString()}));
  page.on('response',response=>{if(response.status()>=400)logs.push({type:'http-error',url:response.url(),status:response.status()});});
  page.on('requestfailed',request=>logs.push({type:'request-failed',url:request.url(),failure:request.failure()}));
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
    return { url: location.href, title: document.title, state: document.querySelector('main[data-workshop-state]')?.dataset, active: document.activeElement?.outerHTML.slice(0, 1200), activeTag: document.activeElement?.tagName, text: document.body.innerText, keeper: keeper ? { style: keeper.getAttribute('style'), computedVisibility: getComputedStyle(keeper).visibility, inert: keeper.inert, ariaHidden: keeper.getAttribute('aria-hidden') } : null, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, states: window.__WORKSHOP_PHASE74_QA__?.states, focusCalls: window.__WORKSHOP_PHASE74_QA__?.focusCalls.slice(-30), focusEvents: window.__WORKSHOP_PHASE74_QA__?.focusEvents.slice(-40) };
  }).catch(() => null);
  contexts.delete(context); await context.close(); activePage = null;
}
async function stable(page, point) {
  await page.locator(`main[data-workshop-state="exploring"][data-world-point="${point}"]`).waitFor();
  await page.waitForFunction(() => !document.documentElement.dataset.portfolioTransition);
  await page.waitForTimeout(180);
}
async function enter(page) {
  await page.evaluate(() => { window.__WORKSHOP_PHASE74_QA__.activationAt = performance.now(); });
  await page.getByRole('button', { name: 'Entrar al taller', exact: true }).click(); await stable(page, 'hub');
  await page.waitForFunction(() => !!window.__WORKSHOP_PHASE74_QA__?.current()?.gl);
  await page.evaluate(() => { const qa = window.__WORKSHOP_PHASE74_QA__; qa.mainRenderer = qa.current().gl; qa.mainCanvas = qa.current().gl.domElement; });
}
async function screenshot(page, name, html = false) {
  await page.screenshot({ path: output(`${name}.jpg`), type: 'jpeg', quality: 88 });
  if (html) fs.writeFileSync(output(`${name}.html`), await page.content());
}
async function focused(page, name) { return page.getByRole('button', { name, exact: true }).evaluate(element => element === document.activeElement); }
async function sameRenderer(page) {
  assert.equal(await page.locator('[data-world-canvas] canvas').count(), 1, 'Exactly one workshop canvas remains mounted');
  assert.equal(await page.evaluate(() => { const qa = window.__WORKSHOP_PHASE74_QA__; return qa.current()?.gl === qa.mainRenderer && qa.current()?.gl.domElement === qa.mainCanvas && qa.mainCanvas.isConnected; }), true, 'Main renderer/canvas stays connected and identical');
}
async function camera(page) { return page.evaluate(() => window.__WORKSHOP_PHASE74_QA__.camera()); }
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
    const qa = window.__WORKSHOP_PHASE74_QA__, state = qa.current();
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
  const before = await page.evaluate(() => ({ at: performance.now(), count: window.__WORKSHOP_PHASE74_QA__.frames.length }));
  await page.waitForTimeout(duration);
  const after = await page.evaluate(() => ({ at: performance.now(), count: window.__WORKSHOP_PHASE74_QA__.frames.length }));
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
  await page.evaluate(label => { window.__WORKSHOP_PHASE74_QA__.activeMotion = label; }, label);
  await goDestination(page, room); await stable(page, room.id);
  await assertRoomPose(page, room);
  await page.evaluate(() => { window.__WORKSHOP_PHASE74_QA__.activeMotion = null; });
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
  const expected = (await page.viewportSize()).width <= 700 ? 3 : 10;
  const visibleButtons = buttons.filter({visible:true});
  assert.equal(await visibleButtons.count(), expected, 'Equivalent desktop destinations or compact mobile navigation');
  const boxes = await visibleButtons.evaluateAll(nodes => nodes.map(node => { const rect = node.getBoundingClientRect(); const target = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2); return { name: node.textContent.trim(), x: rect.x, y: rect.y, width: rect.width, height: rect.height, inside: rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth + 1 && rect.bottom <= innerHeight + 1, unobstructed: !!target && (target === node || node.contains(target)) }; }));
  for (const box of boxes) assert.ok(box.inside && box.unobstructed && box.height >= 32, `${box.name}: visible usable navigation control`);
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j]; assert.equal(a.x < b.x + b.width - 1 && a.x + a.width > b.x + 1 && a.y < b.y + b.height - 1 && a.y + a.height > b.y + 1, false, `${a.name}/${b.name}: no overlap`);
  }
  return boxes;
}
async function freeLookBeforeCase(page, room) {
  const point = await page.evaluate(() => {
    const canvas = window.__WORKSHOP_PHASE74_QA__.current().gl.domElement;
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


function canonicalData() {
  const ts = require(path.resolve(__dirname, '../../../apps/web/node_modules/typescript'));
  const prior = require.extensions['.ts'];
  require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, filename);
  try {
    const dataRoot = path.resolve(__dirname, '../../../apps/web/data');
    const { PORTFOLIO_TECHNOLOGIES: technologies, TECHNOLOGY_CATEGORIES: categories } = require(path.join(dataRoot, 'portfolio-technologies.ts'));
    const { PROJECTS: projects } = require(path.join(dataRoot, 'projects/projects.ts'));
    const { PORTFOLIO_CAREER: career } = require(path.join(dataRoot, 'portfolio-career.ts'));
    const { PUBLIC_PROFILE: profile } = require(path.join(dataRoot, 'public-profile.ts'));
    assert.equal(technologies.length, 34, 'Canonical 34 technologies');
    assert.equal(projects.filter(project => project.public).length, 7, 'Canonical seven public project records');
    return { technologies, categories, projects: projects.filter(project => project.public), career, profile };
  } finally { if (prior) require.extensions['.ts'] = prior; else delete require.extensions['.ts']; }
}
function readingUrl(kind, technologyId) {
  const url = new URL(base); url.searchParams.set('workshop', kind); if (technologyId) url.searchParams.set('technology', technologyId); return url.toString();
}
async function visibleReader(page, kind) {
  await reader(page, kind).waitFor({state:'visible'});
  const dialog = page.getByRole('dialog').filter({visible:true});
  assert.equal(await dialog.count(), 1, 'One visible reading dialog');
  assert.equal(await dialog.getAttribute('aria-modal'), 'true', 'Modal reading semantics');
  assert.equal(await dialog.evaluate(node => !!node.closest('main[data-workshop-state]')), false, 'Reader portal is outside inert game main');
  await page.waitForFunction(() => !document.documentElement.dataset.portfolioTransition);
  return dialog;
}
async function openMap(page) {
  const button = game(page).getByRole('button', {name:/mapa/i}).filter({visible:true}).first();
  await button.click(); return visibleReader(page, 'map');
}
async function mapButton(page, destination) {
  const dialog = await visibleReader(page, 'map');
  const exactNames = [destination.button, `Ir a ${destination.name}`, destination.name, `Visitar ${destination.name}`];
  for (const name of exactNames) { const button = dialog.getByRole('button', {name, exact:true}); if (await button.count()) return button; }
  const nav=dialog.getByRole('navigation',{name:'Destinos del taller',exact:true});const labelled=nav.getByRole('button',{name:new RegExp(`^${escapeRegex(destination.name)}(?:\\s|$)`)});if(await labelled.count()===1)return labelled;
  throw new Error(`No canonical equivalent map destination: ${destination.id}`);
}
async function goDestination(page, destination) {
  const nav = game(page).getByRole('navigation', {name:'Recorrer el taller',exact:true});
  const direct = nav.getByRole('button', {name:destination.button,exact:true}).filter({visible:true});
  if (await direct.count()) await direct.last().click();
  else { await openMap(page); await (await mapButton(page,destination)).click(); }
}
async function selectStation(page, station, segment=station.id) {
  await page.evaluate(label=>{window.__WORKSHOP_PHASE74_QA__.activeMotion=label;},segment);
  await goDestination(page,station); await stable(page,station.id); await assertRoomPose(page,station); await sameRenderer(page);
  await page.evaluate(()=>{window.__WORKSHOP_PHASE74_QA__.activeMotion=null;});
}
async function openStationReader(page, station) {
  const button = game(page).getByRole('button', {name:station.open,exact:true}).filter({visible:true});
  assert.equal(await button.count(),1,`${station.id}: concrete inspection action`); await button.click(); return visibleReader(page,station.id);
}
async function closeReading(page, kind) {
  await page.keyboard.press('Escape'); await reader(page,kind).waitFor({state:'hidden'});
  assert.equal(new URL(page.url()).searchParams.has('workshop'),false,'Escape removes reader query');
}
async function modalTabProof(page, kind) {
  const dialog = await visibleReader(page,kind);
  await page.waitForFunction(()=>{const dialog=document.querySelector('[role="dialog"][aria-modal="true"]');return !!dialog?.contains(document.activeElement);});
  const controls = dialog.locator('button:not([disabled]), a[href], input:not([disabled]), [tabindex="0"]').filter({visible:true});
  const count = await controls.count(); assert.ok(count>=1,'Reader has accessible close/control');
  const first=controls.first(),last=controls.last(); await last.focus(); await page.keyboard.press('Tab');
  assert.equal(await first.evaluate(node=>node===document.activeElement),true,'Tab cycles from final to first reader control');
  await first.focus(); await page.keyboard.press('Shift+Tab');
  assert.equal(await last.evaluate(node=>node===document.activeElement),true,'Shift+Tab cycles from first to final reader control');
  assert.equal(await dialog.evaluate(node=>node.contains(document.activeElement)),true,'Focus remains inside modal');
  return {focusableControls:count,tabCycle:true,shiftTabCycle:true};
}
async function readerPause(page, kind, resize=false) {
  await sameRenderer(page); assert.equal(await page.locator('canvas').count(),1,'HTML reader creates no additional Canvas');
  assert.equal(await game(page).evaluate(node=>node.inert||!!node.closest('[inert]')),true,'World is inert during reading');
  const before=await camera(page),idle=await noFrameSample(page,`${kind}: HTML read`);
  await setVisibility(page,'hidden'); await setVisibility(page,'visible'); const visibility=await noFrameSample(page,`${kind}: read remains paused after visibility`,300);
  let resizeProof=null;
  if(resize){
    const original=page.viewportSize(); const start=await page.evaluate(()=>({at:performance.now(),frames:window.__WORKSHOP_PHASE74_QA__.frames.length})); const profiles=[];
    for(const size of [{width:390,height:844},{width:1440,height:1000},original]){await page.setViewportSize(size);await page.waitForFunction(width=>window.__WORKSHOP_PHASE74_QA__.current()?.size.width===width,size.width);await page.waitForTimeout(400);profiles.push(await rendererSnapshot(page));}
    const end=await page.evaluate(()=>({at:performance.now(),frames:window.__WORKSHOP_PHASE74_QA__.frames.length})); resizeProof={sampledMs:end.at-start.at,renderedFrames:end.frames-start.frames,profiles};assert.equal(resizeProof.renderedFrames,0,'Reading resize never resumes main renderer');
  }
  compareCamera(before,await camera(page)); return {idle,visibility,resize:resizeProof,beforeCamera:before,afterCamera:await camera(page)};
}
async function readerLayout(page, kind) {
  const dialog=await visibleReader(page,kind);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Reader has no horizontal page overflow');
  const box=await dialog.boundingBox(); assert.ok(box&&box.x>=-1&&box.y>=-1&&box.x+box.width<=page.viewportSize().width+1&&box.y+box.height<=page.viewportSize().height+1,`${kind}: dialog fits viewport`);
  const close=dialog.getByRole('button',{name:/cerrar/i}).filter({visible:true}).first();
  assert.ok(await close.count(),`${kind}: visible close control`);
  const closeBox=await close.boundingBox();assert.ok(closeBox&&closeBox.y+closeBox.height<=page.viewportSize().height+1,`${kind}: close control remains on screen`);
  return {dialog:box,close:closeBox};
}
async function mapProof(page, worldAvailable) {
  await openMap(page);const dialog=await visibleReader(page,'map');
  const targets=[];for(const destination of destinations){const button=await mapButton(page,destination);targets.push({id:destination.id,name:await button.getAttribute('aria-label')||await button.innerText(),disabled:await button.isDisabled()});}
  assert.equal(targets.length,9,'Map exposes nine physical destinations'); assert.ok(await dialog.locator('svg').count()>0,'Map includes spatial SVG');
  for(const target of targets)assert.equal(target.disabled,!worldAvailable&&['hub','workbench'].includes(target.id),`${target.id}: map availability is truthful`);
  const tab=await modalTabProof(page,'map'),layout=await readerLayout(page,'map');return {targets,tab,layout};
}
async function canonicalCareerProof(dialog) {
  const text=await dialog.innerText();for(const group of ['experience','education'])for(const item of canonical.career[group])for(const field of ['title','organization','period'])assert.ok(text.includes(item[field]),`Canonical career ${item.id}/${field}`);
  for(const language of canonical.career.languages){assert.ok(text.includes(language.name));assert.ok(text.includes(language.level));}return {text,canonicalRecords:canonical.career.experience.length+canonical.career.education.length,languages:canonical.career.languages.length};
}
async function canonicalContactProof(dialog) {
  const text=await dialog.innerText();for(const field of ['name','location','role','availability'])assert.ok(text.includes(canonical.profile[field]),`Canonical public profile ${field}`);
  const links=await dialog.getByRole('link').evaluateAll(nodes=>nodes.map(node=>({text:node.textContent.trim(),href:node.href,target:node.target,rel:node.rel})));
  assert.deepEqual(links.map(link=>link.href).sort(),[canonical.profile.github,canonical.profile.linkedin].sort(),'Contact offers exactly authorized GitHub and LinkedIn');
  assert.equal(links.some(link=>/^mailto:|^tel:/.test(link.href)),false);for(const link of links)assert.ok(link.rel.includes('noopener')||link.rel.includes('noreferrer'),'External public channels prevent opener access');return {text,links};
}
async function technologiesProof(page, detailed=false) {
  const dialog=await visibleReader(page,'technologies');const catalog=dialog.getByRole('group',{name:'Catálogo de tecnologías',exact:true});
  const technologies=catalog.getByRole('button');assert.equal(await technologies.count(),canonical.technologies.length,'All34 canonical technologies are available');
  const actualLabels=await technologies.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('aria-label')));assert.deepEqual(actualLabels,[...canonical.technologies.map(tech=>`Explorar ${tech.name}`)],'Catalog exactly matches canonical technology data');
  assert.equal(await dialog.locator('canvas').count(),0,'Technology reader uses HTML/SVG instead of second renderer');
  const search=dialog.getByRole('searchbox',{name:'Buscar tecnología',exact:true}); await search.fill('zzQA-sin-coincidencias');await dialog.getByRole('heading',{name:'No hay coincidencias',exact:true}).waitFor();assert.equal(await technologies.count(),0);await dialog.getByRole('button',{name:'Limpiar filtros',exact:true}).click();assert.equal(await technologies.count(),34);
  const categories=dialog.getByRole('navigation',{name:'Categorías de tecnologías',exact:true});await categories.getByRole('button',{name:/^Frontend/}).click();
  assert.equal(await technologies.count(),canonical.technologies.filter(tech=>tech.category==='frontend').length,'Category count comes from canonical data');
  await categories.getByRole('button',{name:/^Todas/}).click();
  let associations=[];
  if(detailed){
    for(const tech of canonical.technologies){
      await catalog.getByRole('button',{name:`Explorar ${tech.name}`,exact:true}).click();await page.waitForURL(url=>url.searchParams.get('technology')===tech.id&&url.searchParams.get('workshop')==='technologies');
      const detail=dialog.getByRole('complementary',{name:'Detalle de tecnología',exact:true});await detail.getByRole('heading',{name:tech.name,exact:true}).waitFor();const text=await detail.innerText();assert.ok(text.includes(tech.description),`${tech.id}: exact documented description`);
      const related=canonical.projects.filter(project=>tech.projectIds.includes(project.id));
      const stacks=detail.getByRole('button',{name:/^Ver tecnologías de /});assert.equal(await stacks.count(),related.length,`${tech.id}: exact canonical related project count`);
      for(const project of related){await detail.getByRole('button',{name:`Ver tecnologías de ${project.name}`,exact:true}).waitFor();}
      if(!related.length)assert.ok(text.includes('Aún sin un proyecto asociado en este portafolio.'),`${tech.id}: absence of project evidence explicit`);
      associations.push({technologyId:tech.id,projectIds:related.map(project=>project.id)});
    }
    const coverage=[...new Set(associations.flatMap(item=>item.projectIds))].sort();assert.deepEqual(coverage,canonical.projects.map(project=>project.id).sort(),'All seven actual projects are available via documented technology associations');
  }
  await catalog.getByRole('button',{name:'Explorar Next.js',exact:true}).click();return {catalogCount:34,emptySearch:true,categoryFiltering:true,htmlOnly:true,associations};
}
function checkStationPath(frames,label) {
  const base=checkPath(frames,label); // Old bench and room partitions, plus new station clearances below.
  const obstacles=Object.entries(stationManifest.stations).map(([name,station])=>({name,minX:station.sourceBounds.min[0],maxX:station.sourceBounds.max[0],minZ:station.sourceBounds.min[2],maxZ:station.sourceBounds.max[2]}));
  for(const frame of frames)for(const box of obstacles){const [x,,z]=frame.camera;assert.equal(x>box.minX&&x<box.maxX&&z>box.minZ&&z<box.maxZ,false,`${label}: eye avoids ${box.name}`);}
  for(let i=1;i<frames.length;i++)for(const box of obstacles){let enter=0,exit=1;const a=frames[i-1].camera,b=frames[i].camera;let intersects=true;for(const [axis,min,max]of [[0,box.minX,box.maxX],[2,box.minZ,box.maxZ]]){const delta=b[axis]-a[axis];if(Math.abs(delta)<1e-12){if(a[axis]<=min||a[axis]>=max){intersects=false;break;}continue;}const bounds=[(min-a[axis])/delta,(max-a[axis])/delta].sort((x,y)=>x-y);enter=Math.max(enter,bounds[0]);exit=Math.min(exit,bounds[1]);if(enter>=exit){intersects=false;break;}}assert.equal(intersects&&enter<exit&&exit>0&&enter<1,false,`${label}: continuous eye segment avoids ${box.name}`);}
  return {...base,newStationFootprintsClear:true,obstacleBounds:obstacles,obstacleSource:'actual Blender source bounds in stations manifest'};
}
async function viewport74(browser,assetGroups,width,height) {
  const {context,page,errors,network}=await newPage(browser,assetGroups,{viewport:{width,height},deviceScaleFactor:2,reducedMotion:'no-preference',isMobile:width<=700,hasTouch:width<=700});
  try{
    await page.goto(base);assert.equal(await page.locator('canvas').count(),0,'Landing has no canvas');assert.equal((await resourceTimings(page,allUrls)).some(asset=>asset.count),false,'Landing has no GLB download');
    const landingMap=await mapProof(page,false);await screenshot(page,`${width}-landing-map`);await closeReading(page,'map');assert.equal(await page.locator('canvas').count(),0,'Landing map uses no GPU');
    await screenshot(page,`${width}-landing`);await enter(page);const entered=await rendererSnapshot(page);assert.ok(entered.firstUsableFrame,'Three essential GLBs appear in real first main frame');assert.equal(entered.hookError,null);
    assert.equal(entered.dpr,width<=700?1:1.5);const expectedShadow=width<=700?1024:2048;assert.deepEqual(entered.shadows.find(light=>light.type==='DirectionalLight').actual,[expectedShadow,expectedShadow]);assert.equal(entered.shadowAutoUpdate,false);
    assert.ok(entered.states.find(state=>state.status==='moving').at>=entered.firstUsableFrame.at,'Entry waits for stations+core useful frame');
    const timings=await resourceTimings(page,allUrls),core=timings.filter(asset=>coreUrls.includes(asset.url));for(const asset of assetGroups.core){const timing=core.find(item=>item.url===asset.url);assert.equal(timing.count,1);assert.equal(timing.decodedBodySize,asset.fileBytes);assert.ok(timing.responseEnd<=entered.firstUsableFrame.at+1);}assert.ok(core.reduce((sum,item)=>sum+item.decodedBodySize,0)<=5000000);
    for(const room of rooms)assert.equal(timings.find(asset=>asset.url===room.url).count,0,'Rooms remain lazy during core/stations entry');
    const stationProofs=[];await screenshot(page,`${width}-hub`);
    for(const station of stations){
      await selectStation(page,station,`cold-${station.id}`);const snapshot=await rendererSnapshot(page);assert.ok(snapshot.roomRenderedAtPose[station.id]?.meshesDrawn.length,`${station.id}: actual own GLB mesh submits at approved station pose`);await screenshot(page,`${width}-${station.id}-inspection`);
      const layout=await layoutProof(page),before=await camera(page);const dialog=await openStationReader(page,station);const content=station.id==='trajectory'?await canonicalCareerProof(dialog):station.id==='contact'?await canonicalContactProof(dialog):await technologiesProof(page,false);
      const readingLayout=await readerLayout(page,station.id),tab=await modalTabProof(page,station.id),paused=await readerPause(page,station.id,width===1440&&station.id==='technologies');await screenshot(page,`${width}-${station.id}-reader`,width===1440);
      await closeReading(page,station.id);await stable(page,station.id);await sameRenderer(page);compareCamera(before,await camera(page));assert.equal(await focused(page,station.open),true,`${station.id}: reader closes to original inspection CTA`);await screenshot(page,`${width}-${station.id}-return`);
      const frames=await page.evaluate(label=>window.__WORKSHOP_PHASE74_QA__.frames.filter(frame=>frame.motion&&frame.segment===label),`cold-${station.id}`);assert.ok(frames.length>=3,'Actual station travel samples');const spatial=checkStationPath(frames,station.id);
      stationProofs.push({station:station.id,layout,readingLayout,content,tab,paused,renderedAtPose:snapshot.roomRenderedAtPose[station.id],motion:summarizeFrames(frames),path:spatial,beforeCamera:before,afterCamera:await camera(page)});
    }
    const activeMap=await mapProof(page,true);await screenshot(page,`${width}-active-map`);await closeReading(page,'map');
    const roomProofs=[];
    for(const [index,room]of rooms.entries()){
      await selectRoom(page,room,`room-regression-${room.id}`);await sameRenderer(page);const snapshot=await rendererSnapshot(page);assert.ok(snapshot.roomRenderedAtPose[room.id]?.meshesDrawn.length,`${room.id}: room GLB actual draw`);
      const roomTimings=await resourceTimings(page,rooms.map(item=>item.url));for(const [otherIndex,other]of rooms.entries())assert.equal(roomTimings.find(asset=>asset.url===other.url).count,otherIndex<=index?1:0,'Selected-only lazy room requests');
      const evidence=await inspectionProof(page,room),layout=await layoutProof(page);await screenshot(page,`${width}-${room.id}-inspection`);const freeLook=await freeLookBeforeCase(page,room),before=await camera(page),canvasBefore=await page.locator('[data-world-canvas] canvas').screenshot();
      await page.getByRole('button',{name:room.open,exact:true}).click();await page.locator(`main[data-project="${room.projectId}"]`).waitFor();await page.waitForFunction(()=>!document.documentElement.dataset.portfolioTransition);await sameRenderer(page);const paused=await noFrameSample(page,`${room.id}: case regression`);
      await page.getByRole('button',{name:'Volver al taller',exact:true}).click();await stable(page,room.id);compareCamera(before,await camera(page));assert.equal(await focused(page,room.open),true);const canvasAfter=await page.locator('[data-world-canvas] canvas').screenshot();const [beforePixels,afterPixels]=await Promise.all([sharp(canvasBefore).ensureAlpha().raw().toBuffer(),sharp(canvasAfter).ensureAlpha().raw().toBuffer()]);assert.equal(beforePixels.length,afterPixels.length);let difference=0;for(let i=0;i<beforePixels.length;i++)difference+=Math.abs(beforePixels[i]-afterPixels[i]);const pixelDifference=difference/beforePixels.length;assert.ok(pixelDifference<2,'Return preserves actual camera pixels');
      await screenshot(page,`${width}-${room.id}-return`);roomProofs.push({room:room.id,evidence,layout,freeLook,paused,pixelDifference,beforeCamera:before,afterCamera:await camera(page),renderedAtPose:snapshot.roomRenderedAtPose[room.id]});
    }
    const idle=await noFrameSample(page,`${width}: complete world idle`),final=await rendererSnapshot(page),finalTimings=await resourceTimings(page,allUrls);for(const url of allUrls){assert.equal(finalTimings.find(item=>item.url===url).count,1);assert.equal(network.filter(item=>new URL(item.url).pathname===url).length,1);}assert.deepEqual(errors,[]);
    results.viewports.push({width,height,mobileEmulation:width<=700,deviceScaleFactor:2,landingMap,activeMap,entered,coreTimings:core,coreDecodedBytes:core.reduce((sum,item)=>sum+item.decodedBodySize,0),stations:stationProofs,destinations:roomProofs,idle,finalRenderer:final,finalTimings});console.log(JSON.stringify({milestone:'viewport complete',width,height,stations:3,rooms:4}));
  }finally{await close(context);}
}

function escapeRegex(value){return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
async function openRelatedProject(page,project){
  const dialog=await visibleReader(page,'technologies'),detail=dialog.getByRole('complementary',{name:'Detalle de tecnología',exact:true});
  const target=detail.getByRole('button',{name:new RegExp(`^${escapeRegex(project.name)}\\s*Ver proyecto$`)});assert.equal(await target.count(),1,`${project.id}: concrete related-case action`);await target.click();await page.locator(`main[data-project="${project.id}"]`).waitFor();await page.waitForFunction(()=>!document.documentElement.dataset.portfolioTransition);await page.waitForURL(url=>url.searchParams.get('project')===project.id);
}
async function returnToReader(page,kind){
  const names={technologies:/^Volver a tecnolog[ií]as$/i,trajectory:/^Volver a trayectoria$/i,contact:/^Volver a contacto$/i,map:/^Volver (al|a) mapa$/i};
  await page.getByRole('button',{name:names[kind]}).click();await visibleReader(page,kind);assert.equal(new URL(page.url()).searchParams.has('project'),false,'Case return removes only project');
}
async function detailedReaders(browser,assetGroups){
  const {context,page,errors}=await newPage(browser,assetGroups,{viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  try{
    await page.goto(readingUrl('technologies','nextjs'));const catalog=await technologiesProof(page,true);await screenshot(page,'all-technologies-canonical');
    const caseProofs=[];
    for(const project of canonical.projects){
      const technology=canonical.technologies.find(tech=>tech.projectIds.includes(project.id));assert.ok(technology,`${project.id}: actual documented relationship`);
      const dialog=await visibleReader(page,'technologies');await dialog.getByRole('group',{name:'Catálogo de tecnologías',exact:true}).getByRole('button',{name:`Explorar ${technology.name}`,exact:true}).click();await openRelatedProject(page,project);
      assert.equal(await page.locator('canvas').count(),0,'Related HTML case from direct reader starts no GPU');await screenshot(page,`reader-related-${project.id}`);await returnToReader(page,'technologies');
      assert.equal(new URL(page.url()).searchParams.get('technology'),technology.id,'Related case retains selected technology');assert.equal(await page.locator('canvas').count(),0);caseProofs.push({projectId:project.id,technologyId:technology.id,canvasCount:0});
    }
    const dialog=await visibleReader(page,'technologies');await dialog.getByRole('group',{name:'Catálogo de tecnologías',exact:true}).getByRole('button',{name:'Explorar Next.js',exact:true}).click();
    const nextDetail=dialog.getByRole('complementary',{name:'Detalle de tecnología',exact:true});const kliniu=canonical.projects.find(project=>project.id==='kliniu');await nextDetail.getByRole('button',{name:`Ver tecnologías de ${kliniu.name}`,exact:true}).click();
    await dialog.getByText(`Stack de ${kliniu.name}`,{exact:true}).waitFor();await dialog.getByRole('searchbox',{name:'Buscar tecnología',exact:true}).fill('next');
    const filteredCount=await dialog.getByRole('group',{name:'Catálogo de tecnologías',exact:true}).getByRole('button').count();assert.equal(filteredCount,1,'Canonical project+query filter reduces to Next.js');
    await openRelatedProject(page,kliniu);await returnToReader(page,'technologies');const returned=await visibleReader(page,'technologies');assert.equal(await returned.getByRole('searchbox',{name:'Buscar tecnología',exact:true}).inputValue(),'next');await returned.getByText(`Stack de ${kliniu.name}`,{exact:true}).waitFor();assert.equal(await returned.getByRole('group',{name:'Catálogo de tecnologías',exact:true}).getByRole('button').count(),filteredCount,'Reader filter state survives related case');
    await screenshot(page,'reader-filter-selection-return',true);await closeReading(page,'technologies');assert.equal(await page.locator('canvas').count(),0);assert.equal((await resourceTimings(page,allUrls)).some(asset=>asset.count),false);assert.deepEqual(errors,[]);
    results.scenarios.push({name:'34 canonical technologies / search/category/empty / seven real related projects / direct reader no GPU / selection and filters survive case',passed:true,catalog,caseProofs,filteredCount});
  }finally{await close(context);}
}
async function directLinks(browser,assetGroups){
  for(const kind of ['technologies','trajectory','contact','map']){
    const {context,page,errors}=await newPage(browser,assetGroups);
    try{
      await page.goto(readingUrl(kind,kind==='technologies'?'python':undefined));const dialog=await visibleReader(page,kind);assert.equal(await page.locator('canvas').count(),0);assert.equal((await resourceTimings(page,allUrls)).some(item=>item.count),false,'Direct HTML reading downloads no workshop GLB');
      if(kind==='technologies'){await dialog.getByRole('complementary',{name:'Detalle de tecnología'}).getByRole('heading',{name:'Python',exact:true}).waitFor();}
      if(kind==='trajectory')await canonicalCareerProof(dialog);if(kind==='contact')await canonicalContactProof(dialog);
      const tab=await modalTabProof(page,kind);await screenshot(page,`${kind}-direct-reader`);await page.reload();await visibleReader(page,kind);assert.equal(await page.locator('canvas').count(),0);await closeReading(page,kind);await page.getByRole('button',{name:'Entrar al taller',exact:true}).waitFor();await page.waitForFunction(()=>document.activeElement?.tagName==='BUTTON'&&document.activeElement.textContent.trim().startsWith('Entrar al taller'));assert.equal(await focused(page,'Entrar al taller'),true,'Direct reader close focuses explicit world activation');assert.deepEqual(errors,[]);
      results.scenarios.push({name:`${kind}: direct link / reload / Escape / Tab / no GPU`,passed:true,tab});
    }finally{await close(context);}
  }
  const {context,page,errors}=await newPage(browser,assetGroups);
  try{
    await page.goto(`${base}/?workshop=not-a-real-reader&technology=nonexistent`);await page.getByRole('button',{name:'Entrar al taller',exact:true}).waitFor();assert.equal(await page.getByRole('dialog').count(),0,'Unknown kind opens no invented reader');assert.equal(await page.locator('canvas').count(),0);
    await page.goto(`${base}/?workshop=technologies&technology=nonexistent`);const unknown=await reader(page,'technologies').count();if(unknown){const detail=await reader(page,'technologies').getByRole('complementary',{name:'Detalle de tecnología'}).innerText();assert.equal(detail.includes('nonexistent'),false,'Unknown technology cannot generate content');}assert.equal(await page.locator('canvas').count(),0);
    await page.goto(`${base}/?view=portfolio&workshop=contact`);await page.getByRole('heading',{name:'Daniel Cantor',exact:true}).waitFor();assert.equal(await page.getByRole('dialog').count(),0,'Classic mode remains its own public view');assert.deepEqual(errors,[]);results.scenarios.push({name:'Unknown reader/technology validation / classic view precedence',passed:true});
  }finally{await close(context);}
}
async function readerHistory(browser,assetGroups){
  const {context,page,errors}=await newPage(browser,assetGroups,{viewport:{width:390,height:844},reducedMotion:'reduce',isMobile:true,hasTouch:true});
  try{
    await page.goto(base);await enter(page);await selectRoom(page,rooms[2]);const origin=await camera(page);await game(page).getByRole('button',{name:rooms[2].open,exact:true}).click();await page.locator('main[data-project="4ustudio-academy"]').waitFor();await page.getByRole('button',{name:'Next.js',exact:true}).click();await visibleReader(page,'technologies');await sameRenderer(page);
    assert.equal(new URL(page.url()).searchParams.get('technology'),'nextjs');assert.equal(new URL(page.url()).searchParams.get('view'),null,'Case technology does not force classic portfolio');compareCamera(origin,await camera(page));const paused=await readerPause(page,'technologies',true);await screenshot(page,'case-technology-persistent-world');
    await closeReading(page,'technologies');await stable(page,'academy');await sameRenderer(page);compareCamera(origin,await camera(page));assert.equal(await focused(page,rooms[2].open),true,'Case→technology→world restores original Academy CTA');
    const map=await mapProof(page,true);await page.goBack(); // History reaches the earlier reading or case origin; production must remain deterministic.
    await page.waitForTimeout(200);const historyBack={url:page.url(),visibleReader:await page.locator('[data-workshop-reading]').filter({visible:true}).getAttribute('data-workshop-reading').catch(()=>null),caseId:await page.locator('main[data-project]').getAttribute('data-project').catch(()=>null)};
    await page.goForward();await visibleReader(page,'map');compareCamera(origin,await camera(page));await sameRenderer(page);await closeReading(page,'map');await stable(page,'academy');
    await selectStation(page,stations[0]);const stationOrigin=await camera(page);await openStationReader(page,stations[0]);const dialog=await visibleReader(page,'technologies');await dialog.getByRole('group',{name:'Catálogo de tecnologías'}).getByRole('button',{name:'Explorar Next.js',exact:true}).click();const kliniu=canonical.projects.find(project=>project.id==='kliniu');await openRelatedProject(page,kliniu);await sameRenderer(page);
    await page.goBack();await visibleReader(page,'technologies');await page.goForward();await page.locator('main[data-project="kliniu"]').waitFor();await returnToReader(page,'technologies');assert.equal(new URL(page.url()).searchParams.get('technology'),'nextjs');compareCamera(stationOrigin,await camera(page));await closeReading(page,'technologies');await stable(page,'technologies');assert.equal(await focused(page,stations[0].open),true);assert.deepEqual(errors,[]);
    results.scenarios.push({name:'Academy case→Next.js reader preserves canvas/camera / map back-forward / related case back-forward returns reader and station',passed:true,origin,paused,map,historyBack,stationOrigin});
  }finally{await close(context);}
}
async function keyboardStations(browser,assetGroups){
  const {context,page,errors}=await newPage(browser,assetGroups,{viewport:{width:320,height:568},reducedMotion:'reduce',isMobile:true,hasTouch:true});
  try{
    await page.goto(base);await enter(page);const samples=[];
    for(const station of stations){
      let reached=false;for(let i=0;i<30;i++){if(await game(page).getByRole('button',{name:/mapa/i}).filter({visible:true}).first().evaluate(node=>node===document.activeElement)){reached=true;break;}await page.keyboard.press('Tab');}assert.ok(reached,'Compact map control reachable through real Tab');await page.keyboard.press('Enter');await visibleReader(page,'map');const target=await mapButton(page,station);await target.focus();await page.keyboard.press('Enter');await stable(page,station.id);assert.equal(await focused(page,station.open),true);await page.keyboard.press('Enter');await visibleReader(page,station.id);const tab=await modalTabProof(page,station.id);await closeReading(page,station.id);await stable(page,station.id);assert.equal(await focused(page,station.open),true);await page.keyboard.press('Escape');await stable(page,'hub');assert.equal(await focused(page,'El taller'),true);samples.push({station:station.id,tab});
    }
    assert.deepEqual(errors,[]);results.scenarios.push({name:'320px actual Tab/Enter map and three stations / reduced motion / reader Escape restores CTA / next Escape returns hub',passed:true,samples});
  }finally{await close(context);}
}
async function loseContext(page) {
  const available = await page.evaluate(() => { const extension = window.__WORKSHOP_PHASE74_QA__?.current()?.gl.getContext().getExtension('WEBGL_lose_context'); if (!extension) return false; extension.loseContext(); return true; });
  assert.equal(available, true, 'Actual WEBGL_lose_context extension available');
}
async function roomError(page) { await page.locator('main[data-workshop-state="room-error"]').waitFor(); }
async function failureAndRetry(browser, assetGroups, room) {
  const { context, page, network } = await newPage(browser, assetGroups, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const matcher = `**${room.url}`;
  await page.route(matcher, route => route.fulfill({ status: 404, contentType: 'text/plain', body: 'missing QA room' }));
  try {
    await page.goto(base); await enter(page); const originCamera = await camera(page);
    await goDestination(page,room); await roomError(page); await sameRenderer(page);
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
    await goDestination(page,room);
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
        await goDestination(page,other); await stable(page, other.id);
      } else if (mode === 'hub') {
        await page.getByRole('button', { name: 'El taller', exact: true }).click(); await stable(page, 'hub');
      } else {
        await page.getByRole('button', { name: 'Cancelar carga de sala', exact: true }).click(); await stable(page, 'hub');
      }
      const statesBeforeLate = await page.evaluate(() => window.__WORKSHOP_PHASE74_QA__.states.length);
      releasedResource = await releaseAndFinish(); await stable(page, destination); await sameRenderer(page);
      const lateStates = await page.evaluate(count => window.__WORKSHOP_PHASE74_QA__.states.slice(count), statesBeforeLate);
      assert.equal(lateStates.some(state => state.status === 'moving' || state.point === room.id), false, `${room.id}: late callback does not navigate`);
      if (destination === 'hub') compareCamera(before, await camera(page));
      const final = await rendererSnapshot(page); assert.ok(final.info.render.triangles > 0, 'Core remains usable after cancellation/supersession');
    }
    results.scenarios.push({ name: `${room.id}:held load / ${mode} / late callback ignored after resource completion`, passed: true, destination, releasedResource });
  } finally { release?.(); await close(context); }
}

async function projectedGlbHit(page, point) {
  return page.evaluate(coordinates => {
    const state = window.__WORKSHOP_PHASE74_QA__.current(), projected = state.camera.position.clone().set(...coordinates).project(state.camera), rect = state.gl.domElement.getBoundingClientRect();
    const x = rect.x + (projected.x + 1) * rect.width / 2, y = rect.y + (1 - projected.y) * rect.height / 2;
    state.raycaster.setFromCamera(state.pointer.clone().set(projected.x, projected.y), state.camera);
    const hit = state.raycaster.intersectObjects(state.scene.children, true).find(intersection => { if (!intersection.object.isMesh) return false; for (let node = intersection.object; node; node = node.parent) if (!node.visible) return false; return true; });
    return { worldPoint: coordinates, x, y, ndc: projected.toArray(), inside: Math.abs(projected.x) <= 1 && Math.abs(projected.y) <= 1 && Math.abs(projected.z) <= 1,
      receivesCanvas: document.elementFromPoint(x, y) === state.gl.domElement, hit: hit ? { name: hit.object.name, point: hit.point.toArray(), distance: hit.distance } : null };
  }, point);
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

async function fallbackReaders(page,label){
  const map=await mapProof(page,false);assert.equal(await page.locator('canvas').count(),0,`${label}: fallback map starts no renderer`);
  await (await mapButton(page,stations[2])).click();const contact=await visibleReader(page,'contact');const proof=await canonicalContactProof(contact);await closeReading(page,'contact');
  await openMap(page);await (await mapButton(page,stations[1])).click();const trajectory=await canonicalCareerProof(await visibleReader(page,'trajectory'));await closeReading(page,'trajectory');
  await openMap(page);await (await mapButton(page,stations[0])).click();const technologies=await technologiesProof(page,false);await closeReading(page,'technologies');
  await openMap(page);await (await mapButton(page,rooms[0])).click();await page.locator('main[data-project="kliniu"]').waitFor();await returnToReader(page,'map');await closeReading(page,'map');
  assert.equal(await page.locator('canvas').count(),0,`${label}: fallback readings/case use no GPU`);return {map,contact:proof,trajectory,technologies};
}
async function coreFailure74(browser,assetGroups,asset){
  const {context,page,network}=await newPage(browser,assetGroups);const matcher=`**${asset.url}`;await page.route(matcher,route=>route.fulfill({status:404,body:'Phase74 intentionally missing essential asset'}));
  try{
    await page.goto(base);await page.getByRole('button',{name:'Entrar al taller',exact:true}).click();await page.getByRole('heading',{name:'El taller no está disponible',exact:true}).waitFor();await screenshot(page,`${path.basename(asset.url,'.glb')}-404`);
    const fallback=await fallbackReaders(page,path.basename(asset.url));await page.unroute(matcher);await page.getByRole('button',{name:'Reintentar',exact:true}).click();await stable(page,'hub');const retry=await rendererSnapshot(page);assert.ok(retry.firstUsableFrame,'Retry contains all three actual essential GLB meshes');for(const url of coreUrls)assert.equal((await resourceTimings(page,[url]))[0].count,2,'Whole joint core cache clears on any essential failure');
    await screenshot(page,`${path.basename(asset.url,'.glb')}-retry`);results.scenarios.push({name:`${path.basename(asset.url)}: essential404 / map and full HTML readers / whole-core retry`,passed:true,fallback,retry,network:network.filter(item=>coreUrls.includes(new URL(item.url).pathname))});
  }finally{await close(context);}
}
async function noWebGL74(browser,assetGroups){
  const {context,page}=await newPage(browser,assetGroups);await context.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return /webgl/.test(kind)?null:original.call(this,kind,...args);};});
  try{
    await page.goto(base);await page.getByRole('button',{name:'Entrar al taller',exact:true}).click();await page.getByRole('heading',{name:'El taller no está disponible',exact:true}).waitFor();const fallback=await fallbackReaders(page,'No WebGL');assert.equal((await resourceTimings(page,allUrls)).some(item=>item.count),false,'WebGL failure before import has no workshop model requests');await screenshot(page,'no-webgl-contact-map');results.scenarios.push({name:'No WebGL / map / three complete HTML readings / case / no GLB requests',passed:true,fallback});
  }finally{await close(context);}
}
async function gpuLossReading(browser,assetGroups){
  const {context,page}=await newPage(browser,assetGroups);
  try{
    await page.goto(base);await enter(page);await selectStation(page,stations[0]);await openStationReader(page,stations[0]);await noFrameSample(page,'Before actual GPU loss, reading paused',350);await loseContext(page);await page.locator('main[data-workshop-state="error"]').waitFor();const dialog=await visibleReader(page,'technologies');await dialog.getByRole('group',{name:'Catálogo de tecnologías'}).getByRole('button',{name:'Explorar Python',exact:true}).click();await screenshot(page,'gpu-loss-during-reader');await closeReading(page,'technologies');await page.getByRole('heading',{name:'El taller no está disponible',exact:true}).waitFor();const fallback=await fallbackReaders(page,'Actual GPU loss');await page.getByRole('button',{name:'Reintentar',exact:true}).click();await stable(page,'hub');const retried=await rendererSnapshot(page);assert.ok(retried.firstUsableFrame);assert.ok(retried.stores>1,'GPU retry uses fresh actual R3F store');assert.equal(await page.evaluate(()=>{const qa=window.__WORKSHOP_PHASE74_QA__;return qa.current().gl!==qa.mainRenderer&&qa.current().gl.domElement!==qa.mainCanvas;}),true,'Global GPU retry must replace lost renderer/canvas');await page.evaluate(()=>{const qa=window.__WORKSHOP_PHASE74_QA__;qa.mainRenderer=qa.current().gl;qa.mainCanvas=qa.current().gl.domElement;});await selectStation(page,stations[2]);await openStationReader(page,stations[2]);await canonicalContactProof(await visibleReader(page,'contact'));await closeReading(page,'contact');results.scenarios.push({name:'Actual WEBGL context loss during paused technology reading / content survives / map fallback / fresh full core retry / contact',passed:true,fallback,retried});
  }finally{await close(context);}
}
async function heldToStation(browser,assetGroups){
  const room=rooms[0],station=stations[2];const {context,page}=await newPage(browser,assetGroups);let release,requestedResolve;const requested=new Promise(resolve=>requestedResolve=resolve);let finishedResolve;const finished=new Promise(resolve=>finishedResolve=resolve);page.on('requestfinished',request=>{if(new URL(request.url()).pathname===room.url)finishedResolve('finished');});page.on('requestfailed',request=>{if(new URL(request.url()).pathname===room.url)finishedResolve('failed');});await page.route(`**${room.url}`,async route=>{await new Promise(resolve=>{release=resolve;requestedResolve();});await route.continue().catch(()=>{});});
  try{
    await page.goto(base);await enter(page);await goDestination(page,room);await requested;await page.locator('main[data-workshop-state="room-loading"]').waitFor();await goDestination(page,station);await stable(page,station.id);const before=await camera(page);release();let timer;const outcome=await Promise.race([finished,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Held room did not complete')),30000);})]).finally(()=>clearTimeout(timer));await page.waitForTimeout(500);await stable(page,station.id);compareCamera(before,await camera(page));assert.equal(await game(page).getAttribute('data-room-pending'),'','Station destination invalidates late optional room');const dialog=await openStationReader(page,station);await canonicalContactProof(dialog);await closeReading(page,station.id);results.scenarios.push({name:'Held Kliniu load / supersede with contact station / completed late response cannot move camera or replace station',passed:true,outcome,before,after:await camera(page)});
  }finally{release?.();await close(context);}
}
async function stationRays(browser,assetGroups){
  const {context,page,errors}=await newPage(browser,assetGroups);
  try{
    await page.goto(base);await enter(page);const rays=[];
    for(const station of stations){
      await goDestination(page,destinations[0]);await stable(page,'hub');const before=await camera(page);const anchor=stationManifest.stations[station.id].hitAnchor;const count=await page.evaluate(target=>{const qa=window.__WORKSHOP_PHASE74_QA__,state=qa.current(),count=qa.frames.length;state.camera.lookAt(...target);state.camera.updateMatrixWorld();state.invalidate();return count;},anchor);await page.waitForFunction(count=>window.__WORKSHOP_PHASE74_QA__.frames.length>count,count);const reviewCamera=await camera(page),candidates=[];let selected;
      for(const vertical of [0,-.12,.03])for(const lateral of [0,-.45,.45]){const point=[...anchor];point[1]+=vertical;point[station.id==='technologies'?2:0]+=lateral;const candidate=await projectedGlbHit(page,point);candidates.push(candidate);if(!selected&&candidate.inside&&candidate.receivesCanvas&&candidate.hit?.name===`stationhit__${station.id}`)selected=candidate;}
      assert.ok(selected,`${station.id}: physical own GLB hit is unobstructed by HTML/equipment`);await screenshot(page,`${station.id}-raycast-review`);await page.mouse.click(selected.x,selected.y);await stable(page,station.id);await assertRoomPose(page,station);await openStationReader(page,station);await closeReading(page,station.id);rays.push({station:station.id,beforeCamera:before,qaReviewCamera:reviewCamera,candidates,selected});
    }
    assert.deepEqual(errors,[]);results.scenarios.push({name:'Three actual station GLB raycasts / correct pose / matching concrete HTML reading',passed:true,rays});
  }finally{await close(context);}
}
async function stationPaths(browser,assetGroups){
  const {context,page,errors}=await newPage(browser,assetGroups,{reducedMotion:'no-preference'});
  try{
    await page.goto(base);await enter(page);const pathProofs=[];const sequence=['academy','technologies','contact','drokex','trajectory','academy','contact','kliniu','technologies','lorigine','contact','workbench','trajectory'];
    let origin='hub';for(const id of sequence){const destination=destinations.find(item=>item.id===id),label=`${origin}->${id}`;await page.evaluate(label=>{window.__WORKSHOP_PHASE74_QA__.activeMotion=label;},label);await goDestination(page,destination);await stable(page,id);await page.evaluate(()=>{window.__WORKSHOP_PHASE74_QA__.activeMotion=null;});const frames=await page.evaluate(label=>window.__WORKSHOP_PHASE74_QA__.frames.filter(frame=>frame.motion&&frame.segment===label),label);assert.ok(frames.length>=3,`${label}: actual movement measured`);pathProofs.push({origin,destination:id,motion:summarizeFrames(frames),spatial:checkStationPath(frames,label)});origin=id;}assert.deepEqual(errors,[]);results.scenarios.push({name:'13 actual station/front-room/rear-room/workbench travel segments / eye height / continuous obstacle clearance',passed:true,pathProofs});
  }finally{await close(context);}
}
async function readerMemory(browser,assetGroups){
  const {context,page,errors,network}=await newPage(browser,assetGroups);
  try{
    await page.goto(base);await enter(page);for(const room of rooms)await selectRoom(page,room);for(const station of stations){await selectStation(page,station);await openStationReader(page,station);await closeReading(page,station.id);}await goDestination(page,destinations[0]);await stable(page,'hub');await page.waitForTimeout(400);const baseline=await rendererSnapshot(page),snapshots=[];
    for(let loop=1;loop<=2;loop++){
      for(const station of stations){await selectStation(page,station);await openStationReader(page,station);const paused=await noFrameSample(page,`Warm reading loop${loop}/${station.id}`,300);await closeReading(page,station.id);await sameRenderer(page);snapshots.push({loop,station:station.id,paused,memory:(await rendererSnapshot(page)).info.memory});}
      for(const room of rooms)await selectRoom(page,room);await goDestination(page,destinations[0]);await stable(page,'hub');await page.waitForTimeout(400);const snapshot=await rendererSnapshot(page);assert.ok(snapshot.info.memory.textures<=baseline.info.memory.textures,'Warm reading/case loop retains no additional textures');assert.ok(snapshot.info.memory.geometries<=baseline.info.memory.geometries,'Warm reading/case loop retains no additional geometries');assert.ok(snapshot.info.programs<=baseline.info.programs,'Warm reading/case loop retains no additional programs');snapshots.push({loop,point:'hub',memory:snapshot.info.memory,programs:snapshot.info.programs});
    }
    for(const url of allUrls)assert.equal(network.filter(item=>new URL(item.url).pathname===url).length,1,'Core/stations/rooms fetched once despite warm reader cycles');const idle=await noFrameSample(page,'Complete warm world idle');assert.deepEqual(errors,[]);results.scenarios.push({name:'Two station-reader and four-room warm cycles / single renderer / seven GLBs fetched once / stable actual geometry-texture-program counts / idle0frames',passed:true,baselineMemory:baseline.info.memory,baselinePrograms:baseline.info.programs,snapshots,idle});
  }finally{await close(context);}
}

async function visibility74(browser,assetGroups){
  const {context,page,errors}=await newPage(browser,assetGroups,{deviceScaleFactor:2});
  try{
    await page.goto(base);await enter(page);await selectStation(page,stations[1]);const actualFreeLook=await freeLookBeforeCase(page,stations[1]);const before=await camera(page);await setVisibility(page,'hidden');await noFrameSample(page,'Hidden station world',350);const start=await page.evaluate(()=>({at:performance.now(),frames:window.__WORKSHOP_PHASE74_QA__.frames.length}));await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>window.__WORKSHOP_PHASE74_QA__.current()?.size.width===390);await page.waitForTimeout(500);const end=await page.evaluate(()=>({at:performance.now(),frames:window.__WORKSHOP_PHASE74_QA__.frames.length}));assert.equal(end.frames-start.frames,0,'Hidden station world resize stays paused');await setVisibility(page,'visible');await stable(page,'trajectory');compareCamera(before,await camera(page));await openStationReader(page,stations[1]);const paused=await readerPause(page,'trajectory',true);await closeReading(page,'trajectory');await stable(page,'trajectory');compareCamera(before,await camera(page));assert.equal(await focused(page,stations[1].open),true);await screenshot(page,'hidden-reader-resize-return');assert.deepEqual(errors,[]);results.scenarios.push({name:'Hidden station world resize / reader resize and visibility /0mainframes / exact return camera/focus',passed:true,visibilityFixture:'QA property override and native visibilitychange; physical background-tab scheduling is not measured',hiddenResize:{sampledMs:end.at-start.at,renderedFrames:end.frames-start.frames},actualFreeLook,paused});
  }finally{await close(context);}
}
async function directCaseRegression(browser,assetGroups){
  for(const room of rooms){const {context,page,errors}=await newPage(browser,assetGroups);try{await page.goto(`${base}/?project=${room.projectId}`);await page.locator(`main[data-project="${room.projectId}"]`).waitFor();assert.equal(await page.locator('canvas').count(),0);await page.getByRole('button',{name:'Volver al taller',exact:true}).click();await page.getByRole('button',{name:'Entrar al taller',exact:true}).waitFor();assert.equal(await page.locator('canvas').count(),0);assert.deepEqual(errors,[]);results.scenarios.push({name:`${room.projectId}: Phase7.3 direct HTML case/return no GPU regression`,passed:true});}finally{await close(context);}}
}
(async()=>{
  canonical=canonicalData();
  const kit=assetInfo(stationsUrl);assert.ok(kit.fileBytes<=1200000,'Station kit under1.2MB');assert.ok(kit.triangles<12000,'Station kit under12k triangles');assert.ok(kit.primitives<=13,'Station kit <=13 primitives');
  const assetGroups={core:coreUrls.map(url=>assetInfo(url)),rooms:rooms.map(room=>({...assetInfo(room.url,room.id),camera:room.camera})),stations:stations.map(station=>({id:station.id,camera:station.camera,meshNames:kit.meshNames.filter(name=>name===`stationhit__${station.id}`||name.startsWith(`station__${station.id}__`))}))};results.assets=assetGroups;results.canonical={technologyCount:canonical.technologies.length,publicProjectIds:canonical.projects.map(project=>project.id),career:canonical.career,profile:canonical.profile};results.stationKit=kit;assert.ok(assetGroups.core.reduce((sum,asset)=>sum+asset.fileBytes,0)<=5000000,'Core uncompressed bytes <=5MB');for(const station of assetGroups.stations)assert.ok(station.meshNames.length,'Each station has own named physical GLB mesh');
  if(section==='selfcheck'){results.selfcheck={syntaxAndCanonicalData:true,assetBudgets:true,canonicalCounts:true,noBrowserStarted:true};results.passed=true;return;}
  const browser=await chromium.launch({channel:'chrome',headless:true});browser.on('disconnected',()=>logs.push({type:'browser-disconnected',at:new Date().toISOString()}));results.environment={browser:browser.version(),channel:'chrome',headless:true,platform:os.platform(),architecture:os.arch(),release:os.release(),mode:'local Next dev',cacheDisabled:true};
  try{
    if(section==='probe'){
      const {context,page}=await newPage(browser,assetGroups);try{await page.goto(base);await enter(page);const core=await rendererSnapshot(page);assert.ok(core.firstUsableFrame);assert.equal(core.hookError,null);await screenshot(page,'probe-hub');const stationProofs=[];for(const station of stations){await selectStation(page,station);const snapshot=await rendererSnapshot(page);assert.ok(snapshot.roomRenderedAtPose[station.id]?.meshesDrawn.length,'Physical station mesh actually draws at pose');await screenshot(page,`probe-${station.id}-inspection`);const dialog=await openStationReader(page,station);if(station.id==='contact')await canonicalContactProof(dialog);if(station.id==='trajectory')await canonicalCareerProof(dialog);await screenshot(page,`probe-${station.id}-reader`,true);await closeReading(page,station.id);await stable(page,station.id);assert.equal(await focused(page,station.open),true);stationProofs.push({station:station.id,snapshot});}results.probe={core,stations:stationProofs};}finally{await close(context);}
    }
    if(['full','viewports'].includes(section))for(const [width,height]of [[1440,1000],[1920,1080],[390,844],[320,568]]){if(section==='viewports'&&requestedViewportWidths.length&&!requestedViewportWidths.includes(width))continue;await viewport74(browser,assetGroups,width,height);}
    if(['full','readers'].includes(section))await detailedReaders(browser,assetGroups);
    if(['full','navigation'].includes(section)){await directLinks(browser,assetGroups);await readerHistory(browser,assetGroups);await keyboardStations(browser,assetGroups);await directCaseRegression(browser,assetGroups);await classicCases(browser,assetGroups);}
    if(['full','resilience'].includes(section)){for(const asset of assetGroups.core)await coreFailure74(browser,assetGroups,asset);await noWebGL74(browser,assetGroups);await gpuLossReading(browser,assetGroups);await heldToStation(browser,assetGroups);for(const room of rooms)await failureAndRetry(browser,assetGroups,room);for(const mode of ['cancel','supersede','context-loss-late404'])await heldRoom(browser,assetGroups,rooms[0],mode);}
    if(['full','rays'].includes(section))await stationRays(browser,assetGroups);
    if(['full','paths'].includes(section))await stationPaths(browser,assetGroups);
    if(['full','memory'].includes(section))await readerMemory(browser,assetGroups);
    if(['full','visibility'].includes(section))await visibility74(browser,assetGroups);
    results.passed=true;
  }catch(error){results.error={message:error.message,stack:error.stack};if(activePage&&!activePage.isClosed()){await screenshot(activePage,`${section}-failure`,true).catch(()=>{});results.failureState=await activePage.evaluate(()=>({url:location.href,title:document.title,state:document.querySelector('main[data-workshop-state]')?.dataset,active:document.activeElement?.outerHTML,text:document.body.innerText,qa:window.__WORKSHOP_PHASE74_QA__?{states:window.__WORKSHOP_PHASE74_QA__.states,hookError:window.__WORKSHOP_PHASE74_QA__.hookError}:null})).catch(()=>null);}throw error;
  }finally{for(const context of contexts)await context.close().catch(()=>{});await browser.close();}
})().catch(error=>{results.error||={message:error.message,stack:error.stack};process.exitCode=1;}).finally(()=>{
  if(requestedViewportWidths.length)results.focusedViewportSubset=requestedViewportWidths;
  fs.writeFileSync(output(`${sectionLabel}-results.json`),JSON.stringify(results,null,2));fs.writeFileSync(output(`${sectionLabel}-browser.log`),logs.map(entry=>JSON.stringify(entry)).join('\n')+'\n');console.log(JSON.stringify({passed:results.passed,section:sectionLabel,error:results.error?.message,viewports:results.viewports.map(({width,height,coreDecodedBytes,stations,destinations,idle})=>({width,height,coreDecodedBytes,stationCount:stations.length,roomCount:destinations.length,idle})),scenarios:results.scenarios.map(({name,passed})=>({name,passed})),output:output(`${sectionLabel}-results.json`)},null,2));
});
