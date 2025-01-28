export interface LoyaltyCard {
  id: string;
  membershipNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  businessId: string;
  businessName: string;
  loyaltyProgramId: string;
  loyaltyProgramName: string;
  tierId?: string;
  tierName?: string;
  points: number;
  stamps: number;
  membershipDate: Date;
  expiryDate?: Date;
  imageUrl?: string;
}
