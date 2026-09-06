import { useMutation, useQuery } from '@tanstack/react-query';
import { headshotService } from '../services/headshot.service';
import { HeadshotStatus } from '../types/headshot';

export function useGetAvailableStyles() {
  return useQuery({
    queryKey: ['headshot-styles'],
    queryFn: () => headshotService.getAvailableStyles(),
    retry: 2,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useGenerateHeadshots() {
  return useMutation({
    mutationFn: (formData: FormData) =>
      headshotService.generateHeadshots(formData),
  });
}

export function useGetHeadshots(limit: number = 10, offset: number = 0) {
  return useQuery({
    queryKey: ['headshots'],
    queryFn: () => headshotService.getHeadshots(limit, offset),
    refetchInterval(query) {
      const data = query.state.data;
      const hasProcessingHeadshot = data?.headshots.some(
        (d) => d.status === HeadshotStatus.PROCESSING,
      );
      return hasProcessingHeadshot ? 5000 : false;
    },
  });
}
