import { AuthService } from '@shared/api';

export const useProfileLogin = () => {
  const login = () => {
    window.location.href = AuthService.getSsoLoginUrl();
  };
  return { mutate: login };
};
