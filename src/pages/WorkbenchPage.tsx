import { useCallback, useRef, useState } from 'react';
import { DownloadSimple, UploadSimple } from '@phosphor-icons/react';
import { RequestPane } from '../components/layout/RequestPane';
import { ResponsePane } from '../components/layout/ResponsePane';
import { Sidebar } from '../components/layout/Sidebar';
import { TabBar } from '../components/layout/TabBar';
import { EnvironmentModal } from '../components/modals/EnvironmentModal';
import { SaveRequestModal } from '../components/modals/SaveRequestModal';
import { CorsDiagnosticCard } from '../components/response/CorsDiagnosticCard';
import { CollectionsPanel } from '../components/sidebar/CollectionsPanel';
import { HistoryPanel } from '../components/sidebar/HistoryPanel';
import { useWorkspace } from '../context/useWorkspace';
import { useShortcuts } from '../hooks/useShortcuts';
import { generateCurlCommand } from '../utils/curlGenerator';

export function WorkbenchPage() {
  const {
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
    importWorkspaceFile,
    exportWorkspace,
  } = useWorkspace();

  const [curlCopied, setCurlCopied] = useState(false);
  const urlInputRef = useRef<HTMLInputElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const handleFocusUrl = useCallback(() => {
    urlInputRef.current?.focus();
    urlInputRef.current?.select();
  }, []);

  useShortcuts({
    onSend: sendActiveRequest,
    onSave: saveActiveRequest,
    onFocusUrl: handleFocusUrl,
  });

  const handleCopyCurl = async () => {
    const curl = generateCurlCommand(activeTab.request, activeEnvironment);
    try {
      await navigator.clipboard.writeText(curl);
      setCurlCopied(true);
      setTimeout(() => setCurlCopied(false), 1500);
    } catch {
      // Clipboard unavailable
    }
  };

  const handleImportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) {
      await importWorkspaceFile(file);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <Sidebar
        isOpen={sidebarOpen}
        onToggleOpen={() => setSidebarOpen((v) => !v)}
        activeSection={sidebarSection}
        onSectionChange={setSidebarSection}
        onNewRequest={createNewRequest}
        environments={environments}
        activeEnvironmentId={activeEnvId}
        onEnvironmentChange={setActiveEnvironment}
        onOpenEnvModal={() => setEnvModalOpen(true)}
        collectionsSlot={
          <CollectionsPanel
            collections={collections}
            requests={savedRequests}
            activeRequestId={activeTab.request.id}
            onOpenRequest={openSavedRequest}
            onCreateCollection={createCollection}
            onRenameCollection={renameCollection}
            onDeleteCollection={deleteCollection}
            onDuplicateRequest={duplicateRequest}
            onDeleteRequest={deleteSavedRequest}
          />
        }
        historySlot={
          <HistoryPanel
            history={history}
            onReopenRequest={(req) => openRequestInNewTab(req)}
            onClearHistory={clearHistory}
          />
        }
        footerActionsSlot={
          <div className="flex flex-col gap-1.5">
            {importStatus ? (
              <div
                role="status"
                className="border border-rack-border bg-rack-elevated px-2 py-1 font-mono text-[10px] text-rack-accent"
              >
                {importStatus}
              </div>
            ) : null}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={exportWorkspace}
                className="inline-flex h-7 items-center justify-center gap-1 rounded-[2px] border border-rack-border bg-rack-elevated px-2 font-mono text-[10px] uppercase tracking-wider text-rack-muted hover:border-rack-borderStrong hover:text-rack-text"
              >
                <DownloadSimple size={12} weight="bold" />
                Export
              </button>
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                className="inline-flex h-7 items-center justify-center gap-1 rounded-[2px] border border-rack-border bg-rack-elevated px-2 font-mono text-[10px] uppercase tracking-wider text-rack-muted hover:border-rack-borderStrong hover:text-rack-text"
              >
                <UploadSimple size={12} weight="bold" />
                Import
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleImportChange}
                className="hidden"
                aria-label="Import workspace JSON"
              />
            </div>
          </div>
        }
      />

      <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-rack-canvas">
        <TabBar
          tabs={tabs}
          activeTabId={activeTab.id}
          onSelectTab={setActiveTabId}
          onCloseTab={closeTab}
          onNewTab={createNewRequest}
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
          <RequestPane
            key={activeTab.id}
            request={activeTab.request}
            isLoading={activeTab.isLoading}
            activeEnvironment={activeEnvironment}
            urlInputRef={urlInputRef}
            unresolvedVars={unresolvedVars}
            resolvedUrlPreview={resolvedUrlPreview}
            onUpdateRequest={updateActiveRequest}
            onUpdateUrl={updateActiveUrl}
            onUpdateParams={updateActiveParams}
            onSend={sendActiveRequest}
            onCancel={cancelActiveRequest}
            onSaveRequest={saveActiveRequest}
            onCopyCurl={handleCopyCurl}
            curlCopied={curlCopied}
          />
          <ResponsePane
            response={activeTab.response}
            isLoading={activeTab.isLoading}
            diagnosticSlot={
              activeTab.response?.errorType ? (
                <CorsDiagnosticCard response={activeTab.response} />
              ) : undefined
            }
          />
        </div>
      </main>

      {envModalOpen ? (
        <EnvironmentModal
          environments={environments}
          activeEnvironmentId={activeEnvId}
          onClose={() => setEnvModalOpen(false)}
          onSaveEnvironments={saveEnvironments}
        />
      ) : null}

      {saveModalOpen ? (
        <SaveRequestModal
          initialName={activeTab.request.name}
          collections={collections}
          onClose={() => setSaveModalOpen(false)}
          onSave={saveModalSubmit}
        />
      ) : null}
    </div>
  );
}
