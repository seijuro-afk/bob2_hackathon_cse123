import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Welcome from './pages/Welcome'
import SetupChecklist from './pages/SetupChecklist'
import CommitHistory from './pages/CommitHistory'
import DocumentationQA from './pages/DocumentationQA'
import EnvironmentValidator from './pages/EnvironmentValidator'
import ManagerSettings from './pages/ManagerSettings'
import OnboardingCompletion from './pages/OnboardingCompletion'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Full-viewport — no AppShell */}
        <Route path="/" element={<Welcome />} />

        {/* Dashboard screens — wrapped in AppShell */}
        <Route element={<AppShell />}>
          <Route path="/setup" element={<SetupChecklist />} />
          <Route path="/commits" element={<CommitHistory />} />
          <Route path="/docs" element={<DocumentationQA />} />
          <Route path="/validator" element={<EnvironmentValidator />} />
          <Route path="/manager" element={<ManagerSettings />} />
          <Route path="/complete" element={<OnboardingCompletion />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
