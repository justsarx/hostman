import { Trash } from '@phosphor-icons/react';
import type { ApiRequest, HistoryItem } from '../../types/api';
import { getStatusBadgeStyle, METHOD_BADGE_STYLES } from '../../utils/methodStyles';

interface HistoryPanelProps {
  history: HistoryItem[];
  onReopenRequest: (req: ApiRequest) => void;
  onClearHistory: () => void;
}

export function HistoryPanel({ history, onReopenRequest, onClearHistory }: HistoryPanelProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="tabular-nums font-mono text-[10px] uppercase tracking-wider text-rack-dim">
          {history.length} / 50 Logged
        </span>
        {history.length > 0 ? (
          <button
            type="button"
            onClick={onClearHistory}
            className="inline-flex items-center gap-1 rounded-[2px] border border-rack-border bg-rack-elevated px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-rack-muted hover:border-rack-err/50 hover:text-rack-err"
          >
            <Trash size={11} />
            Clear History
          </button>
        ) : null}
      </div>

      {history.length === 0 ? (
        <div className="border border-dashed border-rack-border p-3 font-mono text-xs text-rack-dim">
          Executed requests will appear here automatically.
        </div>
      ) : (
        <ul className="flex flex-col border border-rack-border bg-rack-canvas">
          {history.map((item) => {
            const { request, responseMeta, executedAt } = item;
            const timeLabel = new Date(executedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <li key={item.id} className="border-b border-rack-border last:border-b-0">
                <button
                  type="button"
                  onClick={() => onReopenRequest(request)}
                  className="flex w-full flex-col gap-1 px-2.5 py-2 text-left hover:bg-rack-elevated"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-[2px] border px-1 py-0.5 font-mono text-[9px] font-semibold leading-none ${
                        METHOD_BADGE_STYLES[request.method]
                      }`}
                    >
                      {request.method}
                    </span>

                    <div className="tabular-nums flex items-center gap-1.5 font-mono text-[10px]">
                      {responseMeta.errorType ? (
                        <span className="rounded-[2px] border border-rack-err/40 bg-rack-err/10 px-1 text-rack-err uppercase">
                          {responseMeta.errorType}
                        </span>
                      ) : (
                        <span
                          className={`rounded-[2px] border px-1 ${getStatusBadgeStyle(
                            responseMeta.status
                          )}`}
                        >
                          {responseMeta.status}
                        </span>
                      )}
                      <span className="text-rack-dim">{Math.round(responseMeta.timeMs)}ms</span>
                    </div>
                  </div>

                  <div className="truncate font-mono text-xs text-rack-text">
                    {request.url || '(no URL)'}
                  </div>
                  <div className="tabular-nums font-mono text-[10px] text-rack-dim">
                    {timeLabel}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
