'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CustomBlending, HalfFloatType, OneFactor, SrcAlphaFactor, Vector2, Vector3, WebGLRenderTarget, ZeroFactor, type PerspectiveCamera } from 'three';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { labTier, type LabTier } from './lab';
import { WORLD_VIEWS, type WorldPoint } from './world-state';

/** Mean frame gap (ms) over a window of continuous frames above which the effects are dropped (~22 fps). */
const SLOW_FRAME_MS = 45;
const WINDOW = 45;

/** R.3 (specs/workshop-realism.md): what each tier can pay for. `lite` is a phone-sized canvas, whatever its tier. */
export function postEffects(tier: LabTier, lite: boolean) {
  return { bloom: tier !== 'low' && !lite, depthOfField: tier === 'high' && !lite, grain: tier !== 'low' };
}

/** Blur per metre away from the focus, and its cap. Depth of field stays subtle: the labels must stay readable. */
const APERTURE = .002, MAX_BLUR = .007;
/**
 * Grade, vignette and grain in one pass. Every step multiplies: the DOM screens' holes (rgb 0, alpha 0) must stay
 * untouched, anything added there would glow over the HTML.
 */
const GRADE = {
  uniforms: { tDiffuse: { value: null }, grain: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float grain; varying vec2 vUv;
    float noise(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      float luma = dot(texel.rgb, vec3(.2126, .7152, .0722));
      vec3 tint = mix(vec3(.93, .97, 1.08), vec3(1.05, 1.0, .93), smoothstep(.02, .45, luma));
      vec2 edge = vUv - .5;
      float vignette = 1.0 - .55 * smoothstep(.2, .8, dot(edge, edge) * 2.0);
      float film = 1.0 + grain * (noise(vUv * 917.0) - .5);
      gl_FragColor = vec4(texel.rgb * tint * vignette * film, texel.a);
    }`,
};

/** Everything but the bake's look stays live: neon bloom, depth of field and the final grade. */
function Composer({ onSlow, lite, point, moving, reducedMotion }: { onSlow: () => void; lite: boolean; point: WorldPoint; moving: boolean; reducedMotion: boolean }) {
  const { gl, scene, camera, size, invalidate } = useThree();
  const composer = useMemo(() => {
    const target = new WebGLRenderTarget(size.width, size.height, { type: HalfFloatType, samples: lite ? 2 : 4 });
    const next = new EffectComposer(gl, target);
    const effects = postEffects(labTier(), lite);
    next.addPass(new RenderPass(scene, camera));
    // High threshold: only the neon strips (emissive above 1) bloom, never the baked walls.
    if (effects.bloom) {
      const bloom = new UnrealBloomPass(new Vector2(size.width, size.height), .35, .4, .95);
      // Additive on colour only (as AdditiveBlending), alpha untouched: the DOM screens' holes (alpha 0) must survive the bloom.
      Object.assign(bloom.blendMaterial, { blending: CustomBlending, blendSrc: SrcAlphaFactor, blendDst: OneFactor, blendSrcAlpha: ZeroFactor, blendDstAlpha: OneFactor });
      next.addPass(bloom);
    }
    if (effects.depthOfField) {
      const pass = new BokehPass(scene, camera, { focus: 3, aperture: APERTURE, maxblur: MAX_BLUR });
      // The stock shader writes alpha 1, which would close the holes of the DOM screens.
      pass.materialBokeh.fragmentShader = pass.materialBokeh.fragmentShader.replace('gl_FragColor.a = 1.0;', 'gl_FragColor.a = texture2D( tColor, vUv.xy ).a;');
      next.addPass(pass);
    }
    const grade = new ShaderPass(GRADE);
    grade.uniforms.grain!.value = effects.grain ? .06 : 0;
    next.addPass(grade);
    next.addPass(new OutputPass());
    return next;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- size is applied in the effect below
  }, [gl, scene, camera, lite]);
  // P.1 (specs/workshop-performance.md): one render with every pass still enabled compiles the depth of field behind
  // the loading panel; otherwise it compiles on the first stop and that frame stalls. Must run before the effect below.
  useEffect(() => { composer.render(); }, [composer]);
  // Focus on what the stop looks at. Off on the overview, on the way and for reduced motion.
  useEffect(() => {
    const pass = composer.passes.find(item => item instanceof BokehPass) as BokehPass | undefined;
    if (!pass) return;
    const view = WORLD_VIEWS[point];
    pass.enabled = !moving && !reducedMotion && point !== 'hub' && point !== 'entrance';
    const uniforms = pass.uniforms as Record<'focus' | 'aspect', { value: number }>;
    uniforms.focus.value = new Vector3(...view.position).distanceTo(new Vector3(...view.target));
    uniforms.aspect.value = (camera as PerspectiveCamera).aspect;
    invalidate();
  }, [camera, composer, invalidate, moving, point, reducedMotion, size.width, size.height]);
  useEffect(() => {
    composer.setPixelRatio(gl.getPixelRatio());
    composer.setSize(size.width, size.height);
  }, [composer, gl, size.width, size.height]);
  useEffect(() => () => composer.dispose(), [composer]);
  // Priority > 0 takes over the render call; frameloop stays 'demand'.
  const clock = useRef({ last: 0, total: 0, count: 0 });
  useFrame(() => {
    composer.render();
    const now = performance.now();
    const c = clock.current;
    // Only gaps between continuous frames count; idle gaps in the demand loop are ignored.
    if (c.last && now - c.last < 1000) { c.total += now - c.last; c.count++; }
    c.last = now;
    if (c.count >= WINDOW) {
      if (c.total / c.count > SLOW_FRAME_MS) onSlow();
      c.total = 0; c.count = 0;
    }
  }, 1);
  return null;
}

// Phones skip the bloom: it costs too much fill rate there.
export function WorkshopPostprocessing({ point, moving, reducedMotion }: { point: WorldPoint; moving: boolean; reducedMotion: boolean }) {
  const { gl, size } = useThree();
  // ponytail: once a session is slow it stays plain; re-enabling on recovery would flap.
  const [slow, setSlow] = useState(false);
  useEffect(() => { gl.domElement.dataset.quality = slow ? 'low' : 'high'; }, [gl, slow]);
  return slow ? null : <Composer key={size.width <= 700 ? 'lite' : 'full'} lite={size.width <= 700} point={point} moving={moving} reducedMotion={reducedMotion} onSlow={() => setSlow(true)} />;
}
