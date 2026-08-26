import { useMutation, useQuery } from '@apollo/client/react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apolloClient } from '../apollo';
import { LOGIN_MUTATION, ME_QUERY, REGISTER_MUTATION, VERIFY_EMAIL_MUTATION } from '../graphql/auth';
import { getErrorMessage } from '../lib/errors';
import { clearToken, readToken, writeToken } from './storage';
import type { AuthUser } from './types';

type AuthSession = {
  token: string;
  user: AuthUser;
};

type AuthMessage = {
  message: string;
  devLink?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  isReady: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<AuthMessage>;
  verifyEmail: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function dropCachedSession() {
  try {
    apolloClient.cache.evict({ fieldName: 'me' });
    apolloClient.cache.gc();
    await apolloClient.clearStore();
  } catch {
    // Cache reset can fail if a query is in flight; local session is already cleared.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : readToken(),
  );

  const { data, loading, error } = useQuery<{ me: AuthUser }>(ME_QUERY, {
    skip: !token,
  });

  const [loginMutation] = useMutation<{ login: AuthSession }>(LOGIN_MUTATION);
  const [registerMutation] = useMutation<{ register: AuthMessage }>(REGISTER_MUTATION);
  const [verifyEmailMutation] = useMutation<{ verifyEmail: AuthSession }>(VERIFY_EMAIL_MUTATION);
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);

  const persistSession = useCallback(async (session: AuthSession) => {
    writeToken(session.token);
    setToken(session.token);
    setSessionUser(session.user);
    try {
      await apolloClient.resetStore();
    } catch {
      // Cache reset can fail if a prior unauthenticated query is in flight.
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await loginMutation({
          variables: { input: { email, password } },
        });
        const session = result.data?.login;
        if (!session) {
          throw new Error('Invalid email or password');
        }
        await persistSession(session);
      } catch (error) {
        throw new Error(getErrorMessage(error, 'Invalid email or password'));
      }
    },
    [loginMutation, persistSession],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        const result = await registerMutation({
          variables: { input: { name, email, password } },
        });
        const payload = result.data?.register;
        if (!payload) {
          throw new Error('Could not create account');
        }
        return payload;
      } catch (error) {
        throw new Error(getErrorMessage(error, 'Could not create account'));
      }
    },
    [registerMutation],
  );

  const verifyEmail = useCallback(
    async (tokenValue: string) => {
      try {
        const result = await verifyEmailMutation({
          variables: { token: tokenValue },
        });
        const session = result.data?.verifyEmail;
        if (!session) {
          throw new Error('This verification link is invalid or has expired.');
        }
        await persistSession(session);
      } catch (error) {
        throw new Error(getErrorMessage(error, 'This verification link is invalid or has expired.'));
      }
    },
    [persistSession, verifyEmailMutation],
  );

  const logout = useCallback(async () => {
    clearToken();
    setToken(null);
    setSessionUser(null);
    await dropCachedSession();
  }, []);

  useEffect(() => {
    if (token && error && !sessionUser) {
      void logout();
    }
  }, [error, logout, sessionUser, token]);

  useEffect(() => {
    const syncToken = () => {
      const nextToken = readToken();
      setToken(nextToken);
      if (!nextToken) {
        setSessionUser(null);
      }
    };

    window.addEventListener('storage', syncToken);
    return () => window.removeEventListener('storage', syncToken);
  }, []);

  const user = token ? (sessionUser ?? data?.me ?? null) : null;
  const isReady = !token || !loading || Boolean(user);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady: token ? isReady : true,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      verifyEmail,
      logout,
    }),
    [isReady, login, logout, register, token, user, verifyEmail],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
