import { FC, ReactNode, useEffect, useState } from 'react';
import { UserService } from '@api/services/userService.ts';
import { IUser } from '@app-types';

import { ProfileContext } from './ProfileContext';

interface ProfileContextProviderProps {
  children: ReactNode;
}

export const ProfileContextProvider: FC<
  ProfileContextProviderProps
> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await UserService.infoUser();
        setUser(userData.data.data);
      } catch (err) {
        console.log(
          'Not authorized or error fetching user',
          err,
        );
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <ProfileContext.Provider
      value={{ user, setUser, isLoading }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
