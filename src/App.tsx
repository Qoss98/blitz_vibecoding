import './App.css';
import { ErrorBoundary } from './components/error-boundary';
import { SchedulePage } from './features/schedule/containers/schedule-page';
import { TraineeSchedulePage } from './features/schedule/containers/trainee-schedule-page';
import { AppProviders } from './features/auth/containers/auth-provider';
import { RequireAuth } from './features/auth/containers/require-auth';
import { RoleGuard } from './components/role-guard';
import { LoginPage } from './features/auth/containers/login-page';
import { SignupPage } from './features/auth/containers/signup-page';
import { PlansOverviewPage } from './features/plans/containers/plans-overview-page';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <AppProviders>
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/plans"
              element={
                <RequireAuth>
                  <RoleGuard allowedRoles={['manager']}>
                    <PlansOverviewPage />
                  </RoleGuard>
                </RequireAuth>
              }
            />
            <Route
              path="/schedule"
              element={
                <RequireAuth>
                  <RoleGuard allowedRoles={['manager']}>
                    <SchedulePage />
                  </RoleGuard>
                </RequireAuth>
              }
            />
            <Route
              path="/schedule/new"
              element={
                <RequireAuth>
                  <RoleGuard allowedRoles={['manager']}>
                    <SchedulePage />
                  </RoleGuard>
                </RequireAuth>
              }
            />
            <Route
              path="/my-schedule"
              element={
                <RequireAuth>
                  <RoleGuard allowedRoles={['trainee']}>
                    <TraineeSchedulePage />
                  </RoleGuard>
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </AppProviders>
  );
}

export default App;
