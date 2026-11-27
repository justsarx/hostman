import { Globe, WifiHigh, WifiSlash } from '@phosphor-icons/react';

interface StatusBarProps {
  isOnline: boolean;
  activeEnvironmentName: string | null;
}

export function StatusBar({ isOnline, activeEnvironmentName }: StatusBarProps) {
  return (
    <footer className="flex h-7 shrink-0 items-center justify-between border-t border-rack-border bg-rack-canvas px-2.5 font-mono text-[11px] text-rack-muted">
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 font-medium ${
            isOnline ? 'text-emerald-400' : 'text-amber-400'
          }`}
        >
          {isOnline ? <WifiHigh size={13} weight="bold" /> : <WifiSlash size={13} weight="bold" />}
          <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </span>

        <span className="text-rack-border" aria-hidden="true">
          |
        </span>

        <span className="truncate">
          <span className="text-rack-dim">ENV: </span>
          <span className="text-rack-text">{activeEnvironmentName || 'NONE'}</span>
        </span>

        <span className="hidden text-rack-border sm:inline" aria-hidden="true">
          |
        </span>

        <span className="hidden items-center gap-1 text-rack-dim sm:inline-flex">
          <Globe size={12} weight="regular" />
          DIRECT BROWSER FETCH
        </span>
      </div>

      <div className="hidden items-center gap-3 text-[10px] uppercase tracking-wider text-rack-dim md:flex">
        <span>
          <kbd className="border border-rack-border bg-rack-surface px-1 text-rack-muted">^↵</kbd>{' '}
          SEND
        </span>
        <span>
          <kbd className="border border-rack-border bg-rack-surface px-1 text-rack-muted">^S</kbd>{' '}
          SAVE
        </span>
        <span>
          <kbd className="border border-rack-border bg-rack-surface px-1 text-rack-muted">^K</kbd>{' '}
          URL
        </span>
      </div>
    </footer>
  );
}
