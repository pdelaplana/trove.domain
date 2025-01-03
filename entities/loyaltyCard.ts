export interface LoyaltyCard {
  id: string;
  membershipNumber: string;
  customerId: string;
  businessId: string;
  loyaltyProgramId: string;
  tierId?: string;
  points: number;
  stamps: number;
  membershipDate: Date;
  expiryDate?: Date;
}
