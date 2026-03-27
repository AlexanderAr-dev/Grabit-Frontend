import { createContext } from 'react';

import { IUserInfo } from '@shared/types';

interface ProfileContextType {
  user: IUserInfo | null;
  setUser: (user: IUserInfo | null) => void;
  isLoading: boolean;
}

export const ProfileContext = createContext<ProfileContextType | null>(null);
