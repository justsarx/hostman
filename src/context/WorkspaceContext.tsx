import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { executeRequest } from '../services/httpClient';
import { MAX_HISTORY_ITEMS, storageService } from '../services/storageService';
import type {
  ApiRequest,
  Collection,
  Environment,
  HistoryItem,
  KeyValuePair,
  RequestTab,
} from '../types/api';
import { exportWorkspaceJson, parseAndMergeImport } from '../utils/importExport';
import { buildInterpolatedUrl, findUnresolvedVariables } from '../utils/interpolation';
import { syncParamsToUrl, syncUrlToParams } from '../utils/urlSync';
import {
  WorkspaceContext,
  type SidebarSection,
  type WorkspaceContextValue,
} from './useWorkspace';

function createBlankRequest(): ApiRequest {
  return {
    id: crypto.randomUUID(),
    name: 'Untitled Request',
    method: 'GET',
    url: '',
    params: [],
    headers: [],
    bodyType: 'none',
    body: '',
    updatedAt: Date.now(),
  };
}

function createTab(request: ApiRequest, isDirty = false): RequestTab {
  return {
    id: crypto.randomUUID(),
    request: structuredClone(request),
    isDirty,
    response: null,
    isLoading: false,
  };
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const isOnline = useOnlineStatus();
  const [hydrated, setHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarSection, setSidebarSection] = useState<SidebarSection>('collections');

  const [collections, setCollections] = useState<Collection[]>([]);
  const [savedRequests, setSavedRequests] = useState<ApiRequest[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [activeEnvId, setActiveEnvId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [tabs, setTabs] = useState<RequestTab[]>(() => [createTab(createBlankRequest())]);
  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0].id);

  const [envModalOpen, setEnvModalOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  useEffect(() => {
    let mounted = true;
    storageService.loadWorkspace().then((snapshot) => {
      if (!mounted) return;
      setCollections(snapshot.collections);
      setSavedRequests(snapshot.requests);
      setEnvironments(snapshot.environments);
      setActiveEnvId(snapshot.activeEnvironmentId);
      setHistory(snapshot.history);
      setTabs(snapshot.tabs);
      setActiveTabId(snapshot.activeTabId);
      setHydrated(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    storageService.saveTabsState(tabs, activeTabId);
  }, [tabs, activeTabId, hydrated]);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];
  const activeEnvironment = environments.find((e) => e.id === activeEnvId) ?? null;

  const unresolvedVars = useMemo(() => {
    const r = activeTab.request;
    const inputs = [
      r.url,
      ...r.params.filter((p) => p.enabled).flatMap((p) => [p.key, p.value]),
      ...r.headers.filter((h) => h.enabled).flatMap((h) => [h.key, h.value]),
      r.bodyType !== 'none' ? r.body : '',
    ];
    return findUnresolvedVariables(inputs, activeEnvironment);
  }, [activeTab.request, activeEnvironment]);

  const resolvedUrlPreview = useMemo(
    () => buildInterpolatedUrl(activeTab.request, activeEnvironment),
    [activeTab.request, activeEnvironment]
  );

  const setActiveEnvironment = useCallback((envId: string | null) => {
    setActiveEnvId(envId);
    storageService.saveActiveEnvironmentId(envId);
  }, []);

  const createNewRequest = useCallback(() => {
    const tab = createTab(createBlankRequest());
    setTabs((prev) => [...prev, tab]);
    setActiveTabId(tab.id);
  }, []);

  const openSavedRequest = useCallback(
    (req: ApiRequest) => {
      const existing = tabs.find((t) => t.request.id === req.id);
      if (existing) {
        setActiveTabId(existing.id);
        return;
      }
      const syncedReq: ApiRequest = {
        ...structuredClone(req),
        params: req.params.length > 0 ? req.params : syncUrlToParams(req.url, []),
      };
      const tab = createTab(syncedReq);
      setTabs((prev) => [...prev, tab]);
      setActiveTabId(tab.id);
    },
    [tabs]
  );

  const openRequestInNewTab = useCallback((template: Omit<ApiRequest, 'id' | 'updatedAt'>) => {
    const req: ApiRequest = {
      ...structuredClone(template),
      id: crypto.randomUUID(),
      collectionId: undefined,
      updatedAt: Date.now(),
    };
    req.params = req.params.length > 0 ? req.params : syncUrlToParams(req.url, []);
    const tab = createTab(req, true);
    setTabs((prev) => [...prev, tab]);
    setActiveTabId(tab.id);
  }, []);

  const closeTab = useCallback(
    (tabId: string) => {
      abortControllersRef.current.get(tabId)?.abort();
      abortControllersRef.current.delete(tabId);

      setTabs((prev) => {
        if (prev.length === 1) {
          const replacement = createTab(createBlankRequest());
          setActiveTabId(replacement.id);
          return [replacement];
        }
        const index = prev.findIndex((t) => t.id === tabId);
        const next = prev.filter((t) => t.id !== tabId);
        if (tabId === activeTabId) {
          const fallback = next[Math.max(0, index - 1)] ?? next[0];
          setActiveTabId(fallback.id);
        }
        return next;
      });
    },
    [activeTabId]
  );

  const updateTabRequest = useCallback((tabId: string, updater: (req: ApiRequest) => ApiRequest) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              isDirty: true,
              request: { ...updater(tab.request), updatedAt: Date.now() },
            }
          : tab
      )
    );
  }, []);

  const updateActiveRequest = useCallback(
    (patch: Partial<ApiRequest>) => {
      updateTabRequest(activeTab.id, (req) => ({ ...req, ...patch }));
    },
    [activeTab.id, updateTabRequest]
  );

  const updateActiveUrl = useCallback(
    (nextUrl: string) => {
      updateTabRequest(activeTab.id, (req) => ({
        ...req,
        url: nextUrl,
        params: syncUrlToParams(nextUrl, req.params),
      }));
    },
    [activeTab.id, updateTabRequest]
  );

  const updateActiveParams = useCallback(
    (nextParams: KeyValuePair[]) => {
      updateTabRequest(activeTab.id, (req) => ({
        ...req,
        params: nextParams,
        url: syncParamsToUrl(req.url, nextParams),
      }));
    },
    [activeTab.id, updateTabRequest]
  );

  const sendActiveRequest = useCallback(async () => {
    const tabId = activeTab.id;
    const reqSnapshot = structuredClone(activeTab.request);

    abortControllersRef.current.get(tabId)?.abort();
    const controller = new AbortController();
    abortControllersRef.current.set(tabId, controller);

    setTabs((prev) =>
      prev.map((tab) => (tab.id === tabId ? { ...tab, isLoading: true } : tab))
    );

    const response = await executeRequest(reqSnapshot, activeEnvironment, controller.signal);

    if (abortControllersRef.current.get(tabId) === controller) {
      abortControllersRef.current.delete(tabId);
    }

    setTabs((prev) =>
      prev.map((tab) => (tab.id === tabId ? { ...tab, isLoading: false, response } : tab))
    );

    if (response.errorType !== 'aborted') {
      const historyEntry: HistoryItem = {
        id: crypto.randomUUID(),
        request: reqSnapshot,
        responseMeta: {
          status: response.status,
          statusText: response.statusText,
          timeMs: response.timeMs,
          sizeBytes: response.sizeBytes,
          errorType: response.errorType,
        },
        executedAt: Date.now(),
      };
      setHistory((prev) => {
        const next = [historyEntry, ...prev].slice(0, MAX_HISTORY_ITEMS);
        storageService.saveHistory(next);
        return next;
      });
    }
  }, [activeTab.id, activeTab.request, activeEnvironment]);

  const cancelActiveRequest = useCallback(() => {
    const controller = abortControllersRef.current.get(activeTab.id);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(activeTab.id);
    }
  }, [activeTab.id]);

  const createCollection = useCallback((name: string) => {
    const now = Date.now();
    const nextCol: Collection = { id: crypto.randomUUID(), name, createdAt: now, updatedAt: now };
    setCollections((prev) => {
      const next = [...prev, nextCol];
      storageService.saveCollections(next);
      return next;
    });
  }, []);

  const renameCollection = useCallback((id: string, name: string) => {
    setCollections((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, name, updatedAt: Date.now() } : c));
      storageService.saveCollections(next);
      return next;
    });
  }, []);

  const deleteCollection = useCallback((id: string) => {
    setCollections((prev) => {
      const next = prev.filter((c) => c.id !== id);
      storageService.saveCollections(next);
      return next;
    });
    setSavedRequests((prev) => {
      const next = prev.filter((r) => r.collectionId !== id);
      storageService.saveRequests(next);
      return next;
    });
  }, []);

  const persistRequestToCollection = useCallback(
    (reqToSave: ApiRequest) => {
      setSavedRequests((prev) => {
        const exists = prev.some((r) => r.id === reqToSave.id);
        const next = exists
          ? prev.map((r) => (r.id === reqToSave.id ? reqToSave : r))
          : [...prev, reqToSave];
        storageService.saveRequests(next);
        return next;
      });
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTab.id ? { ...tab, request: reqToSave, isDirty: false } : tab
        )
      );
    },
    [activeTab.id]
  );

  const saveActiveRequest = useCallback(() => {
    const req = activeTab.request;
    if (req.collectionId && collections.some((c) => c.id === req.collectionId)) {
      persistRequestToCollection({ ...structuredClone(req), updatedAt: Date.now() });
      return;
    }
    setSaveModalOpen(true);
  }, [activeTab.request, collections, persistRequestToCollection]);

  const saveModalSubmit = useCallback(
    (name: string, targetCollectionId: string, newColName?: string) => {
      let resolvedCollectionId = targetCollectionId;
      if (targetCollectionId === '__new__') {
        const now = Date.now();
        const newCol: Collection = {
          id: crypto.randomUUID(),
          name: newColName || 'My Collection',
          createdAt: now,
          updatedAt: now,
        };
        resolvedCollectionId = newCol.id;
        setCollections((prev) => {
          const next = [...prev, newCol];
          storageService.saveCollections(next);
          return next;
        });
      }

      const updatedReq: ApiRequest = {
        ...structuredClone(activeTab.request),
        name,
        collectionId: resolvedCollectionId,
        updatedAt: Date.now(),
      };
      persistRequestToCollection(updatedReq);
    },
    [activeTab.request, persistRequestToCollection]
  );

  const duplicateRequest = useCallback((req: ApiRequest) => {
    const copy: ApiRequest = {
      ...structuredClone(req),
      id: crypto.randomUUID(),
      name: `${req.name} (Copy)`,
      updatedAt: Date.now(),
    };
    setSavedRequests((prev) => {
      const next = [...prev, copy];
      storageService.saveRequests(next);
      return next;
    });
  }, []);

  const deleteSavedRequest = useCallback((id: string) => {
    setSavedRequests((prev) => {
      const next = prev.filter((r) => r.id !== id);
      storageService.saveRequests(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    storageService.saveHistory([]);
  }, []);

  const saveEnvironments = useCallback(
    (nextEnvs: Environment[], nextActiveId: string | null) => {
      setEnvironments(nextEnvs);
      setActiveEnvId(nextActiveId);
      storageService.saveEnvironments(nextEnvs);
      storageService.saveActiveEnvironmentId(nextActiveId);
    },
    []
  );

  const createEnvironmentFromForm = useCallback((env: Environment, activate = true) => {
    setEnvironments((prev) => {
      const next = [...prev, env];
      storageService.saveEnvironments(next);
      return next;
    });
    if (activate) {
      setActiveEnvId(env.id);
      storageService.saveActiveEnvironmentId(env.id);
    }
  }, []);

  const importWorkspaceFile = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const merged = parseAndMergeImport(text, {
          collections,
          requests: savedRequests,
          environments,
        });
        setCollections(merged.collections);
        setSavedRequests(merged.requests);
        setEnvironments(merged.environments);
        await Promise.all([
          storageService.saveCollections(merged.collections),
          storageService.saveRequests(merged.requests),
          storageService.saveEnvironments(merged.environments),
        ]);
        setImportStatus(
          `Imported ${merged.summary.collections} col, ${merged.summary.requests} req, ${merged.summary.environments} env`
        );
        setTimeout(() => setImportStatus(null), 3500);
      } catch (err) {
        setImportStatus(err instanceof Error ? err.message : 'Import failed');
        setTimeout(() => setImportStatus(null), 3500);
      }
    },
    [collections, savedRequests, environments]
  );

  const exportWorkspace = useCallback(() => {
    exportWorkspaceJson(collections, savedRequests, environments);
  }, [collections, savedRequests, environments]);

  const value: WorkspaceContextValue = {
    isOnline,
    hydrated,
    sidebarOpen,
    setSidebarOpen,
    sidebarSection,
    setSidebarSection,
    collections,
    savedRequests,
    environments,
    activeEnvId,
    activeEnvironment,
    history,
    tabs,
    activeTabId,
    activeTab,
    unresolvedVars,
    resolvedUrlPreview,
    envModalOpen,
    setEnvModalOpen,
    saveModalOpen,
    setSaveModalOpen,
    importStatus,
    setActiveTabId,
    setActiveEnvironment,
    createNewRequest,
    openSavedRequest,
    openRequestInNewTab,
    closeTab,
    updateActiveRequest,
    updateActiveUrl,
    updateActiveParams,
    sendActiveRequest,
    cancelActiveRequest,
    createCollection,
    renameCollection,
    deleteCollection,
    saveActiveRequest,
    saveModalSubmit,
    duplicateRequest,
    deleteSavedRequest,
    clearHistory,
    saveEnvironments,
    createEnvironmentFromForm,
    importWorkspaceFile,
    exportWorkspace,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
