import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSceneSelection } from '../hooks/use-scene-selection';

describe('useSceneSelection', () => {
  it('starts with no selection', () => {
    const { result } = renderHook(() => useSceneSelection());
    expect(result.current.selectedId).toBeNull();
  });

  it('selects an object id', () => {
    const { result } = renderHook(() => useSceneSelection());

    act(() => {
      result.current.select('desk-1');
    });

    expect(result.current.selectedId).toBe('desk-1');
  });

  it('clears the selection', () => {
    const { result } = renderHook(() => useSceneSelection());

    act(() => {
      result.current.select('desk-1');
    });
    act(() => {
      result.current.clear();
    });

    expect(result.current.selectedId).toBeNull();
  });
});
