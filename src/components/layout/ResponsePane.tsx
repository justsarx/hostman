import { useMemo, useState, type ReactNode } from 'react';
import { Check, Copy, Globe } from '@phosphor-icons/react';
import type { ApiResponse } from '../../types/api';
import { formatBytes, getStatusBadgeStyle } from '../../utils/methodStyles';

type ResponseSubTab = 'pretty' | 'raw' | 'headers';

interface ResponsePaneProps {
  response: ApiResponse | null;
  isLoading: boolean;
  diagnosticSlot?: ReactNode;
}

export function ResponsePane({ response, isLoading, diagnosticSlot }: ResponsePaneProps) {
  const [subTab, setSubTab] = useState<ResponseSubTab>('pretty');
  const [copied, setCopied] = useState(false);

  const prettyBody = useMemo(() => {
    if (!response?.body) return '';
    try {
      return JSON.stringify(JSON.parse(response.body), null, 2);
    } catch {
      return response.body;
    }
  }, [response]);

  const headerEntries = useMemo(() => {
    if (!response) return [];
    return Object.entries(response.headers);
  }, [response]);

  const handleCopy = async () => {
    if (!response) return;
    const content =
      subTab === 'pretty'
        ? prettyBody
        : subTab === 'raw'
          ? response.body
          : headerEntries.map(([k, v]) => `${k}: ${v}`).join('\n');
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <section
      aria-label="Response inspector"
      className="flex min-h-[280px] shrink-0 flex-col bg-rack-surface lg:min-h-0 lg:flex-1 lg:overflow-hidden"
    >
      {/* Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rack-border bg-rack-canvas px-3 py-2">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-rack-muted">
            Response
          </span>

          {response && !response.errorType ? (
            <div className="flex items-center gap-2 font-mono text-xs tabular-nums">
              <span
                className={`rounded-[2px] border px-1.5 py-0.5 text-[11px] font-semibold ${getStatusBadgeStyle(
                  response.status
                )}`}
              >
                {response.status} {response.statusText}
              </span>
              <span className="text-rack-muted">
                <span className="text-rack-dim">TIME </span>
                <span className="text-rack-text">{Math.round(response.timeMs)} ms</span>
              </span>
              <span className="text-rack-muted">
                <span className="text-rack-dim">SIZE </span>
                <span className="text-rack-text">{formatBytes(response.sizeBytes)}</span>
              </span>
            </div>
          ) : null}

          {response?.errorType ? (
            <span className="rounded-[2px] border border-rack-err/50 bg-rack-err/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold uppercase text-rack-err">
              {response.errorType}
            </span>
          ) : null}
        </div>

        {response && !response.errorType ? (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-[2px] border border-rack-border bg-rack-elevated px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-rack-muted hover:border-rack-borderStrong hover:text-rack-text"
          >
            {copied ? <Check size={13} weight="bold" className="text-rack-ok" /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        ) : null}
      </div>

      {/* Response Sub-tabs */}
      <div
        role="tablist"
        aria-label="Response views"
        className="flex border-b border-rack-border bg-rack-canvas"
      >
        <button
          type="button"
          role="tab"
          aria-selected={subTab === 'pretty'}
          onClick={() => setSubTab('pretty')}
          className={`flex h-9 items-center px-4 font-mono text-[11px] font-medium uppercase tracking-wider ${
            subTab === 'pretty' ? 'bg-rack-surface text-rack-text' : 'text-rack-muted hover:text-rack-text'
          }`}
        >
          Pretty
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={subTab === 'raw'}
          onClick={() => setSubTab('raw')}
          className={`flex h-9 items-center border-l border-rack-border px-4 font-mono text-[11px] font-medium uppercase tracking-wider ${
            subTab === 'raw' ? 'bg-rack-surface text-rack-text' : 'text-rack-muted hover:text-rack-text'
          }`}
        >
          Raw
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={subTab === 'headers'}
          onClick={() => setSubTab('headers')}
          className={`flex h-9 items-center gap-1.5 border-l border-rack-border px-4 font-mono text-[11px] font-medium uppercase tracking-wider ${
            subTab === 'headers'
              ? 'bg-rack-surface text-rack-text'
              : 'text-rack-muted hover:text-rack-text'
          }`}
        >
          Headers
          {headerEntries.length > 0 ? (
            <span className="tabular-nums rounded-[2px] border border-rack-border bg-rack-elevated px-1 text-[10px] text-rack-accent">
              {headerEntries.length}
            </span>
          ) : null}
        </button>
      </div>

      {/* Response Body */}
      <div className="p-3 lg:min-h-0 lg:flex-1 lg:overflow-auto">
        {isLoading ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 font-mono text-xs text-rack-muted">
            <span className="inline-block h-2 w-16 animate-pulse bg-rack-accent" />
            <span>EXECUTING DIRECT BROWSER FETCH...</span>
          </div>
        ) : !response ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center font-mono">
            <Globe size={28} weight="thin" className="text-rack-dim" />
            <p className="text-xs text-rack-muted">READY TO DISPATCH REQUEST</p>
            <p className="text-[11px] text-rack-dim">
              Press <kbd className="border border-rack-border bg-rack-elevated px-1 py-0.5 text-rack-muted">Ctrl+Enter</kbd> or click SEND
            </p>
          </div>
        ) : response.errorType ? (
          diagnosticSlot ?? (
            <div className="border border-rack-err/40 bg-rack-err/10 p-3 font-mono text-xs text-rack-err">
              {response.errorMessage || 'Request failed.'}
            </div>
          )
        ) : subTab === 'headers' ? (
          <div className="overflow-x-auto border border-rack-border bg-rack-canvas">
            <table className="w-full border-collapse text-left font-mono text-xs">
              <caption className="sr-only">Response Headers</caption>
              <thead>
                <tr className="border-b border-rack-border bg-rack-surface text-[11px] uppercase tracking-wider text-rack-muted">
                  <th scope="col" className="px-3 py-1.5 font-medium">
                    Header
                  </th>
                  <th scope="col" className="border-l border-rack-border px-3 py-1.5 font-medium">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {headerEntries.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-3 py-4 text-center text-rack-dim">
                      No readable response headers exposed (CORS-safelisted only).
                    </td>
                  </tr>
                ) : (
                  headerEntries.map(([key, val]) => (
                    <tr key={key} className="border-b border-rack-border last:border-b-0">
                      <td className="px-3 py-1.5 text-rack-muted">{key}</td>
                      <td className="border-l border-rack-border px-3 py-1.5 break-all text-rack-text">
                        {val}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap break-words border border-rack-border bg-rack-canvas p-3 font-mono text-xs leading-relaxed text-rack-text">
            {subTab === 'pretty'
              ? prettyBody || '(empty response body)'
              : response.body || '(empty response body)'}
          </pre>
        )}
      </div>
    </section>
  );
}
