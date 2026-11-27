import type { ApiRequest, Collection, Environment } from '../types/api';

export interface HostmanExportPayload {
  version: 1;
  exportedAt: string;
  collections: Collection[];
  requests: ApiRequest[];
  environments: Environment[];
}

export function exportWorkspaceJson(
  collections: Collection[],
  requests: ApiRequest[],
  environments: Environment[]
): void {
  const payload: HostmanExportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    collections,
    requests,
    environments,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const dateTag = new Date().toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = `hostman-workspace-${dateTag}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function mergeById<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of existing) {
    map.set(item.id, item);
  }
  for (const item of incoming) {
    if (item && typeof item.id === 'string') {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
}

export function parseAndMergeImport(
  rawText: string,
  current: {
    collections: Collection[];
    requests: ApiRequest[];
    environments: Environment[];
  }
): {
  collections: Collection[];
  requests: ApiRequest[];
  environments: Environment[];
  summary: { collections: number; requests: number; environments: number };
} {
  const parsed = JSON.parse(rawText) as Partial<HostmanExportPayload>;
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid JSON structure.');
  }

  const incomingCollections = Array.isArray(parsed.collections) ? parsed.collections : [];
  const incomingRequests = Array.isArray(parsed.requests) ? parsed.requests : [];
  const incomingEnvironments = Array.isArray(parsed.environments) ? parsed.environments : [];

  if (
    incomingCollections.length === 0 &&
    incomingRequests.length === 0 &&
    incomingEnvironments.length === 0
  ) {
    throw new Error('Backup file does not contain collections, requests, or environments.');
  }

  return {
    collections: mergeById(current.collections, incomingCollections),
    requests: mergeById(current.requests, incomingRequests),
    environments: mergeById(current.environments, incomingEnvironments),
    summary: {
      collections: incomingCollections.length,
      requests: incomingRequests.length,
      environments: incomingEnvironments.length,
    },
  };
}
