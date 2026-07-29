'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const CityNavigator = dynamic(
  () => import('./city-navigator').then((module) => module.CityNavigator),
  { ssr: false },
);

export function CityNavigatorLoader({ onProjectSelect }: { onProjectSelect: (id: string) => void }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const schedule = window.requestIdleCallback?.(() => setEnabled(true), { timeout: 1600 });
    if (schedule !== undefined) return () => window.cancelIdleCallback?.(schedule);
    const timeout = window.setTimeout(() => setEnabled(true), 700);
    return () => window.clearTimeout(timeout);
  }, []);

  return enabled ? <CityNavigator onProjectSelect={onProjectSelect} /> : null;
}
