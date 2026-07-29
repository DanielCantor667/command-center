import type { AppContainerProps } from './types';

export function AppContainer({ className, children, ...rest }: AppContainerProps) {
  return (
    <div className={['command-shell flex h-screen w-full flex-col overflow-hidden', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}
