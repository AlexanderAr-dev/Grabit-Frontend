import { useAuth } from './AuthContext';

export const useProfileLogout = () => {
  const { logout } = useAuth();
  return { mutate: logout };
};
