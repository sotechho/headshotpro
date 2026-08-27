import { api } from '@/lib/api';
import { CreditPackage } from '@/lib/types/payment';

export const paymentService = {
  getCreditPackages: (): Promise<CreditPackage[]> => {
    return api.get<CreditPackage[]>('/payment/packages');
  },
};
