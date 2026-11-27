import type { HttpMethod } from '../types/api';

export const METHOD_BADGE_STYLES: Record<HttpMethod, string> = {
  GET: 'text-rack-ok border-rack-ok/40 bg-rack-ok/10',
  POST: 'text-rack-warn border-rack-warn/40 bg-rack-warn/10',
  PUT: 'text-rack-info border-rack-info/40 bg-rack-info/10',
  PATCH: 'text-rack-patch border-rack-patch/40 bg-rack-patch/10',
  DELETE: 'text-rack-err border-rack-err/40 bg-rack-err/10',
  HEAD: 'text-rack-neutral border-rack-neutral/40 bg-rack-neutral/10',
  OPTIONS: 'text-rack-opt border-rack-opt/40 bg-rack-opt/10',
};

export function getStatusBadgeStyle(status: number): string {
  if (status >= 200 && status < 300) {
    return 'text-rack-ok border-rack-ok/50 bg-rack-ok/10';
  }
  if (status >= 300 && status < 400) {
    return 'text-rack-info border-rack-info/50 bg-rack-info/10';
  }
  if (status >= 400 && status < 500) {
    return 'text-rack-warn border-rack-warn/50 bg-rack-warn/10';
  }
  return 'text-rack-err border-rack-err/50 bg-rack-err/10';
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
