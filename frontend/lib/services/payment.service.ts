import { api } from '@/lib/api';
import { ICreditPackage } from '@/lib/types/payment';

export const paymentService = {
  getCreditPackages: (): Promise<ICreditPackage[]> => {
    return api.get<ICreditPackage[]>('/payment/packages');
  },
};
