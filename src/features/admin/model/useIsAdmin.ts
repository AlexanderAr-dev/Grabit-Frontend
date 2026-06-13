import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@features/auth';

import { AdminService } from '../api/adminService';

export function useIsAdmin(): boolean {
  const { isAuthenticated } = useAuth();
  const { data } = useQuery({
    queryKey: ['admin', 'isAdmin'],
    queryFn: AdminService.getStats,
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  return !!data;
}
