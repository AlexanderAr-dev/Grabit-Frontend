import { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { AuthService, UserService } from '@shared/api';
import { IUserInfo } from '@shared/types';
import { AuthContext } from '@features/auth';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wasUnauthorized, setWasUnauthorized] = useState(false);
  const queryClient = useQueryClient();
  // Tracks whether user was ever authenticated in this session.
  // Prevents clearing the query cache on 401 during the initial auth check
  // (when the user was never logged in), which would cause an infinite reload loop.
  const hadUserRef = useRef(false);

  useEffect(() => {
    UserService.infoUser()
      .then(res => {
        hadUserRef.current = true;
        setUser(res.data.data);
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      if (!hadUserRef.current) return;
      hadUserRef.current = false;
      setUser(null);
      setWasUnauthorized(true);
      queryClient.clear();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [queryClient]);

  const login = useCallback(() => {
    window.location.href = AuthService.getSsoLoginUrl();
  }, []);

  const logout = useCallback(async () => {
    try {
      const logoutURL = await AuthService.logout();
      if (logoutURL) {
        // Инвалидируем сессию Keycloak в фоне, затем идём на главную
        await fetch(logoutURL, { mode: 'no-cors' }).catch(() => {});
      }
    } catch {
      // ignore errors, proceed with client-side logout
    }
    setUser(null);
    queryClient.clear();
    window.location.href = '/';
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, wasUnauthorized, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
