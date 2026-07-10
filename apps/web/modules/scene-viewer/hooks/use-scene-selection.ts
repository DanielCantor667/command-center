import { useCallback, useState } from 'react';

export function useSceneSelection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const select = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const clear = useCallback(() => {
    setSelectedId(null);
  }, []);

  return { selectedId, select, clear };
}
