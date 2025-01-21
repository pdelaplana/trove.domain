import { LoyaltyProgramRewardType } from './loyaltyProgram';

export interface CustomerReward {
  customerId: string;
  businessId: string;
  loyaltyProgramId: string;
  loyaltyCardId: string;
  claimedDate?: Date;
  expiryDate?: Date;
  redeemedDate?: Date;
  rewardType: LoyaltyProgramRewardType;
}

export interface CustomerRewardDiscountPercentage extends CustomerReward {
  discountPercentage: number;
}

export interface CustomerRewardDiscountFixedAmounnt extends CustomerReward {
  discountFixedAmount: number;
}

export interface CustomerRewardFreeProduct extends CustomerReward {
  freeProduct: string;
  freeProductQuantity: number;
}

export interface CustomerRewardPointsBonus extends CustomerReward {
  pointsBonus: number;
}
