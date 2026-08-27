export interface CreditPackage {
  _id: string;
  _v: number;
  name: string;
  credits: number;
  price: number;
  description?: string;
  isActive: boolean;
  stripePriceId?: string;
  bonus?: number; // Extra credits for this package
  popular?: boolean; // Mark as popular for UI
  createdAt: Date;
  updatedAt: Date;
}
