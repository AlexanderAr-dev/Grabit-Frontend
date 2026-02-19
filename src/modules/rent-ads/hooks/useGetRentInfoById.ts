import { rentService } from '@api';
import { useQuery } from '@tanstack/react-query';

export function useGetRentInfoById(rentId: number) {
  const controller = useQuery({
    queryKey: ['rentAd', rentId],
    queryFn: async () => {
      const response =
        await rentService.getRentInfo(rentId);
      return response.data.data;
    },
    enabled: !!rentId,
  });

  return controller;
}
