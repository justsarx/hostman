import { useState } from 'react';
import { Check, Copy, LinkBreak, Stop, Warning } from '@phosphor-icons/react';
import type { ApiResponse } from '../../types/api';

type SnippetFramework = 'express' | 'fastapi' | 'spring';

const CORS_SNIPPETS: Record<SnippetFramework, { label: string; code: string }> = {
  express: {
    label: 'Express',
    code: `import cors from 'cors';

app.use(cors({
  origin: '*', // or 'http://localhost:5173'
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));`,
  },
  fastapi: {
    label: 'FastAPI',
    code: `from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:5173"]
    allow_methods=["*"],
    allow_headers=["*"],
)`,
  },
  spring: {
    label: 'Spring Boot',
    code: `@Configuration
public class CorsConfig implements WebMvcConfigurer {
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
      .allowedOrigins("*")
      .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
      .allowedHeaders("*");
  }
}`,
  },
};

interface CorsDiagnosticCardProps {
  response: ApiResponse;
}

export function CorsDiagnosticCard({ response }: CorsDiagnosticCardProps) {
  const [framework, setFramework] = useState<SnippetFramework>('express');
  const [copied, setCopied] = useState(false);

  if (response.errorType === 'aborted') {
    return (
      <div className="border border-rack-border bg-rack-canvas p-4 font-mono">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rack-warn">
          <Stop size={16} weight="bold" />
          Request Aborted
        </div>
        <p className="mt-2 text-xs text-rack-muted">
          The in-flight fetch to <span className="text-rack-text">{response.targetUrl}</span> was
          cancelled after {Math.round(response.timeMs)} ms.
        </p>
      </div>
    );
  }

  if (response.errorType === 'invalid-url') {
    return (
      <div className="border border-rack-warn/40 bg-rack-warn/5 p-4 font-mono">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rack-warn">
          <Warning size={16} weight="bold" />
          Invalid Target URL
        </div>
        <p className="mt-2 text-xs text-rack-text">{response.errorMessage}</p>
      </div>
    );
  }

  let targetHost = response.targetUrl || 'target endpoint';
  let isLocalhost = response.errorType === 'network';
  try {
    if (response.targetUrl) {
      const u = new URL(response.targetUrl);
      targetHost = u.host;
      const h = u.hostname.toLowerCase();
      isLocalhost =
        h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0' || h === '[::1]';
    }
  } catch {
    // ignore URL parse error
  }

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(CORS_SNIPPETS[framework].code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <div className="flex flex-col gap-3 border border-rack-err/40 bg-rack-canvas p-4 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rack-border pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rack-err">
          <LinkBreak size={16} weight="bold" />
          {isLocalhost
            ? `Unreachable Local Port or Blocked CORS (${targetHost})`
            : `CORS Policy or Network Error (${targetHost})`}
        </div>
        <span className="rounded-[2px] border border-rack-border bg-rack-elevated px-1.5 py-0.5 text-[10px] text-rack-muted">
          {response.errorMessage || 'TypeError: Failed to fetch'}
        </span>
      </div>

      <div className="grid gap-2 text-xs text-rack-muted md:grid-cols-2">
        <div className="border border-rack-border bg-rack-surface p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-rack-text">
            1. {isLocalhost ? 'Verify Local Service Is Listening' : 'Check Network Reachability'}
          </div>
          <p className="mt-1.5 leading-relaxed text-rack-muted">
            {isLocalhost
              ? `No response received from ${targetHost}. Confirm your dev server is running on that port and listening on localhost / 127.0.0.1.`
              : !navigator.onLine
                ? 'Browser reports OFFLINE. Remote hosts cannot be reached until connectivity returns (localhost remains accessible).'
                : `Verify ${targetHost} is reachable and not blocked by TLS/mixed-content rules (HTTPS page calling HTTP endpoint).`}
          </p>
        </div>

        <div className="border border-rack-border bg-rack-surface p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-rack-text">
            2. Missing Access-Control-Allow-Origin
          </div>
          <p className="mt-1.5 leading-relaxed text-rack-muted">
            Direct browser fetch requires the server to return{' '}
            <code className="text-rack-accent">Access-Control-Allow-Origin</code> and respond to{' '}
            <code className="text-rack-text">OPTIONS</code> preflight requests for custom headers or
            JSON bodies.
          </p>
        </div>
      </div>

      <div className="border border-rack-border bg-rack-surface">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rack-border bg-rack-elevated px-3 py-1.5">
          <div className="flex items-center gap-1" role="tablist" aria-label="CORS backend snippets">
            {(Object.keys(CORS_SNIPPETS) as SnippetFramework[]).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={framework === key}
                onClick={() => setFramework(key)}
                className={`px-2.5 py-1 text-[11px] uppercase tracking-wider ${
                  framework === key ? 'text-rack-text' : 'text-rack-muted hover:text-rack-text'
                }`}
              >
                {CORS_SNIPPETS[key].label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopySnippet}
            className="inline-flex items-center gap-1 rounded-[2px] border border-rack-border bg-rack-canvas px-2 py-1 text-[10px] uppercase tracking-wider text-rack-muted hover:border-rack-borderStrong hover:text-rack-text"
          >
            {copied ? <Check size={12} weight="bold" className="text-rack-ok" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy Snippet'}
          </button>
        </div>
        <pre className="overflow-x-auto p-3 text-[11px] leading-relaxed text-rack-text">
          {CORS_SNIPPETS[framework].code}
        </pre>
      </div>
    </div>
  );
}
