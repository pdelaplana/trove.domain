export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  businessId: string;
  businessName: string;
  businessEmail: string;
  loyaltyCardId: string;
  membershipNumber: string;
  loyaltyProgramId: string;
  loyaltyProgramName: string;
  loyaltyProgramTierId?: string;
  loyaltyProgramTierName?: string;

  transactionDate: Date;

  totalAmount: number;
  discountAmount: number;
  finalAmount: number;

  pointsEarned: number;
  pointsBonus: number;
  pointsRedeemed: number;
  pointsBalance: number;

  rewardsEarned: string[];
}
