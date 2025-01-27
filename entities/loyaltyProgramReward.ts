export type LoyaltyProgramRewardType =
  | 'discountPercentage'
  | 'discountFixedAmount'
  | 'freeProduct'
  | 'pointsBonus'
  | 'promoCode'
  | 'cashback';

export interface LoyaltyProgramReward {
  name: string;
  rewardType: LoyaltyProgramRewardType;
  description?: string;
  expiryInDays?: number;
  validUntilDate?: Date;
  imageUrl?: string;
  termsAndConditions?: string;
  usageConditions?: string;
}

export interface LoyaltyProgramRewardDiscountFixedAmount
  extends LoyaltyProgramReward {
  discountFixedAmount?: number;
}

export interface LoyaltyProgramRewardPointsBonus extends LoyaltyProgramReward {
  pointsBonus: number;
}

export interface LoyaltyProgramRewardDiscountPercentage
  extends LoyaltyProgramReward {
  discountPercentage: number;
}

export interface LoyaltyProgramRewardFreeProduct extends LoyaltyProgramReward {
  freeProduct: string;
  freeProductQuantity: number;
}

export interface LoyaltyProgramRewardFreeProduct extends LoyaltyProgramReward {
  freeProduct: string;
  freeProductQuantity: number;
}

export interface LoyaltyProgramRewardPromoCode extends LoyaltyProgramReward {
  promoCode: string;
}

export const useLoyaltyProgramMilestoneValidationRules = () => ({
  points: {
    required: 'Points is required',
    min: {
      value: 1,
      message: 'Points must be at least 1',
    },
  },
  expiryInDays: {
    min: {
      value: 1,
      message: 'Expiry in days must be at least 1',
    },
  },
  reward: {
    name: {
      required: 'Reward is required',
    },
    rewardType: {
      required: 'Reward type is required',
    },
    discountPercentage: {
      min: {
        value: 1,
        message: 'Discount percentage must be at least 1',
      },
      max: {
        value: 100,
        message: 'Discount percentage must be at most 100',
      },
    },
    discountFixedAmount: {
      min: {
        value: 1,
        message: 'Discount fixed amount must be at least 1',
      },
    },
    freeProduct: {
      required: 'Free product is required',
    },
    freeProductQuantity: {
      min: {
        value: 1,
        message: 'Free product quantity must be at least 1',
      },
    },
    pointsBonus: {
      min: {
        value: 1,
        message: 'Bonus points must be at least 1',
      },
    },
  },
});
