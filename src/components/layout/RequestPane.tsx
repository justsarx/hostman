import { useState, type RefObject } from 'react';
import {
  BracketsCurly,
  Code,
  FloppyDisk,
  PaperPlaneTilt,
  Stop,
  Warning,
} from '@phosphor-icons/react';
import {
  HTTP_METHODS,
  type ApiRequest,
  type BodyType,
  type Environment,
  type HttpMethod,
  type KeyValuePair,
} from '../../types/api';
import { METHOD_BADGE_STYLES } from '../../utils/methodStyles';
import { validateRequestUrlInput } from '../../utils/validation';
import { KeyValueTable } from '../common/KeyValueTable';

type RequestSubTab = 'params' | 'headers' | 'body';

interface RequestPaneProps {
  request: ApiRequest;
  isLoading: boolean;
  activeEnvironment: Environment | null;
  urlInputRef?: RefObject<HTMLInputElement | null>;
  unresolvedVars?: string[];
  resolvedUrlPreview?: string;
  onUpdateRequest: (patch: Partial<ApiRequest>) => void;
  onUpdateUrl?: (url: string) => void;
  onUpdateParams?: (params: KeyValuePair[]) => void;
  onSend: () => void;
  onCancel: () => void;
  onSaveRequest?: () => void;
  onCopyCurl?: () => void;
  curlCopied?: boolean;
}

export function RequestPane({
  request,
  isLoading,
  urlInputRef,
  unresolvedVars = [],
  resolvedUrlPreview,
  onUpdateRequest,
  onUpdateUrl,
  onUpdateParams,
  onSend,
  onCancel,
  onSaveRequest,
  onCopyCurl,
  curlCopied = false,
}: RequestPaneProps) {
  const [subTab, setSubTab] = useState<RequestSubTab>('params');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  const enabledParamsCount = request.params.filter((p) => p.enabled && p.key.trim() !== '').length;
  const enabledHeadersCount = request.headers.filter((h) => h.enabled && h.key.trim() !== '').length;
  const bodyDisabledForMethod = request.method === 'GET' || request.method === 'HEAD';

  const handleFormatJson = () => {
    if (!request.body.trim()) {
      setJsonError(null);
      return;
    }
    try {
      const parsed = JSON.parse(request.body);
      onUpdateRequest({ body: JSON.stringify(parsed, null, 2) });
      setJsonError(null);
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  return (
    <section
      aria-label="Request editor"
      className="flex shrink-0 flex-col border-b border-rack-border bg-rack-surface lg:min-h-0 lg:flex-1 lg:overflow-hidden lg:border-b-0 lg:border-r"
    >
      {/* Request Title + Utility Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rack-border bg-rack-canvas px-3 py-1.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <label htmlFor="request-name-input" className="sr-only">
            Request Name
          </label>
          <input
            id="request-name-input"
            type="text"
            value={request.name}
            onChange={(e) => onUpdateRequest({ name: e.target.value })}
            placeholder="Untitled Request"
            className="min-w-0 flex-1 bg-transparent font-mono text-xs font-medium text-rack-text placeholder:text-rack-dim focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {onCopyCurl ? (
            <button
              type="button"
              onClick={onCopyCurl}
              className="inline-flex items-center gap-1 rounded-[2px] border border-rack-border bg-rack-elevated px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-rack-muted hover:border-rack-borderStrong hover:text-rack-text"
            >
              <Code size={13} weight="regular" />
              {curlCopied ? 'Copied cURL' : 'Copy as cURL'}
            </button>
          ) : null}
          {onSaveRequest ? (
            <button
              type="button"
              onClick={onSaveRequest}
              className="inline-flex items-center gap-1 rounded-[2px] border border-rack-border bg-rack-elevated px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-rack-muted hover:border-rack-borderStrong hover:text-rack-text"
            >
              <FloppyDisk size={13} weight="regular" />
              Save
            </button>
          ) : null}
        </div>
      </div>

      {/* Primary Method + URL + Send Bar */}
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (isLoading) {
            onCancel();
            return;
          }
          const validationErr = validateRequestUrlInput(request.url);
          if (validationErr) {
            setUrlError(validationErr);
            urlInputRef?.current?.focus();
            return;
          }
          setUrlError(null);
          onSend();
        }}
        className="flex flex-col gap-1.5 border-b border-rack-border p-3"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <div className="flex items-stretch">
            <label htmlFor="http-method-select" className="sr-only">
              HTTP Method
            </label>
            <select
              id="http-method-select"
              value={request.method}
              onChange={(e) => onUpdateRequest({ method: e.target.value as HttpMethod })}
              className={`h-9 rounded-[2px] border px-2.5 font-mono text-xs font-semibold tracking-wider focus:outline-none ${
                METHOD_BADGE_STYLES[request.method]
              }`}
            >
              {HTTP_METHODS.map((method) => (
                <option key={method} value={method} className="bg-rack-elevated text-rack-text">
                  {method}
                </option>
              ))}
            </select>
          </div>

          <div className="flex min-w-0 flex-1 items-stretch">
            <label htmlFor="request-url-input" className="sr-only">
              Request URL
            </label>
            <input
              ref={urlInputRef}
              id="request-url-input"
              type="text"
              value={request.url}
              onChange={(e) => {
                const next = e.target.value;
                if (urlError && !validateRequestUrlInput(next)) {
                  setUrlError(null);
                }
                if (onUpdateUrl) onUpdateUrl(next);
                else onUpdateRequest({ url: next });
              }}
              onBlur={() => {
                if (request.url.trim() !== '') {
                  setUrlError(validateRequestUrlInput(request.url));
                }
              }}
              aria-invalid={urlError ? 'true' : 'false'}
              aria-describedby={urlError ? 'request-url-error' : undefined}
              placeholder="https://api.example.com/v1/resource or {{BASE_URL}}/health"
              spellCheck={false}
              autoComplete="off"
              className={`h-9 min-w-0 flex-1 rounded-[2px] border bg-rack-elevated px-3 font-mono text-xs text-rack-text placeholder:text-rack-dim focus:outline-none ${
                urlError
                  ? 'border-rack-err bg-rack-err/5'
                  : 'border-rack-border focus:border-rack-accent'
              }`}
            />
          </div>

          {isLoading ? (
            <button
              type="submit"
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-[2px] border border-rack-err bg-rack-err/15 px-4 font-mono text-xs font-semibold uppercase tracking-wider text-rack-err hover:bg-rack-err/25"
            >
              <Stop size={14} weight="fill" />
              Cancel
            </button>
          ) : (
            <button
              type="submit"
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-[2px] border border-rack-accent bg-rack-accent px-5 font-mono text-xs font-semibold uppercase tracking-wider text-rack-onAccent hover:bg-rack-accentHover"
            >
              <PaperPlaneTilt size={14} weight="bold" />
              Send
            </button>
          )}
        </div>

        {urlError ? (
          <p id="request-url-error" className="font-mono text-[11px] text-rack-err">
            Error: {urlError}
          </p>
        ) : null}

        {/* Variable Resolution Preview / Unresolved Warning */}
        {resolvedUrlPreview && resolvedUrlPreview !== request.url ? (
          <div className="flex items-center gap-2 font-mono text-[11px] text-rack-muted">
            <span className="shrink-0 uppercase text-rack-dim">Resolved:</span>
            <span className="truncate text-rack-text">{resolvedUrlPreview}</span>
          </div>
        ) : null}

        {unresolvedVars.length > 0 ? (
          <div
            role="status"
            className="flex flex-wrap items-center gap-1.5 rounded-[2px] border border-rack-warn/40 bg-rack-warn/10 px-2.5 py-1 font-mono text-[11px] text-rack-warn"
          >
            <Warning size={13} weight="bold" className="shrink-0" />
            <span>Unresolved environment variables:</span>
            {unresolvedVars.map((varName) => (
              <code
                key={varName}
                className="rounded-[2px] border border-rack-warn/40 bg-rack-canvas px-1 py-0.5 text-[10px] text-rack-warn"
              >
                {`{{${varName}}}`}
              </code>
            ))}
          </div>
        ) : null}
      </form>

      {/* Request Sub-tabs */}
      <div
        role="tablist"
        aria-label="Request configuration sections"
        className="flex border-b border-rack-border bg-rack-canvas"
      >
        <button
          type="button"
          role="tab"
          aria-selected={subTab === 'params'}
          onClick={() => setSubTab('params')}
          className={`flex h-9 items-center gap-1.5 px-4 font-mono text-[11px] font-medium uppercase tracking-wider ${
            subTab === 'params' ? 'bg-rack-surface text-rack-text' : 'text-rack-muted hover:text-rack-text'
          }`}
        >
          Params
          {enabledParamsCount > 0 ? (
            <span className="tabular-nums rounded-[2px] border border-rack-border bg-rack-elevated px-1 text-[10px] text-rack-accent">
              {enabledParamsCount}
            </span>
          ) : null}
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
          {enabledHeadersCount > 0 ? (
            <span className="tabular-nums rounded-[2px] border border-rack-border bg-rack-elevated px-1 text-[10px] text-rack-accent">
              {enabledHeadersCount}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={subTab === 'body'}
          onClick={() => setSubTab('body')}
          className={`flex h-9 items-center gap-1.5 border-l border-rack-border px-4 font-mono text-[11px] font-medium uppercase tracking-wider ${
            subTab === 'body' ? 'bg-rack-surface text-rack-text' : 'text-rack-muted hover:text-rack-text'
          }`}
        >
          Body
          {request.bodyType !== 'none' && !bodyDisabledForMethod ? (
            <span className="rounded-[2px] border border-rack-border bg-rack-elevated px-1 text-[10px] uppercase text-rack-accent">
              {request.bodyType === 'form-urlencoded' ? 'FORM' : request.bodyType}
            </span>
          ) : null}
        </button>
      </div>

      {/* Sub-tab Panels */}
      <div className="p-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
        {subTab === 'params' ? (
          <div role="tabpanel" aria-label="Query parameters">
            <KeyValueTable
              caption="Query Parameters"
              items={request.params}
              onChange={(params) =>
                onUpdateParams ? onUpdateParams(params) : onUpdateRequest({ params })
              }
              keyPlaceholder="param_name"
              valuePlaceholder="value"
            />
          </div>
        ) : null}

        {subTab === 'headers' ? (
          <div role="tabpanel" aria-label="Request headers">
            <KeyValueTable
              caption="Request Headers"
              items={request.headers}
              onChange={(headers) => onUpdateRequest({ headers })}
              keyPlaceholder="Header-Name"
              valuePlaceholder="Header Value"
            />
          </div>
        ) : null}

        {subTab === 'body' ? (
          <div role="tabpanel" aria-label="Request body" className="flex h-full flex-col gap-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {(['none', 'json', 'text', 'form-urlencoded'] as BodyType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setJsonError(null);
                      onUpdateRequest({ bodyType: type });
                    }}
                    className={`rounded-[2px] border px-2 py-1 font-mono text-[11px] uppercase tracking-wider ${
                      request.bodyType === type
                        ? 'border-rack-accent bg-rack-accent/15 text-rack-accent'
                        : 'border-rack-border bg-rack-elevated text-rack-muted hover:text-rack-text'
                    }`}
                  >
                    {type === 'form-urlencoded' ? 'x-www-form-urlencoded' : type}
                  </button>
                ))}
              </div>

              {request.bodyType === 'json' ? (
                <button
                  type="button"
                  onClick={handleFormatJson}
                  className="inline-flex items-center gap-1 rounded-[2px] border border-rack-border bg-rack-elevated px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-rack-muted hover:border-rack-borderStrong hover:text-rack-text"
                >
                  <BracketsCurly size={13} weight="bold" />
                  Format JSON
                </button>
              ) : null}
            </div>

            {bodyDisabledForMethod ? (
              <div className="border border-rack-border bg-rack-canvas px-3 py-2 font-mono text-xs text-rack-warn">
                {request.method} requests do not transmit a body payload.
              </div>
            ) : null}

            {jsonError ? (
              <div
                role="alert"
                className="border border-rack-err/50 bg-rack-err/10 px-3 py-1.5 font-mono text-xs text-rack-err"
              >
                JSON Syntax Error: {jsonError}
              </div>
            ) : null}

            {request.bodyType === 'none' ? (
              <div className="flex flex-1 items-center justify-center border border-dashed border-rack-border bg-rack-canvas/40 p-6 font-mono text-xs text-rack-dim">
                This request does not have a body. Select JSON, TEXT, or FORM above to attach a payload.
              </div>
            ) : (
              <div className="flex min-h-[200px] flex-1 flex-col">
                <label htmlFor="request-body-textarea" className="sr-only">
                  Request Body Payload
                </label>
                <textarea
                  id="request-body-textarea"
                  value={request.body}
                  onChange={(e) => {
                    if (jsonError) setJsonError(null);
                    onUpdateRequest({ body: e.target.value });
                  }}
                  spellCheck={false}
                  placeholder={
                    request.bodyType === 'json'
                      ? '{\n  "title": "Hostman",\n  "body": "Hardware-rack API client",\n  "userId": 1\n}'
                      : request.bodyType === 'form-urlencoded'
                        ? 'key1=value1&key2=value2'
                        : 'Raw text payload...'
                  }
                  className="min-h-[220px] w-full flex-1 resize-y rounded-[2px] border border-rack-border bg-rack-canvas p-3 font-mono text-xs leading-relaxed text-rack-text placeholder:text-rack-dim focus:border-rack-accent focus:outline-none"
                />
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
