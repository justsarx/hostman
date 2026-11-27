import type {
  ApiRequest,
  Collection,
  Environment,
  HistoryItem,
  RequestTab,
} from '../types/api';

const KEYS = {
  seeded: 'mini_postman_v1_seeded',
  collections: 'mini_postman_v1_collections',
  requests: 'mini_postman_v1_requests',
  environments: 'mini_postman_v1_environments',
  activeEnvId: 'mini_postman_v1_active_env_id',
  history: 'mini_postman_v1_history',
  tabs: 'mini_postman_v1_tabs',
  activeTabId: 'mini_postman_v1_active_tab_id',
} as const;

export const MAX_HISTORY_ITEMS = 50;

export interface WorkspaceSnapshot {
  collections: Collection[];
  requests: ApiRequest[];
  environments: Environment[];
  activeEnvironmentId: string | null;
  history: HistoryItem[];
  tabs: RequestTab[];
  activeTabId: string;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

function createSeedData(): WorkspaceSnapshot {
  const now = Date.now();
  const envId = 'env-local-dev';
  const collectionId = 'col-starter-examples';

  const environments: Environment[] = [
    {
      id: envId,
      name: 'Local Dev',
      variables: [
        { id: 'var-base-url', key: 'BASE_URL', value: 'http://localhost:3000', enabled: true },
      ],
    },
  ];

  const collections: Collection[] = [
    {
      id: collectionId,
      name: 'Starter Examples',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const requests: ApiRequest[] = [
    {
      id: 'req-starter-jsonplaceholder',
      name: 'GET JSONPlaceholder Post',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      params: [],
      headers: [],
      bodyType: 'none',
      body: '',
      collectionId,
      updatedAt: now,
    },
    {
      id: 'req-starter-health',
      name: 'GET Local Health Check',
      method: 'GET',
      url: '{{BASE_URL}}/health',
      params: [],
      headers: [],
      bodyType: 'none',
      body: '',
      collectionId,
      updatedAt: now,
    },
  ];

  const initialTab: RequestTab = {
    id: crypto.randomUUID(),
    request: { ...requests[0] },
    isDirty: false,
    response: null,
    isLoading: false,
  };

  return {
    collections,
    requests,
    environments,
    activeEnvironmentId: envId,
    history: [],
    tabs: [initialTab],
    activeTabId: initialTab.id,
  };
}

export const storageService = {
  async loadWorkspace(): Promise<WorkspaceSnapshot> {
    const isSeeded = localStorage.getItem(KEYS.seeded) === 'true';
    if (!isSeeded) {
      const seed = createSeedData();
      writeJson(KEYS.collections, seed.collections);
      writeJson(KEYS.requests, seed.requests);
      writeJson(KEYS.environments, seed.environments);
      writeJson(KEYS.activeEnvId, seed.activeEnvironmentId);
      writeJson(KEYS.history, seed.history);
      writeJson(KEYS.tabs, seed.tabs);
      writeJson(KEYS.activeTabId, seed.activeTabId);
      localStorage.setItem(KEYS.seeded, 'true');
      return seed;
    }

    const collections = readJson<Collection[]>(KEYS.collections, []);
    const requests = readJson<ApiRequest[]>(KEYS.requests, []);
    const environments = readJson<Environment[]>(KEYS.environments, []);
    const activeEnvironmentId = readJson<string | null>(KEYS.activeEnvId, null);
    const history = readJson<HistoryItem[]>(KEYS.history, []);
    const rawTabs = readJson<RequestTab[]>(KEYS.tabs, []);

    const tabs: RequestTab[] =
      rawTabs.length > 0
        ? rawTabs.map((t) => ({ ...t, isLoading: false }))
        : [
            {
              id: crypto.randomUUID(),
              request: {
                id: crypto.randomUUID(),
                name: 'Untitled Request',
                method: 'GET',
                url: 'https://jsonplaceholder.typicode.com/posts/1',
                params: [],
                headers: [],
                bodyType: 'none',
                body: '',
                updatedAt: Date.now(),
              },
              isDirty: false,
              response: null,
              isLoading: false,
            },
          ];

    const savedActiveTabId = readJson<string>(KEYS.activeTabId, tabs[0].id);
    const activeTabId = tabs.some((t) => t.id === savedActiveTabId)
      ? savedActiveTabId
      : tabs[0].id;

    return {
      collections,
      requests,
      environments,
      activeEnvironmentId,
      history: history.slice(0, MAX_HISTORY_ITEMS),
      tabs,
      activeTabId,
    };
  },

  async saveCollections(collections: Collection[]): Promise<void> {
    writeJson(KEYS.collections, collections);
  },

  async saveRequests(requests: ApiRequest[]): Promise<void> {
    writeJson(KEYS.requests, requests);
  },

  async saveEnvironments(environments: Environment[]): Promise<void> {
    writeJson(KEYS.environments, environments);
  },

  async saveActiveEnvironmentId(envId: string | null): Promise<void> {
    writeJson(KEYS.activeEnvId, envId);
  },

  async saveHistory(history: HistoryItem[]): Promise<void> {
    writeJson(KEYS.history, history.slice(0, MAX_HISTORY_ITEMS));
  },

  async saveTabsState(tabs: RequestTab[], activeTabId: string): Promise<void> {
    const serializableTabs = tabs.map((tab) => ({
      ...tab,
      isLoading: false,
      response:
        tab.response && tab.response.body.length > 100_000
          ? {
              ...tab.response,
              body: tab.response.body.slice(0, 100_000) + '\n... [truncated in persisted tab cache]',
            }
          : tab.response,
    }));
    writeJson(KEYS.tabs, serializableTabs);
    writeJson(KEYS.activeTabId, activeTabId);
  },
};
