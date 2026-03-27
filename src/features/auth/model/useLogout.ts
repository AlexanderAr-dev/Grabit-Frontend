import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import { AuthService } from '@shared/api';

export const useProfileLogout = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => navigate('/'),
  });
};
