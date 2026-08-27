import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/lib/services';

export function useGetCreditPackages() {
  return useQuery({
    queryKey: ['credit-packages'],
    queryFn: () => paymentService.getCreditPackages(),
    retry: 2,
  });
}
