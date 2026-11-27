import { useState } from 'react';
import {
  CaretDown,
  CaretRight,
  Check,
  CopySimple,
  FolderPlus,
  PencilSimple,
  Trash,
  X,
} from '@phosphor-icons/react';
import type { ApiRequest, Collection } from '../../types/api';
import { METHOD_BADGE_STYLES } from '../../utils/methodStyles';

interface CollectionsPanelProps {
  collections: Collection[];
  requests: ApiRequest[];
  activeRequestId: string;
  onOpenRequest: (req: ApiRequest) => void;
  onCreateCollection: (name: string) => void;
  onRenameCollection: (id: string, name: string) => void;
  onDeleteCollection: (id: string) => void;
  onDuplicateRequest: (req: ApiRequest) => void;
  onDeleteRequest: (id: string) => void;
}

export function CollectionsPanel({
  collections,
  requests,
  activeRequestId,
  onOpenRequest,
  onCreateCollection,
  onRenameCollection,
  onDeleteCollection,
  onDuplicateRequest,
  onDeleteRequest,
}: CollectionsPanelProps) {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const toggleExpand = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCollectionName.trim();
    if (!trimmed) return;
    onCreateCollection(trimmed);
    setNewCollectionName('');
    setIsCreating(false);
  };

  const handleRenameSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    const trimmed = editingName.trim();
    if (trimmed) {
      onRenameCollection(id, trimmed);
    }
    setEditingId(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-rack-dim">
          {collections.length} Collection{collections.length === 1 ? '' : 's'}
        </span>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-1 rounded-[2px] border border-rack-border bg-rack-elevated px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-rack-muted hover:border-rack-borderStrong hover:text-rack-text"
        >
          <FolderPlus size={12} weight="bold" />
          New
        </button>
      </div>

      {isCreating ? (
        <form
          onSubmit={handleCreateSubmit}
          className="flex items-center gap-1 border border-rack-borderStrong bg-rack-canvas p-1"
        >
          <label htmlFor="new-collection-name" className="sr-only">
            New collection name
          </label>
          <input
            id="new-collection-name"
            type="text"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder="Collection name..."
            autoFocus
            className="min-w-0 flex-1 bg-transparent px-1.5 py-0.5 font-mono text-xs text-rack-text placeholder:text-rack-dim focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Create collection"
            className="inline-flex h-6 w-6 items-center justify-center text-emerald-400 hover:bg-rack-elevated"
          >
            <Check size={13} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCreating(false);
              setNewCollectionName('');
            }}
            aria-label="Cancel new collection"
            className="inline-flex h-6 w-6 items-center justify-center text-rack-dim hover:bg-rack-elevated hover:text-rack-text"
          >
            <X size={13} weight="bold" />
          </button>
        </form>
      ) : null}

      {collections.length === 0 ? (
        <div className="border border-dashed border-rack-border p-3 font-mono text-xs text-rack-dim">
          No collections yet. Create one or save a request with Ctrl+S.
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {collections.map((collection) => {
            const isExpanded = !collapsedIds.has(collection.id);
            const colRequests = requests.filter((r) => r.collectionId === collection.id);

            return (
              <li key={collection.id} className="border border-rack-border bg-rack-canvas">
                <div className="group flex items-center justify-between gap-1 bg-rack-elevated/70 px-2 py-1.5">
                  {editingId === collection.id ? (
                    <form
                      onSubmit={(e) => handleRenameSubmit(e, collection.id)}
                      className="flex min-w-0 flex-1 items-center gap-1"
                    >
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        aria-label="Rename collection"
                        autoFocus
                        className="min-w-0 flex-1 border border-rack-borderStrong bg-rack-canvas px-1.5 py-0.5 font-mono text-xs text-rack-text focus:outline-none"
                      />
                      <button
                        type="submit"
                        aria-label="Save collection name"
                        className="p-0.5 text-emerald-400"
                      >
                        <Check size={12} weight="bold" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        aria-label="Cancel rename"
                        className="p-0.5 text-rack-dim"
                      >
                        <X size={12} weight="bold" />
                      </button>
                    </form>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleExpand(collection.id)}
                        aria-expanded={isExpanded}
                        className="flex min-w-0 flex-1 items-center gap-1.5 text-left font-mono text-xs font-medium text-rack-text"
                      >
                        {isExpanded ? (
                          <CaretDown size={12} weight="bold" className="shrink-0 text-rack-muted" />
                        ) : (
                          <CaretRight size={12} weight="bold" className="shrink-0 text-rack-muted" />
                        )}
                        <span className="truncate">{collection.name}</span>
                        <span className="tabular-nums shrink-0 text-[10px] text-rack-dim">
                          ({colRequests.length})
                        </span>
                      </button>

                      <div className="flex shrink-0 items-center gap-0.5 opacity-80 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(collection.id);
                            setEditingName(collection.name);
                          }}
                          aria-label={`Rename ${collection.name}`}
                          className="inline-flex h-5 w-5 items-center justify-center rounded-[2px] text-rack-dim hover:bg-rack-canvas hover:text-rack-text"
                        >
                          <PencilSimple size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCollection(collection.id)}
                          aria-label={`Delete ${collection.name}`}
                          className="inline-flex h-5 w-5 items-center justify-center rounded-[2px] text-rack-dim hover:bg-rack-canvas hover:text-rose-400"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {isExpanded ? (
                  colRequests.length === 0 ? (
                    <div className="border-t border-rack-border px-3 py-2 font-mono text-[11px] text-rack-dim">
                      Empty collection
                    </div>
                  ) : (
                    <ul className="border-t border-rack-border">
                      {colRequests.map((req) => {
                        const isActive = req.id === activeRequestId;
                        return (
                          <li
                            key={req.id}
                            className={`group flex items-center justify-between gap-1 border-b border-rack-border px-2 py-1.5 last:border-b-0 ${
                              isActive ? 'bg-rack-elevated' : 'hover:bg-rack-surface'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => onOpenRequest(req)}
                              className="flex min-w-0 flex-1 items-center gap-2 text-left"
                            >
                              <span
                                className={`w-11 shrink-0 rounded-[2px] border px-1 py-0.5 text-center font-mono text-[9px] font-semibold leading-none ${
                                  METHOD_BADGE_STYLES[req.method]
                                }`}
                              >
                                {req.method}
                              </span>
                              <span
                                className={`truncate font-mono text-xs ${
                                  isActive ? 'text-rack-text' : 'text-rack-muted'
                                }`}
                              >
                                {req.name}
                              </span>
                            </button>

                            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => onDuplicateRequest(req)}
                                aria-label={`Duplicate ${req.name}`}
                                className="inline-flex h-5 w-5 items-center justify-center rounded-[2px] text-rack-dim hover:bg-rack-elevated hover:text-rack-text"
                              >
                                <CopySimple size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteRequest(req.id)}
                                aria-label={`Delete ${req.name}`}
                                className="inline-flex h-5 w-5 items-center justify-center rounded-[2px] text-rack-dim hover:bg-rack-elevated hover:text-rose-400"
                              >
                                <Trash size={12} />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
