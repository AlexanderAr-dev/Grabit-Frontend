import { useQuery } from '@tanstack/react-query';

import { rentService } from '@shared/api';

export function useGetRentInfoById(rentId: number) {
  return useQuery({
    queryKey: ['rentAd', rentId],
    queryFn: async () => {
      const response = await rentService.getRentInfo(rentId);
      return response.data.data;
    },
    enabled: !!rentId,
  });
}
