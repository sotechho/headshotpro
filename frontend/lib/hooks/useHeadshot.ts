import { useMutation, useQuery } from '@tanstack/react-query';
import { headshotService } from '../services/headshot.service';

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
