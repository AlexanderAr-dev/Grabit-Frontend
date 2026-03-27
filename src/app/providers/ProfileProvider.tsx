import { FC, ReactNode, useEffect, useState } from 'react';

import { UserService } from '@shared/api';
import { IUserInfo } from '@shared/types';
import { ProfileContext } from '@entities/user';

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: FC<ProfileProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await UserService.infoUser();
        setUser(userData.data.data);
      } catch (err) {
        console.log('Not authorized or error fetching user', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <ProfileContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </ProfileContext.Provider>
  );
};
