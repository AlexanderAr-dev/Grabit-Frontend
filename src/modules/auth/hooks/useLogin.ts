import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService, UserService } from '@api';
import { useMutation } from '@tanstack/react-query';
import { ProfileContext } from '../../../app/context/ProfileContext.ts';

export const useProfileLogin = () => {
  const profile = useContext(ProfileContext);
  const navigate = useNavigate();
  const controller = useMutation({
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

  return controller;
};
