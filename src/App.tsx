import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StatusBar } from './components/layout/StatusBar';
import { TopNav } from './components/layout/TopNav';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { useWorkspace } from './context/useWorkspace';
import { CollectionsPage } from './pages/CollectionsPage';
import { EnvironmentsPage } from './pages/EnvironmentsPage';
import { MockLabPage } from './pages/MockLabPage';
import { WorkbenchPage } from './pages/WorkbenchPage';

function AppShell() {
  const { isOnline, activeEnvironment } = useWorkspace();

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-rack-canvas text-rack-text">
      <TopNav />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Routes>
          <Route path="/" element={<WorkbenchPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/environments" element={<EnvironmentsPage />} />
          <Route path="/mock-lab" element={<MockLabPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <StatusBar isOnline={isOnline} activeEnvironmentName={activeEnvironment?.name ?? null} />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <WorkspaceProvider>
        <AppShell />
      </WorkspaceProvider>
    </BrowserRouter>
  );
}

export default App;
