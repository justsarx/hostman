import { NavLink } from 'react-router-dom';
import { Flask, FolderSimple, Moon, SlidersHorizontal, Sun, TerminalWindow } from '@phosphor-icons/react';
import { useWorkspace } from '../../context/useWorkspace';
import { useColorScheme } from '../../hooks/useColorScheme';

export function TopNav() {
  const { tabs, savedRequests, environments, activeEnvironment } = useWorkspace();
  const { resolvedScheme, toggleScheme } = useColorScheme();

  const navItems = [
    {
      to: '/',
      label: 'Workbench',
      icon: TerminalWindow,
      badge: `${tabs.length}`,
      end: true,
    },
    {
      to: '/collections',
      label: 'Collections',
      icon: FolderSimple,
      badge: `${savedRequests.length}`,
      end: false,
    },
    {
      to: '/environments',
      label: 'Environments',
      icon: SlidersHorizontal,
      badge: `${environments.length}`,
      end: false,
    },
    {
      to: '/mock-lab',
      label: 'Mock Lab',
      icon: Flask,
      badge: 'LOCAL',
      end: false,
    },
  ];

  const nextSchemeLabel = resolvedScheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <header className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-rack-border bg-rack-canvas px-3">
      <div className="flex min-w-0 items-center gap-3 overflow-x-auto">
        <NavLink to="/" className="flex shrink-0 items-center gap-2 pr-2">
          <span className="inline-block h-2 w-2 bg-rack-accent" aria-hidden="true" />
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-rack-text">
            Hostman
          </span>
          <span className="rounded-[2px] border border-rack-border bg-rack-elevated px-1 py-0.5 font-mono text-[10px] text-rack-dim">
            v1
          </span>
        </NavLink>

        <nav aria-label="Primary" className="flex items-stretch gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative flex h-10 shrink-0 items-center gap-1.5 px-2.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'bg-rack-surface text-rack-text after:absolute after:inset-x-0 after:bottom-0 after:border-b-2 after:border-rack-accent'
                      : 'text-rack-muted hover:bg-rack-surface/50 hover:text-rack-text'
                  }`
                }
              >
                <Icon size={14} weight="regular" />
                <span>{item.label}</span>
                <span className="tabular-nums rounded-[2px] border border-rack-border bg-rack-elevated px-1 py-0.5 text-[9px] text-rack-dim">
                  {item.badge}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden items-center gap-2 font-mono text-[10px] text-rack-muted lg:flex">
          <span className="text-rack-dim">ACTIVE ENV:</span>
          <span className="rounded-[2px] border border-rack-border bg-rack-elevated px-2 py-0.5 text-rack-text">
            {activeEnvironment?.name ?? 'NONE'}
          </span>
        </div>

        <button
          type="button"
          onClick={toggleScheme}
          aria-label={nextSchemeLabel}
          className="inline-flex h-7 items-center gap-1.5 rounded-[2px] border border-rack-border bg-rack-elevated px-2 font-mono text-[10px] uppercase tracking-wider text-rack-muted hover:border-rack-borderStrong hover:text-rack-text"
        >
          {resolvedScheme === 'dark' ? (
            <>
              <Sun size={13} weight="bold" aria-hidden="true" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon size={13} weight="bold" aria-hidden="true" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
