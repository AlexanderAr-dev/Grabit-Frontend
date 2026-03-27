import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import { AuthService, UserService } from '@shared/api';
import { ProfileContext } from '@entities/user';

export const useProfileLogin = () => {
  const profile = useContext(ProfileContext);
  const navigate = useNavigate();

  return useMutation({
    mutationKey: ['user'],
    mutationFn: ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => AuthService.login(email, password),
    onSuccess: async () => {
      const user = await UserService.infoUser();
      profile?.setUser(user.data.data);
      navigate('/profile');
    },
    onError: error => {
      console.log(error);
      navigate('/login');
    },
  });
};
