import { useNavigate } from 'react-router-dom';
import { AuthService } from '@api';
import { useMutation } from '@tanstack/react-query';

export const useProfileRegister = () => {
  const navigate = useNavigate();
  const controller = useMutation({
    mutationKey: ['user'],
    mutationFn: ({
      email,
      password,
    }: {
      email: string;
      login: string;
      password: string;
    }) => AuthService.register(email, password),
    onSuccess: () => {
      navigate('/login');
    },
    onError: error => {
      console.log(error);
      navigate('/register');
    },
  });

  return controller;
};
