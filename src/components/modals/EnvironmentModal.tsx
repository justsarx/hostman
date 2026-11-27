import { useState } from 'react';
import { Plus, Trash } from '@phosphor-icons/react';
import type { Environment } from '../../types/api';
import { KeyValueTable } from '../common/KeyValueTable';
import { RackDialog } from './RackDialog';

interface EnvironmentModalProps {
  environments: Environment[];
  activeEnvironmentId: string | null;
  onClose: () => void;
  onSaveEnvironments: (envs: Environment[], nextActiveId: string | null) => void;
}

export function EnvironmentModal({
  environments,
  activeEnvironmentId,
  onClose,
  onSaveEnvironments,
}: EnvironmentModalProps) {
  const [draftEnvs, setDraftEnvs] = useState<Environment[]>(() => structuredClone(environments));
  const [selectedId, setSelectedId] = useState<string | null>(
    () => activeEnvironmentId ?? environments[0]?.id ?? null
  );

  const selectedEnv = draftEnvs.find((e) => e.id === selectedId) ?? null;

  const handleAddEnvironment = () => {
    const newEnv: Environment = {
      id: crypto.randomUUID(),
      name: `Environment ${draftEnvs.length + 1}`,
      variables: [{ id: crypto.randomUUID(), key: 'BASE_URL', value: '', enabled: true }],
    };
    setDraftEnvs((prev) => [...prev, newEnv]);
    setSelectedId(newEnv.id);
  };

  const handleDeleteEnvironment = (id: string) => {
    setDraftEnvs((prev) => {
      const next = prev.filter((e) => e.id !== id);
      if (selectedId === id) {
        setSelectedId(next[0]?.id ?? null);
      }
      return next;
    });
  };

  const handleApply = () => {
    const nextActive =
      activeEnvironmentId && draftEnvs.some((e) => e.id === activeEnvironmentId)
        ? activeEnvironmentId
        : draftEnvs[0]?.id ?? null;
    onSaveEnvironments(draftEnvs, nextActive);
    onClose();
  };

  return (
    <RackDialog
      title="Manage Environments"
      maxWidthClass="w-[min(780px,95vw)]"
      closeLabel="Close environment manager"
      onClose={onClose}
    >
      <div className="grid max-h-[70vh] min-h-[340px] grid-cols-1 md:grid-cols-[210px_1fr]">
        <div className="flex flex-col border-b border-rack-border bg-rack-canvas p-2.5 md:border-b-0 md:border-r">
          <button
            type="button"
            onClick={handleAddEnvironment}
            autoFocus
            className="mb-2 flex h-8 items-center justify-center gap-1.5 rounded-[2px] border border-rack-borderStrong bg-rack-elevated px-2 font-mono text-[11px] uppercase tracking-wider text-rack-text hover:border-rack-accent hover:text-rack-accent"
          >
            <Plus size={12} weight="bold" />
            Add Environment
          </button>

          <ul className="flex flex-1 flex-col gap-1 overflow-y-auto">
            {draftEnvs.map((env) => (
              <li
                key={env.id}
                className={`flex items-center justify-between gap-1 border ${
                  env.id === selectedId
                    ? 'border-rack-accent bg-rack-elevated'
                    : 'border-rack-border bg-rack-surface hover:bg-rack-elevated/60'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedId(env.id)}
                  className="min-w-0 flex-1 truncate px-2.5 py-1.5 text-left font-mono text-xs text-rack-text"
                >
                  {env.name}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteEnvironment(env.id)}
                  aria-label={`Delete environment ${env.name}`}
                  className="mr-1 inline-flex h-6 w-6 items-center justify-center text-rack-dim hover:text-rack-err"
                >
                  <Trash size={12} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto p-4">
          {selectedEnv ? (
            <>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="env-name-input"
                  className="font-mono text-[11px] uppercase tracking-wider text-rack-muted"
                >
                  Environment Name
                </label>
                <input
                  id="env-name-input"
                  type="text"
                  value={selectedEnv.name}
                  onChange={(e) =>
                    setDraftEnvs((prev) =>
                      prev.map((item) =>
                        item.id === selectedEnv.id ? { ...item, name: e.target.value } : item
                      )
                    )
                  }
                  className="h-8 rounded-[2px] border border-rack-border bg-rack-elevated px-2.5 font-mono text-xs text-rack-text focus:border-rack-accent focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] uppercase tracking-wider text-rack-muted">
                  Variables (referenced as {'{{KEY}}'})
                </span>
                <KeyValueTable
                  caption="Environment variables"
                  items={selectedEnv.variables}
                  onChange={(variables) =>
                    setDraftEnvs((prev) =>
                      prev.map((item) =>
                        item.id === selectedEnv.id ? { ...item, variables } : item
                      )
                    )
                  }
                  keyPlaceholder="BASE_URL"
                  valuePlaceholder="http://localhost:3000"
                />
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center font-mono text-xs text-rack-dim">
              Select or add an environment to edit variables.
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-rack-border bg-rack-canvas px-4 py-2.5">
        <button
          type="button"
          onClick={onClose}
          className="h-8 rounded-[2px] border border-rack-border bg-rack-elevated px-3 font-mono text-xs uppercase tracking-wider text-rack-muted hover:text-rack-text"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="h-8 rounded-[2px] border border-rack-accent bg-rack-accent px-4 font-mono text-xs font-semibold uppercase tracking-wider text-rack-onAccent hover:bg-rack-accentHover"
        >
          Save Changes
        </button>
      </div>
    </RackDialog>
  );
}
