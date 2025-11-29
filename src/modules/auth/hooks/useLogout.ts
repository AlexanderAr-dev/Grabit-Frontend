import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@api';

export const useProfileLogout = () => {
  const navigate = useNavigate();
  const controller = useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => navigate('/'),
  });
  return controller;
};