import { LoyaltyProgramRewardType } from './loyaltyProgramReward';

export interface CustomerReward {
  id: string;
  customerId: string;
  businessId: string;
  loyaltyProgramId: string;
  loyaltyCardId: string;
  loyaltyProgramMilestoneId: string;
  claimedDate?: Date;
  expiryDate?: Date;
  redeemedDate?: Date | null;
  rewardType: LoyaltyProgramRewardType;
  name: string;
  description?: string;
  imageUrl?: string;
  termsAndConditions?: string;
  usageConditions?: string;
}

export interface CustomerRewardDiscountPercentage extends CustomerReward {
  discountPercentage: number;
}

export interface CustomerRewardDiscountFixedAmount extends CustomerReward {
  discountFixedAmount: number;
}

export interface CustomerRewardFreeProduct extends CustomerReward {
  freeProduct: string;
  freeProductQuantity: number;
}

export interface CustomerRewardPointsBonus extends CustomerReward {
  pointsBonus: number;
}

export interface CustomerRewardPromoCode extends CustomerReward {
  promoCode: string;
}
