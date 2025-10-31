import './App.css';
import { ErrorBoundary } from './components/error-boundary';
import { SchedulePage } from './features/schedule/containers/schedule-page';
import { AppProviders } from './features/auth/containers/auth-provider';
import { RequireAuth } from './features/auth/containers/require-auth';
import { LoginPage } from './features/auth/containers/login-page';
import { PlansOverviewPage } from './features/plans/containers/plans-overview-page';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <AppProviders>
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/plans"
              element={
                <RequireAuth>
                  <PlansOverviewPage />
                </RequireAuth>
              }
            />
            <Route
              path="/schedule"
              element={
                <RequireAuth>
                  <SchedulePage />
                </RequireAuth>
              }
            />
            <Route
              path="/schedule/new"
              element={
                <RequireAuth>
                  <SchedulePage />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/plans" replace />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </AppProviders>
  );
}

export default App;
