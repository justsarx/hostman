import { useState } from 'react';
import type { Collection } from '../../types/api';
import { RackDialog } from './RackDialog';

interface SaveRequestModalProps {
  initialName: string;
  collections: Collection[];
  onClose: () => void;
  onSave: (name: string, collectionId: string, newCollectionName?: string) => void;
}

export function SaveRequestModal({
  initialName,
  collections,
  onClose,
  onSave,
}: SaveRequestModalProps) {
  const [name, setName] = useState(() => initialName || 'Untitled Request');
  const [collectionId, setCollectionId] = useState<string>(
    () => collections[0]?.id ?? '__new__'
  );
  const [newCollectionName, setNewCollectionName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [colError, setColError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim();
    if (finalName.length < 2) {
      setNameError('Request name must be at least 2 characters.');
      return;
    }

    if (collectionId === '__new__') {
      const colName = newCollectionName.trim();
      if (colName.length < 2) {
        setColError('New collection name must be at least 2 characters.');
        return;
      }
      onSave(finalName, '__new__', colName);
    } else {
      onSave(finalName, collectionId);
    }
    onClose();
  };

  return (
    <RackDialog
      title="Save Request to Collection"
      maxWidthClass="w-[min(440px,92vw)]"
      closeLabel="Close save request dialog"
      onClose={onClose}
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="save-req-name"
            className="font-mono text-[11px] uppercase tracking-wider text-rack-muted"
          >
            Request Name
          </label>
          <input
            id="save-req-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError(null);
            }}
            aria-invalid={nameError ? 'true' : 'false'}
            aria-describedby={nameError ? 'save-req-name-error' : undefined}
            autoFocus
            required
            className="h-8 rounded-[2px] border border-rack-border bg-rack-elevated px-2.5 font-mono text-xs text-rack-text focus:border-rack-accent focus:outline-none"
          />
          {nameError ? (
            <span id="save-req-name-error" className="font-mono text-[11px] text-rose-400">
              Error: {nameError}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="save-req-collection"
            className="font-mono text-[11px] uppercase tracking-wider text-rack-muted"
          >
            Target Collection
          </label>
          <select
            id="save-req-collection"
            value={collectionId}
            onChange={(e) => {
              setCollectionId(e.target.value);
              setColError(null);
            }}
            className="h-8 rounded-[2px] border border-rack-border bg-rack-elevated px-2.5 font-mono text-xs text-rack-text focus:border-rack-accent focus:outline-none"
          >
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="__new__">+ Create New Collection</option>
          </select>
        </div>

        {collectionId === '__new__' ? (
          <div className="flex flex-col gap-1">
            <label
              htmlFor="save-req-new-col"
              className="font-mono text-[11px] uppercase tracking-wider text-rack-muted"
            >
              New Collection Name
            </label>
            <input
              id="save-req-new-col"
              type="text"
              value={newCollectionName}
              onChange={(e) => {
                setNewCollectionName(e.target.value);
                if (colError) setColError(null);
              }}
              aria-invalid={colError ? 'true' : 'false'}
              aria-describedby={colError ? 'save-req-col-error' : undefined}
              placeholder="API Endpoints"
              required
              className="h-8 rounded-[2px] border border-rack-border bg-rack-elevated px-2.5 font-mono text-xs text-rack-text focus:border-rack-accent focus:outline-none"
            />
            {colError ? (
              <span id="save-req-col-error" className="font-mono text-[11px] text-rose-400">
                Error: {colError}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-1 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded-[2px] border border-rack-border bg-rack-elevated px-3 font-mono text-xs uppercase tracking-wider text-rack-muted hover:text-rack-text"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-8 rounded-[2px] border border-rack-accent bg-rack-accent px-4 font-mono text-xs font-semibold uppercase tracking-wider text-black hover:bg-rack-accentHover"
          >
            Save
          </button>
        </div>
      </form>
    </RackDialog>
  );
}
