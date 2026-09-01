import { Box, Text } from '@chakra-ui/react';
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAppTheme } from '../theme/app-theme';
import { useAuth } from './AuthContext';
import type { UserRole } from './types';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();
  const { palette } = useAppTheme();

  if (!isReady) {
    return (
      <Box minH="100vh" display="grid" placeItems="center" bg={palette.pageBg} color={palette.mutedText}>
        <Text>Loading workspace…</Text>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/app/login" replace />;
  }

  return children;
}

export function RequireRole({
  roles,
  children,
}: {
  roles: UserRole[];
  children: ReactNode;
}) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/app" replace />;
  }

  return children;
}
