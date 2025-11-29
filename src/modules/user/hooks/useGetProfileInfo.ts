import { UserService } from '@api/services/userService.ts';
import { useQuery } from '@tanstack/react-query';

export const useGetProfileInfo = () => {
  const controller = useQuery({
    queryKey: ['user'],
    queryFn: () => UserService.infoUser(),
  });
  return controller;
};
