import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import AppShell from './components/layout/AppShell'
import { RequireAuth, RequireManager } from './components/layout/RequireAuth'
import Welcome from './pages/Welcome'
import SetupChecklist from './pages/SetupChecklist'
import CommitHistory from './pages/CommitHistory'
import DocumentationQA from './pages/DocumentationQA'
import EnvironmentValidator from './pages/EnvironmentValidator'
import ManagerSettings from './pages/ManagerSettings'
import OnboardingCompletion from './pages/OnboardingCompletion'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Full-viewport — login / role selection, no AppShell */}
          <Route path="/" element={<Welcome />} />

          {/* Dashboard screens — login required, wrapped in AppShell */}
          <Route element={<RequireAuth />}>
            <Route element={<AppShell />}>
              <Route path="/setup" element={<SetupChecklist />} />
              <Route path="/commits" element={<CommitHistory />} />
              <Route path="/docs" element={<DocumentationQA />} />
              <Route path="/validator" element={<EnvironmentValidator />} />
              <Route path="/complete" element={<OnboardingCompletion />} />

              {/* Manager-only */}
              <Route element={<RequireManager />}>
                <Route path="/manager" element={<ManagerSettings />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
