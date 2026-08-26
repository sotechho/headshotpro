import { CreditPackage, type ICreditPackage } from '@/models';
import { BadRequestError, NotFoundError } from '@/utils/errors';
import mongoose from 'mongoose';

class PaymentService {
  async getCreditPackages(): Promise<ICreditPackage[]> {
    const credits = await CreditPackage.find({ isActive: true });
    return credits;
  }

  async getCreditPackageById(id: string): Promise<ICreditPackage> {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestError('Invalid package id');
    }

    const creditPackage = await CreditPackage.findOne({
      _id: id,
      isActive: true,
    });

    if (!creditPackage) {
      throw new NotFoundError('Credit package not found');
    }

    return creditPackage;
  }
}

export const paymentService = new PaymentService();
