import { FC, ReactNode, useCallback, useEffect, useState } from 'react';

import { IUserInfo } from '@shared/types';
import { AuthContext } from '@features/auth';

const MOCK_USER_KEY = 'mock_user';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MOCK_USER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as IUserInfo;
        setUser(parsed);
      }
    } catch {
      localStorage.removeItem(MOCK_USER_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(() => {
    // Заглушка — логин через форму LoginForm
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(MOCK_USER_KEY);
    setUser(null);
    window.location.href = '/';
  }, []);

  const mockLogin = useCallback((email: string) => {
    const mockUser: IUserInfo = {
      id: 1,
      login: email,
      email,
      name: email.split('@')[0] || 'Пользователь',
      description: '',
      phoneNumber: '',
      isVerified: false,
      stats: { reviews: 0, rating: 0, offers: 0 },
      language: 'ru',
    };
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, mockLogin }}>
      {children}
    </AuthContext.Provider>
  );
};
