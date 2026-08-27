import { api } from '@/lib/api';
import {
  ICreditPackage,
  IProcessPayment,
  IPaymentResponse,
} from '@/lib/types/payment';

export const paymentService = {
  getCreditPackages: (): Promise<ICreditPackage[]> => {
    return api.get<ICreditPackage[]>('/payment/packages');
  },
  processPayment: (
    checkoutData: IProcessPayment,
  ): Promise<IPaymentResponse> => {
    return api.post<IPaymentResponse>('/payment/process', checkoutData);
  },
};
