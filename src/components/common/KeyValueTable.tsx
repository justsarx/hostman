import { Plus, Trash } from '@phosphor-icons/react';
import type { KeyValuePair } from '../../types/api';

interface KeyValueTableProps {
  items: KeyValuePair[];
  onChange: (items: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  caption: string;
}

export function KeyValueTable({
  items,
  onChange,
  keyPlaceholder = 'KEY',
  valuePlaceholder = 'VALUE',
  caption,
}: KeyValueTableProps) {
  const handleToggle = (id: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)));
  };

  const handleUpdate = (id: string, field: 'key' | 'value', val: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: val } : item)));
  };

  const handleDelete = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const handleAdd = () => {
    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        key: '',
        value: '',
        enabled: true,
      },
    ]);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto border border-rack-border bg-rack-surface">
        <table className="w-full border-collapse text-left font-mono text-xs">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-rack-border bg-rack-canvas text-[11px] uppercase tracking-wider text-rack-muted">
              <th scope="col" className="w-9 px-2 py-1.5 text-center font-medium">
                <span className="sr-only">Enabled</span>
              </th>
              <th scope="col" className="border-l border-rack-border px-2.5 py-1.5 font-medium">
                Key
              </th>
              <th scope="col" className="border-l border-rack-border px-2.5 py-1.5 font-medium">
                Value
              </th>
              <th scope="col" className="w-9 border-l border-rack-border px-2 py-1.5 text-center font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-xs text-rack-dim">
                  No entries configured.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr
                  key={item.id}
                  className="border-b border-rack-border last:border-b-0 hover:bg-rack-elevated/60"
                >
                  <td className="px-2 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={() => handleToggle(item.id)}
                      aria-label={`Enable row ${idx + 1} ${item.key || 'entry'}`}
                      className="h-3.5 w-3.5 cursor-pointer rounded-none border border-rack-borderStrong bg-rack-elevated align-middle"
                    />
                  </td>
                  <td className="border-l border-rack-border p-0">
                    <input
                      type="text"
                      value={item.key}
                      onChange={(e) => handleUpdate(item.id, 'key', e.target.value)}
                      placeholder={keyPlaceholder}
                      aria-label={`${caption} key row ${idx + 1}`}
                      className={`w-full bg-transparent px-2.5 py-1.5 font-mono text-xs placeholder:text-rack-dim focus:bg-rack-elevated focus:outline-none ${
                        item.enabled ? 'text-rack-text' : 'text-rack-dim line-through'
                      }`}
                    />
                  </td>
                  <td className="border-l border-rack-border p-0">
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => handleUpdate(item.id, 'value', e.target.value)}
                      placeholder={valuePlaceholder}
                      aria-label={`${caption} value row ${idx + 1}`}
                      className={`w-full bg-transparent px-2.5 py-1.5 font-mono text-xs placeholder:text-rack-dim focus:bg-rack-elevated focus:outline-none ${
                        item.enabled ? 'text-rack-text' : 'text-rack-dim line-through'
                      }`}
                    />
                  </td>
                  <td className="border-l border-rack-border p-0 text-center">
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      aria-label={`Delete row ${idx + 1}`}
                      className="inline-flex h-7 w-full items-center justify-center text-rack-dim hover:bg-rack-elevated hover:text-rose-400"
                    >
                      <Trash size={14} weight="regular" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 rounded-[2px] border border-rack-border bg-rack-elevated px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-rack-muted hover:border-rack-borderStrong hover:text-rack-text"
        >
          <Plus size={12} weight="bold" />
          Add Row
        </button>
      </div>
    </div>
  );
}
