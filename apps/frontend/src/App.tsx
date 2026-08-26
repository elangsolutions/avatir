import { Box } from '@chakra-ui/react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth, RequireRole } from './auth/RequireAuth';
import { AppShell } from './layouts/AppShell';
import { AgreementsPage } from './pages/AgreementsPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { LandingPage } from './pages/LandingPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { UsersPage } from './pages/UsersPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { useAuth } from './auth/AuthContext';
import { useAppTheme } from './theme/app-theme';

function LoginRoute() {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return <AuthPage />;
}

export function App() {
  const { palette } = useAppTheme();

  return (
    <Box minH="100vh" bg={palette.pageBg} color={palette.text}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app/login" element={<LoginRoute />} />
        <Route path="/app/reset-password" element={<ResetPasswordPage />} />
        <Route path="/app/verify-email" element={<VerifyEmailPage />} />
        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route
            path="users"
            element={
              <RequireRole roles={['ADMIN']}>
                <UsersPage />
              </RequireRole>
            }
          />
          <Route path="agreements" element={<AgreementsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}
