'use client';

import { useWorkspaceStore, WORKSPACE_MODULES } from '../workspace-store';
import { PUBLIC_PROFILE } from '../../data/public-profile';
import type { TopBarProps } from './types';

export function TopBar({ className, onReturnToCity, ...rest }: TopBarProps & { onReturnToCity?: () => void }) {
  const currentModule = useWorkspaceStore((state) => state.currentModule);
  const label = WORKSPACE_MODULES.find(module => module.id === currentModule)?.label;
  return <header className={['command-topbar flex w-full shrink-0 items-center justify-between', className].filter(Boolean).join(' ')} {...rest}>
    <div className="flex items-center gap-24">
      {onReturnToCity ? <button type="button" className="command-identity" onClick={onReturnToCity}>{PUBLIC_PROFILE.name}<span>Command Center / Taller digital</span></button> : <div className="command-identity">{PUBLIC_PROFILE.name}<span>Command Center / Taller digital</span></div>}
      <span className="command-module-label">{label ?? 'Laboratorio'}</span>
    </div>
    {onReturnToCity && <button type="button" onClick={onReturnToCity} className="command-return-button">Volver a la ciudad</button>}
  </header>;
}
