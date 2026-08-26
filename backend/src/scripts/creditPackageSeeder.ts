import connectDB from '@/database/connection';
import { CreditPackage } from '@/models';
import mongoose from 'mongoose';
import logger from '@/utils/logger';

const creditPackages = [
  {
    name: 'Starter',
    credits: 10,
    price: 9.99,
    description: 'A starter package for occasional headshots.',
    bonus: 0,
    popular: false,
    isActive: true,
  },
  {
    name: 'Professional',
    credits: 20,
    price: 19.99,
    description: 'More credits for regular professional headshots.',
    bonus: 5,
    popular: true,
    isActive: true,
  },
  {
    name: 'Premium',
    credits: 30,
    price: 39.99,
    description: 'Best value for high-volume headshot generation.',
    bonus: 10,
    popular: false,
    isActive: true,
  },
];

export async function seed() {
  try {
    await connectDB();

    await Promise.all(
      creditPackages.map((creditPackage) =>
        CreditPackage.updateOne(
          { name: creditPackage.name },
          { $set: creditPackage },
          { upsert: true, runValidators: true },
        ),
      ),
    );

    logger.info(`Seeded ${creditPackages.length} credit packages`);
  } catch (error) {
    logger.error('Failed to seed credit packages:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

if (import.meta.main) {
  seed().catch(() => {
    process.exitCode = 1;
  });
}
