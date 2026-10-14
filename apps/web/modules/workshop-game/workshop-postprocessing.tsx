'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { HalfFloatType, Vector2, Vector3, WebGLRenderTarget } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

/** 11.1/11.6: one shared grade so generated props and stylised rooms read as the same world. */
const GRADE = {
  day: { tint: new Vector3(1.03, 1, .95), saturation: .9, contrast: 1.05 },
  night: { tint: new Vector3(.94, .97, 1.08), saturation: .82, contrast: 1.08 },
};
const GradeShader = {
  uniforms: { tDiffuse: { value: null }, tint: { value: GRADE.day.tint.clone() }, saturation: { value: GRADE.day.saturation }, contrast: { value: GRADE.day.contrast } },
  vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform vec3 tint; uniform float saturation; uniform float contrast; varying vec2 vUv;
    void main() { vec4 c = texture2D(tDiffuse, vUv); float l = dot(c.rgb, vec3(.2126, .7152, .0722));
      vec3 g = mix(vec3(l), c.rgb, saturation) * tint; g = (g - .5) * contrast + .5; gl_FragColor = vec4(clamp(g, 0., 1.), c.a); }`,
};

/** Mean frame gap (ms) over a window of continuous frames above which the effects are dropped (~22 fps). */
const SLOW_FRAME_MS = 45;
const WINDOW = 45;

function Composer({ onSlow, night, lite }: { onSlow: () => void; night: boolean; lite: boolean }) {
  const { gl, scene, camera, size } = useThree();
  const composer = useMemo(() => {
    const target = new WebGLRenderTarget(size.width, size.height, { type: HalfFloatType, samples: lite ? 2 : 4 });
    const next = new EffectComposer(gl, target);
    next.addPass(new RenderPass(scene, camera));
    if (!lite) {
      const ao = new GTAOPass(scene, camera, size.width, size.height);
      ao.blendIntensity = .85;
      next.addPass(ao);
      // High threshold: only lamps and screens bloom, never the walls.
      next.addPass(new UnrealBloomPass(new Vector2(size.width, size.height), .22, .5, .92));
    }
    next.addPass(new OutputPass());
    next.addPass(new ShaderPass(GradeShader));
    return next;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- size is applied in the effect below
  }, [gl, scene, camera, lite]);
  useEffect(() => {
    composer.setPixelRatio(gl.getPixelRatio());
    composer.setSize(size.width, size.height);
  }, [composer, gl, size.width, size.height]);
  useEffect(() => () => composer.dispose(), [composer]);
  const { invalidate } = useThree();
  useEffect(() => {
    const grade = composer.passes[composer.passes.length - 1] as ShaderPass;
    const look = night ? GRADE.night : GRADE.day;
    grade.uniforms.tint!.value.copy(look.tint); grade.uniforms.saturation!.value = look.saturation; grade.uniforms.contrast!.value = look.contrast;
    invalidate();
  }, [composer, night, invalidate]);
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

// Phones get only the colour grade: AO + bloom cost too much fill rate there.
export function WorkshopPostprocessing({ night = false }: { night?: boolean }) {
  const { gl, size } = useThree();
  // ponytail: once a session is slow it stays plain; re-enabling on recovery would flap.
  const [slow, setSlow] = useState(false);
  useEffect(() => { gl.domElement.dataset.quality = slow ? 'low' : 'high'; }, [gl, slow]);
  return slow ? null : <Composer key={size.width <= 700 ? 'lite' : 'full'} lite={size.width <= 700} night={night} onSlow={() => setSlow(true)} />;
}
