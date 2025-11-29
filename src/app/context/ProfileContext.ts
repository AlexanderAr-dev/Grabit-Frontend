import { createContext } from 'react';
import { IUser } from '@app-types';

interface ProfileContextType {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
  isLoading: boolean;
}

export const ProfileContext =
  createContext<ProfileContextType | null>(null);
