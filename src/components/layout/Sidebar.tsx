import type { ReactNode } from 'react';
import {
  ClockCounterClockwise,
  FolderSimple,
  Plus,
  SidebarSimple,
  SlidersHorizontal,
} from '@phosphor-icons/react';
import type { SidebarSection } from '../../context/useWorkspace';
import type { Environment } from '../../types/api';

interface SidebarProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
  onNewRequest: () => void;
  environments: Environment[];
  activeEnvironmentId: string | null;
  onEnvironmentChange: (envId: string | null) => void;
  onOpenEnvModal?: () => void;
  collectionsSlot?: ReactNode;
  historySlot?: ReactNode;
  footerActionsSlot?: ReactNode;
}

export function Sidebar({
  isOpen,
  onToggleOpen,
  activeSection,
  onSectionChange,
  onNewRequest,
  environments,
  activeEnvironmentId,
  onEnvironmentChange,
  onOpenEnvModal,
  collectionsSlot,
  historySlot,
  footerActionsSlot,
}: SidebarProps) {
  if (!isOpen) {
    return (
      <aside
        aria-label="Workspace navigation collapsed"
        className="flex shrink-0 flex-row items-center justify-between border-b border-rack-border bg-rack-surface px-2 py-1.5 md:w-10 md:flex-col md:border-b-0 md:border-r md:px-0 md:py-2"
      >
        <button
          type="button"
          onClick={onToggleOpen}
          aria-label="Expand sidebar"
          className="inline-flex h-7 w-7 items-center justify-center rounded-[2px] border border-rack-border bg-rack-elevated text-rack-muted hover:border-rack-borderStrong hover:text-rack-text"
        >
          <SidebarSimple size={15} weight="regular" />
        </button>
        <button
          type="button"
          onClick={onNewRequest}
          aria-label="New Request"
          className="inline-flex h-7 w-7 items-center justify-center rounded-[2px] border border-rack-border bg-rack-elevated text-rack-accent hover:border-rack-accent"
        >
          <Plus size={15} weight="bold" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Workspace sidebar"
      className="flex max-h-[42dvh] w-full shrink-0 flex-col border-b border-rack-border bg-rack-surface md:h-full md:max-h-none md:w-72 md:border-b-0 md:border-r"
    >
      {/* Top Rack Section Label & Collapse */}
      <div className="flex h-9 items-center justify-between border-b border-rack-border px-3">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-rack-muted">
          Explorer
        </span>
        <button
          type="button"
          onClick={onToggleOpen}
          aria-label="Collapse sidebar"
          className="inline-flex h-6 w-6 items-center justify-center rounded-[2px] border border-transparent text-rack-muted hover:border-rack-border hover:bg-rack-elevated hover:text-rack-text"
        >
          <SidebarSimple size={15} weight="regular" />
        </button>
      </div>

      {/* Environment Selector + New Request */}
      <div className="flex flex-col gap-2 border-b border-rack-border p-2.5">
        <div className="flex items-center gap-1.5">
          <label htmlFor="env-selector" className="sr-only">
            Active Environment
          </label>
          <select
            id="env-selector"
            value={activeEnvironmentId ?? ''}
            onChange={(e) => onEnvironmentChange(e.target.value || null)}
            className="h-8 min-w-0 flex-1 rounded-[2px] border border-rack-border bg-rack-elevated px-2 font-mono text-xs text-rack-text focus:border-rack-accent focus:outline-none"
          >
            <option value="">NO ENVIRONMENT</option>
            {environments.map((env) => (
              <option key={env.id} value={env.id}>
                {env.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onOpenEnvModal}
            aria-label="Manage environments"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] border border-rack-border bg-rack-elevated text-rack-muted hover:border-rack-borderStrong hover:text-rack-text"
          >
            <SlidersHorizontal size={15} weight="regular" />
          </button>
        </div>

        <button
          type="button"
          onClick={onNewRequest}
          className="flex h-8 w-full items-center justify-center gap-1.5 rounded-[2px] border border-rack-borderStrong bg-rack-elevated px-3 font-mono text-xs font-medium uppercase tracking-wider text-rack-text hover:border-rack-accent hover:text-rack-accent"
        >
          <Plus size={14} weight="bold" />
          New Request
        </button>
      </div>

      {/* COLLECTIONS / HISTORY Switch */}
      <div
        role="tablist"
        aria-label="Sidebar sections"
        className="grid grid-cols-2 border-b border-rack-border bg-rack-canvas"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeSection === 'collections'}
          onClick={() => onSectionChange('collections')}
          className={`flex h-9 items-center justify-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-wider transition-colors ${
            activeSection === 'collections'
              ? 'bg-rack-surface text-rack-text'
              : 'text-rack-muted hover:text-rack-text'
          }`}
        >
          <FolderSimple size={14} weight={activeSection === 'collections' ? 'fill' : 'regular'} />
          Collections
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeSection === 'history'}
          onClick={() => onSectionChange('history')}
          className={`flex h-9 items-center justify-center gap-1.5 border-l border-rack-border font-mono text-[11px] font-medium uppercase tracking-wider transition-colors ${
            activeSection === 'history'
              ? 'bg-rack-surface text-rack-text'
              : 'text-rack-muted hover:text-rack-text'
          }`}
        >
          <ClockCounterClockwise
            size={14}
            weight={activeSection === 'history' ? 'bold' : 'regular'}
          />
          History
        </button>
      </div>

      {/* Active Section Content */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
        {activeSection === 'collections' ? (
          collectionsSlot ?? (
            <div className="border border-dashed border-rack-border p-3 font-mono text-xs text-rack-dim">
              Collections module initializing...
            </div>
          )
        ) : (
          historySlot ?? (
            <div className="border border-dashed border-rack-border p-3 font-mono text-xs text-rack-dim">
              History log empty.
            </div>
          )
        )}
      </div>

      {footerActionsSlot ? (
        <div className="border-t border-rack-border bg-rack-canvas p-2">{footerActionsSlot}</div>
      ) : null}
    </aside>
  );
}
