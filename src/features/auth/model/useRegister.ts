import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import { AuthService } from '@shared/api';

export const useProfileRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationKey: ['user'],
    mutationFn: ({
      email,
      password,
      login,
    }: {
      email: string;
      login: string;
      password: string;
    }) => AuthService.register(login, email, password),
    onSuccess: () => navigate('/login'),
    onError: error => {
      console.log(error);
      navigate('/register');
    },
  });
};
