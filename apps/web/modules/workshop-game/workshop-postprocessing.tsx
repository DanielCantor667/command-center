'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { HalfFloatType, Vector2, WebGLRenderTarget } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

/** Mean frame gap (ms) over a window of continuous frames above which the effects are dropped (~22 fps). */
const SLOW_FRAME_MS = 45;
const WINDOW = 45;

function Composer({ onSlow }: { onSlow: () => void }) {
  const { gl, scene, camera, size } = useThree();
  const composer = useMemo(() => {
    const target = new WebGLRenderTarget(size.width, size.height, { type: HalfFloatType, samples: 4 });
    const next = new EffectComposer(gl, target);
    next.addPass(new RenderPass(scene, camera));
    const ao = new GTAOPass(scene, camera, size.width, size.height);
    ao.blendIntensity = .85;
    next.addPass(ao);
    // High threshold: only lamps and screens bloom, never the walls.
    next.addPass(new UnrealBloomPass(new Vector2(size.width, size.height), .22, .5, .92));
    next.addPass(new OutputPass());
    return next;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- size is applied in the effect below
  }, [gl, scene, camera]);
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

// Desktop only: AO + bloom cost too much fill rate on phones.
export function WorkshopPostprocessing() {
  const { gl, size } = useThree();
  // ponytail: once a session is slow it stays plain; re-enabling on recovery would flap.
  const [slow, setSlow] = useState(false);
  useEffect(() => { gl.domElement.dataset.quality = slow ? 'low' : 'high'; }, [gl, slow]);
  return size.width <= 700 || slow ? null : <Composer onSlow={() => setSlow(true)} />;
}
