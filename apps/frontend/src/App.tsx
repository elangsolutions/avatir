import { Box } from '@chakra-ui/react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';
import { AgreementsPage } from './pages/AgreementsPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { LandingPage } from './pages/LandingPage';
import { UsersPage } from './pages/UsersPage';
import { useAppTheme } from './theme/app-theme';

export function App() {
  const { palette } = useAppTheme();

  return (
    <Box minH="100vh" bg={palette.pageBg} color={palette.text}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app/login" element={<AuthPage />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="agreements" element={<AgreementsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}
