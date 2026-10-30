import { describe, expect, it } from 'vitest';
import { postEffects } from '../workshop-postprocessing';

describe('post effects by quality', () => {
  it('gives each tier the plan of the spec', () => {
    expect(postEffects('high', false)).toEqual({ bloom: true, depthOfField: true, grain: true });
    expect(postEffects('medium', false)).toEqual({ bloom: true, depthOfField: false, grain: true });
    expect(postEffects('low', false)).toEqual({ bloom: false, depthOfField: false, grain: false });
  });

  it('never pays for bloom or depth of field on a phone-sized canvas', () => {
    expect(postEffects('high', true)).toEqual({ bloom: false, depthOfField: false, grain: true });
  });
});
