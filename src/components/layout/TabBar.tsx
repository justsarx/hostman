import { Plus, X } from '@phosphor-icons/react';
import type { RequestTab } from '../../types/api';
import { MethodBadge } from '../common/MethodBadge';

interface TabBarProps {
  tabs: RequestTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onNewTab: () => void;
}

export function TabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
}: TabBarProps) {
  return (
    <div className="flex h-10 shrink-0 items-stretch border-b border-rack-border bg-rack-canvas">
      <div
        role="tablist"
        aria-label="Open requests"
        className="flex min-w-0 flex-1 items-stretch overflow-x-auto"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              className={`group flex max-w-[220px] shrink-0 items-center border-r border-rack-border ${
                isActive ? 'bg-rack-surface' : 'bg-rack-canvas hover:bg-rack-surface/60'
              }`}
            >
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectTab(tab.id)}
                className="flex h-full min-w-0 flex-1 items-center gap-2 px-3 text-left"
              >
                <MethodBadge method={tab.request.method} size="sm" />
                <span
                  className={`truncate font-mono text-xs ${
                    isActive ? 'text-rack-text' : 'text-rack-muted'
                  }`}
                >
                  {tab.request.name || 'Untitled Request'}
                </span>
                {tab.isDirty ? (
                  <span
                    className="shrink-0 font-mono text-xs font-bold text-rack-accent"
                    aria-label="Unsaved changes"
                  >
                    *
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                onClick={() => onCloseTab(tab.id)}
                aria-label={`Close ${tab.request.name || 'Untitled Request'}`}
                className="mr-1.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] text-rack-dim hover:bg-rack-elevated hover:text-rack-text"
              >
                <X size={12} weight="bold" />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onNewTab}
        aria-label="Open new request tab"
        className="inline-flex w-10 shrink-0 items-center justify-center border-l border-rack-border bg-rack-canvas text-rack-muted hover:bg-rack-elevated hover:text-rack-text"
      >
        <Plus size={15} weight="bold" />
      </button>
    </div>
  );
}
