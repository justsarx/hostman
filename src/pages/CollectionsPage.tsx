import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowSquareOut,
  ClockCounterClockwise,
  CopySimple,
  FolderPlus,
  MagnifyingGlass,
  Trash,
} from '@phosphor-icons/react';
import { MethodBadge } from '../components/common/MethodBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { useWorkspace } from '../context/useWorkspace';
import { HTTP_METHODS, type HttpMethod } from '../types/api';

export function CollectionsPage() {
  const navigate = useNavigate();
  const {
    collections,
    savedRequests,
    history,
    openSavedRequest,
    openRequestInNewTab,
    createCollection,
    deleteCollection,
    duplicateRequest,
    deleteSavedRequest,
    clearHistory,
  } = useWorkspace();

  const [query, setQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<HttpMethod | 'ALL'>('ALL');
  const [newColName, setNewColName] = useState('');
  const [colError, setColError] = useState<string | null>(null);

  const filteredRequests = useMemo(() => {
    const q = query.trim().toLowerCase();
    return savedRequests.filter((req) => {
      if (methodFilter !== 'ALL' && req.method !== methodFilter) return false;
      if (!q) return true;
      return req.name.toLowerCase().includes(q) || req.url.toLowerCase().includes(q);
    });
  }, [savedRequests, query, methodFilter]);

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newColName.trim();
    if (trimmed.length < 2) {
      setColError('Collection name must be at least 2 characters.');
      return;
    }
    if (collections.some((c) => c.name.trim().toLowerCase() === trimmed.toLowerCase())) {
      setColError(`Collection "${trimmed}" already exists.`);
      return;
    }
    createCollection(trimmed);
    setNewColName('');
    setColError(null);
  };

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-rack-canvas p-4 md:p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rack-border pb-4">
          <div>
            <h1 className="font-mono text-sm font-semibold uppercase tracking-wider text-rack-text">
              Collections &amp; Execution History
            </h1>
            <p className="mt-1 font-sans text-xs text-rack-muted">
              Search saved endpoints, manage collections, or reopen any historical request directly in the Workbench.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex h-8 items-center gap-1.5 rounded-[2px] border border-rack-accent bg-rack-accent px-3 font-mono text-xs font-semibold uppercase tracking-wider text-rack-onAccent hover:bg-rack-accentHover"
          >
            Back to Workbench
          </button>
        </div>

        {/* Search + Create Collection Bar */}
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <search className="flex flex-wrap items-center gap-2 border border-rack-border bg-rack-surface p-2.5">
            <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-[2px] border border-rack-border bg-rack-elevated px-2.5">
              <MagnifyingGlass size={14} className="shrink-0 text-rack-dim" />
              <label htmlFor="collections-search-input" className="sr-only">
                Filter saved requests
              </label>
              <input
                id="collections-search-input"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter requests by name or URL..."
                className="h-8 w-full bg-transparent font-mono text-xs text-rack-text placeholder:text-rack-dim focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1">
              {(['ALL', ...HTTP_METHODS] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethodFilter(m)}
                  className={`rounded-[2px] border px-2 py-1 font-mono text-[10px] font-semibold uppercase ${
                    methodFilter === m
                      ? 'border-rack-accent bg-rack-accent/15 text-rack-accent'
                      : 'border-rack-border bg-rack-elevated text-rack-muted hover:text-rack-text'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </search>

          <form
            noValidate
            onSubmit={handleCreateCollection}
            className="flex flex-col gap-1 border border-rack-border bg-rack-surface p-2.5"
          >
            <div className="flex items-center gap-1.5">
              <label htmlFor="page-new-col" className="sr-only">
                New collection name
              </label>
              <input
                id="page-new-col"
                type="text"
                value={newColName}
                onChange={(e) => {
                  setNewColName(e.target.value);
                  if (colError) setColError(null);
                }}
                placeholder="New collection name..."
                aria-invalid={colError ? 'true' : 'false'}
                aria-describedby={colError ? 'page-new-col-error' : undefined}
                className="h-8 min-w-[180px] rounded-[2px] border border-rack-border bg-rack-elevated px-2.5 font-mono text-xs text-rack-text placeholder:text-rack-dim focus:border-rack-accent focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex h-8 items-center gap-1.5 rounded-[2px] border border-rack-borderStrong bg-rack-elevated px-3 font-mono text-[11px] uppercase tracking-wider text-rack-text hover:border-rack-accent hover:text-rack-accent"
              >
                <FolderPlus size={14} weight="bold" />
                Add
              </button>
            </div>
            {colError ? (
              <span id="page-new-col-error" className="font-mono text-[11px] text-rack-err">
                Error: {colError}
              </span>
            ) : null}
          </form>
        </div>

        {/* Main 2-Column Explorer */}
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          {/* Collections Section */}
          <section aria-label="Saved collections" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-rack-muted">
                Collections ({collections.length})
              </h2>
              <span className="tabular-nums font-mono text-[11px] text-rack-dim">
                Showing {filteredRequests.length} of {savedRequests.length} requests
              </span>
            </div>

            {collections.length === 0 ? (
              <div className="border border-dashed border-rack-border bg-rack-surface p-6 text-center font-mono text-xs text-rack-dim">
                No collections created yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {collections.map((col) => {
                  const items = filteredRequests.filter((r) => r.collectionId === col.id);
                  return (
                    <div key={col.id} className="border border-rack-border bg-rack-surface">
                      <div className="flex items-center justify-between border-b border-rack-border bg-rack-elevated px-3 py-2">
                        <div className="flex items-center gap-2 font-mono text-xs font-semibold text-rack-text">
                          <span>{col.name}</span>
                          <span className="tabular-nums text-[11px] font-normal text-rack-dim">
                            ({items.length})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteCollection(col.id)}
                          aria-label={`Delete collection ${col.name}`}
                          className="inline-flex h-6 items-center gap-1 rounded-[2px] border border-rack-border bg-rack-canvas px-2 font-mono text-[10px] uppercase text-rack-dim hover:border-rack-err/50 hover:text-rack-err"
                        >
                          <Trash size={12} />
                          Delete
                        </button>
                      </div>

                      {items.length === 0 ? (
                        <div className="p-3 font-mono text-xs text-rack-dim">
                          No matching requests in this collection.
                        </div>
                      ) : (
                        <ul>
                          {items.map((req) => (
                            <li
                              key={req.id}
                              className="flex flex-wrap items-center justify-between gap-2 border-b border-rack-border px-3 py-2.5 last:border-b-0 hover:bg-rack-elevated/40"
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                <MethodBadge method={req.method} size="sm" />
                                <div className="min-w-0">
                                  <div className="truncate font-mono text-xs font-medium text-rack-text">
                                    {req.name}
                                  </div>
                                  <div className="truncate font-mono text-[11px] text-rack-dim">
                                    {req.url || '(no URL)'}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    openSavedRequest(req);
                                    navigate('/');
                                  }}
                                  className="inline-flex h-7 items-center gap-1 rounded-[2px] border border-rack-accent/60 bg-rack-accent/10 px-2 font-mono text-[10px] font-semibold uppercase text-rack-accent hover:bg-rack-accent hover:text-rack-onAccent"
                                >
                                  <ArrowSquareOut size={12} weight="bold" />
                                  Open
                                </button>
                                <button
                                  type="button"
                                  onClick={() => duplicateRequest(req)}
                                  aria-label={`Duplicate ${req.name}`}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-[2px] border border-rack-border bg-rack-elevated text-rack-muted hover:text-rack-text"
                                >
                                  <CopySimple size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteSavedRequest(req.id)}
                                  aria-label={`Delete ${req.name}`}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-[2px] border border-rack-border bg-rack-elevated text-rack-muted hover:text-rack-err"
                                >
                                  <Trash size={13} />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Execution History Section */}
          <section aria-label="Execution history" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-rack-muted">
                <ClockCounterClockwise size={14} />
                Recent History ({history.length})
              </h2>
              {history.length > 0 ? (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="inline-flex items-center gap-1 rounded-[2px] border border-rack-border bg-rack-elevated px-2 py-0.5 font-mono text-[10px] uppercase text-rack-muted hover:border-rack-err/50 hover:text-rack-err"
                >
                  <Trash size={11} />
                  Clear
                </button>
              ) : null}
            </div>

            {history.length === 0 ? (
              <div className="border border-dashed border-rack-border bg-rack-surface p-6 text-center font-mono text-xs text-rack-dim">
                Execute a request in Workbench to populate history.
              </div>
            ) : (
              <ul className="border border-rack-border bg-rack-surface">
                {history.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-2 border-b border-rack-border px-3 py-2 last:border-b-0 hover:bg-rack-elevated/40"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <MethodBadge method={item.request.method} />
                        <StatusBadge
                          status={item.responseMeta.status}
                          errorType={item.responseMeta.errorType}
                        />
                        <span className="tabular-nums font-mono text-[10px] text-rack-dim">
                          {Math.round(item.responseMeta.timeMs)} ms
                        </span>
                      </div>
                      <div className="mt-1 truncate font-mono text-xs text-rack-text">
                        {item.request.url}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        openRequestInNewTab(item.request);
                        navigate('/');
                      }}
                      className="inline-flex h-7 shrink-0 items-center gap-1 rounded-[2px] border border-rack-border bg-rack-elevated px-2 font-mono text-[10px] uppercase text-rack-muted hover:border-rack-accent hover:text-rack-accent"
                    >
                      Reopen
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
