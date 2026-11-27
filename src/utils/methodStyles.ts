import type { HttpMethod } from '../types/api';

export const METHOD_BADGE_STYLES: Record<HttpMethod, string> = {
  GET: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/5',
  POST: 'text-amber-400 border-amber-500/40 bg-amber-500/5',
  PUT: 'text-sky-400 border-sky-500/40 bg-sky-500/5',
  PATCH: 'text-violet-400 border-violet-500/40 bg-violet-500/5',
  DELETE: 'text-rose-400 border-rose-500/40 bg-rose-500/5',
  HEAD: 'text-zinc-300 border-zinc-500/40 bg-zinc-500/5',
  OPTIONS: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/5',
};

export function getStatusBadgeStyle(status: number): string {
  if (status >= 200 && status < 300) {
    return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
  }
  if (status >= 300 && status < 400) {
    return 'text-sky-400 border-sky-500/50 bg-sky-500/10';
  }
  if (status >= 400 && status < 500) {
    return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
  }
  if (status >= 500) {
    return 'text-rose-400 border-rose-500/50 bg-rose-500/10';
  }
  return 'text-rose-400 border-rose-500/50 bg-rose-500/10';
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
