import { AuthService } from '@shared/api';

export const useProfileRegister = () => {
  const register = () => {
    window.location.href = AuthService.getSsoLoginUrl();
  };
  return { mutate: register };
};
