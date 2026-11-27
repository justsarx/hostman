import { createContext, useContext } from 'react';
import type {
  ApiRequest,
  Collection,
  Environment,
  HistoryItem,
  KeyValuePair,
  RequestTab,
} from '../types/api';

export type SidebarSection = 'collections' | 'history';

export interface WorkspaceContextValue {
  isOnline: boolean;
  hydrated: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  sidebarSection: SidebarSection;
  setSidebarSection: (section: SidebarSection) => void;
  collections: Collection[];
  savedRequests: ApiRequest[];
  environments: Environment[];
  activeEnvId: string | null;
  activeEnvironment: Environment | null;
  history: HistoryItem[];
  tabs: RequestTab[];
  activeTabId: string;
  activeTab: RequestTab;
  unresolvedVars: string[];
  resolvedUrlPreview: string;
  envModalOpen: boolean;
  setEnvModalOpen: (open: boolean) => void;
  saveModalOpen: boolean;
  setSaveModalOpen: (open: boolean) => void;
  importStatus: string | null;
  setActiveTabId: (tabId: string) => void;
  setActiveEnvironment: (envId: string | null) => void;
  createNewRequest: () => void;
  openSavedRequest: (req: ApiRequest) => void;
  openRequestInNewTab: (req: Omit<ApiRequest, 'id' | 'updatedAt'>) => void;
  closeTab: (tabId: string) => void;
  updateActiveRequest: (patch: Partial<ApiRequest>) => void;
  updateActiveUrl: (nextUrl: string) => void;
  updateActiveParams: (nextParams: KeyValuePair[]) => void;
  sendActiveRequest: () => Promise<void>;
  cancelActiveRequest: () => void;
  createCollection: (name: string) => void;
  renameCollection: (id: string, name: string) => void;
  deleteCollection: (id: string) => void;
  saveActiveRequest: () => void;
  saveModalSubmit: (name: string, targetCollectionId: string, newColName?: string) => void;
  duplicateRequest: (req: ApiRequest) => void;
  deleteSavedRequest: (id: string) => void;
  clearHistory: () => void;
  saveEnvironments: (nextEnvs: Environment[], nextActiveId: string | null) => void;
  createEnvironmentFromForm: (env: Environment, activate?: boolean) => void;
  importWorkspaceFile: (file: File) => Promise<void>;
  exportWorkspace: () => void;
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspace must be used inside WorkspaceProvider');
  }
  return ctx;
}
