import { FC, ReactNode, useCallback, useEffect, useState } from 'react';

import { UserService } from '@shared/api';
import { IUserInfo } from '@shared/types';
import { AuthContext } from '@features/auth';

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL as string;
const TOKEN_KEY = 'token';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const params = new URLSearchParams(window.location.search);
    const candidateToken = params.get('token') ?? localStorage.getItem(TOKEN_KEY);

    if (!candidateToken) {
      setIsLoading(false);
      return;
    }

    if (params.has('token')) {
      params.delete('token');
      const cleanUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : '');
      window.history.replaceState(null, '', cleanUrl);
    }

    // Temporarily set the header for this validation request
    localStorage.setItem(TOKEN_KEY, candidateToken);

    UserService.infoUser()
      .then(res => {
        if (!controller.signal.aborted) {
          setUser(res.data.data);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  const login = useCallback(() => {
    if (!KEYCLOAK_URL) {
      console.warn('VITE_KEYCLOAK_URL is not defined');
      return;
    }
    window.location.href = KEYCLOAK_URL;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    window.location.href = '/';
  }, []);

  return (
    <AuthContext value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext>
  );
};
