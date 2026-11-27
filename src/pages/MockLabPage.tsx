import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowSquareOut, Flask, Play } from '@phosphor-icons/react';
import { MethodBadge } from '../components/common/MethodBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { useWorkspace } from '../context/useWorkspace';
import { buildSimulatedResponse, MOCK_PRESETS, type MockPreset } from '../services/mockResponder';
import type { ApiResponse } from '../types/api';
import { interpolateString } from '../utils/interpolation';
import { formatBytes } from '../utils/methodStyles';

export function MockLabPage() {
  const navigate = useNavigate();
  const { activeEnvironment, openRequestInNewTab } = useWorkspace();
  const [category, setCategory] = useState<'ALL' | MockPreset['category']>('ALL');
  const [selectedPreset, setSelectedPreset] = useState<MockPreset>(MOCK_PRESETS[0]);
  const [simulatedResponse, setSimulatedResponse] = useState<ApiResponse | null>(
    MOCK_PRESETS[0].mockResponse
  );

  const visiblePresets = useMemo(() => {
    if (category === 'ALL') return MOCK_PRESETS;
    return MOCK_PRESETS.filter((p) => p.category === category);
  }, [category]);

  const resolvedUrl = useMemo(
    () => interpolateString(selectedPreset.request.url, activeEnvironment),
    [selectedPreset, activeEnvironment]
  );

  const handleSimulate = () => {
    if (selectedPreset.mockResponse) {
      setSimulatedResponse({
        ...selectedPreset.mockResponse,
        targetUrl: resolvedUrl,
      });
      return;
    }
    setSimulatedResponse(
      buildSimulatedResponse(
        selectedPreset.request.method,
        resolvedUrl,
        selectedPreset.request.body
      )
    );
  };

  const handleLoadIntoWorkbench = (preset: MockPreset) => {
    openRequestInNewTab(preset.request);
    navigate('/');
  };

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-rack-canvas p-4 md:p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rack-border pb-4">
          <div>
            <h1 className="inline-flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-wider text-rack-text">
              <Flask size={16} weight="bold" className="text-rack-accent" />
              Offline Mock Lab &amp; Request Templates
            </h1>
            <p className="mt-1 font-sans text-xs text-rack-muted">
              Test pre-built API scenarios completely offline with simulated responses or load any template into the live Workbench.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex h-8 items-center rounded-[2px] border border-rack-accent bg-rack-accent px-3 font-mono text-xs font-semibold uppercase tracking-wider text-rack-onAccent hover:bg-rack-accentHover"
          >
            Back to Workbench
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'REST', 'Auth', 'Webhook'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-[2px] border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider ${
                category === cat
                  ? 'border-rack-accent bg-rack-accent/15 text-rack-accent'
                  : 'border-rack-border bg-rack-surface text-rack-muted hover:text-rack-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          {/* Preset List */}
          <section aria-label="Mock presets" className="flex flex-col gap-2.5">
            {visiblePresets.map((preset) => {
              const isSelected = preset.id === selectedPreset.id;
              return (
                <div
                  key={preset.id}
                  className={`border p-3 transition-colors ${
                    isSelected
                      ? 'border-rack-accent bg-rack-elevated'
                      : 'border-rack-border bg-rack-surface hover:bg-rack-elevated/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPreset(preset);
                        setSimulatedResponse(preset.mockResponse);
                      }}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <MethodBadge method={preset.request.method} size="sm" />
                        <span className="font-mono text-xs font-semibold text-rack-text">
                          {preset.title}
                        </span>
                        <span className="rounded-[2px] border border-rack-border bg-rack-canvas px-1.5 py-0.5 font-mono text-[9px] uppercase text-rack-dim">
                          {preset.category}
                        </span>
                      </div>
                      <p className="mt-1.5 font-sans text-xs text-rack-muted">
                        {preset.description}
                      </p>
                      <div className="mt-2 truncate font-mono text-[11px] text-rack-dim">
                        {preset.request.url}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLoadIntoWorkbench(preset)}
                      className="inline-flex h-7 shrink-0 items-center gap-1 rounded-[2px] border border-rack-borderStrong bg-rack-canvas px-2 font-mono text-[10px] uppercase text-rack-text hover:border-rack-accent hover:text-rack-accent"
                    >
                      <ArrowSquareOut size={12} weight="bold" />
                      Load
                    </button>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Mock Simulator Output */}
          <section
            aria-label="Mock response preview"
            className="flex flex-col border border-rack-border bg-rack-surface"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rack-border bg-rack-canvas px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <MethodBadge method={selectedPreset.request.method} size="sm" />
                <span className="truncate font-mono text-xs text-rack-text">{resolvedUrl}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSimulate}
                  className="inline-flex h-7 items-center gap-1 rounded-[2px] border border-rack-accent bg-rack-accent px-2.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-rack-onAccent hover:bg-rack-accentHover"
                >
                  <Play size={11} weight="fill" />
                  Simulate
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadIntoWorkbench(selectedPreset)}
                  className="inline-flex h-7 items-center gap-1 rounded-[2px] border border-rack-borderStrong bg-rack-elevated px-2.5 font-mono text-[10px] uppercase tracking-wider text-rack-text hover:border-rack-accent"
                >
                  Open in Workbench
                </button>
              </div>
            </div>

            {simulatedResponse ? (
              <div className="flex flex-col gap-3 p-3">
                <div className="flex flex-wrap items-center gap-3 font-mono text-xs tabular-nums">
                  <StatusBadge
                    status={simulatedResponse.status}
                    statusText={simulatedResponse.statusText}
                  />
                  <span className="text-rack-muted">
                    <span className="text-rack-dim">TIME </span>
                    {Math.round(simulatedResponse.timeMs)} ms
                  </span>
                  <span className="text-rack-muted">
                    <span className="text-rack-dim">SIZE </span>
                    {formatBytes(simulatedResponse.sizeBytes)}
                  </span>
                </div>

                {selectedPreset.request.body ? (
                  <div>
                    <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-rack-dim">
                      Request Payload
                    </div>
                    <pre className="overflow-x-auto border border-rack-border bg-rack-canvas p-2.5 font-mono text-xs text-rack-muted">
                      {selectedPreset.request.body}
                    </pre>
                  </div>
                ) : null}

                <div>
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-rack-dim">
                    Simulated Mock Payload
                  </div>
                  <pre className="overflow-x-auto border border-rack-border bg-rack-canvas p-3 font-mono text-xs leading-relaxed text-rack-text">
                    {simulatedResponse.body}
                  </pre>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
