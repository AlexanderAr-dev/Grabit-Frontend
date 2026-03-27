import { useQuery } from '@tanstack/react-query';

import { UserService } from '@shared/api';

export const useGetProfileInfo = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => UserService.infoUser(),
  });
};
