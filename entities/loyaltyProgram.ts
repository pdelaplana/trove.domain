export type LoyaltyProgramType = 'pointsPerSpend' | 'stampsPerPurchase';

export type LoyaltyProgramRewardType =
  | 'discountPercentage'
  | 'discountFixedAmount'
  | 'freeProduct'
  | 'pointsBonus';

export type LoyaltyProgramTierPerkType =
  | 'discount'
  | 'freeProduct'
  | 'pointsBonus';

export interface LoyaltyProgram {
  id: string;
  uniqueCode: string;
  name: string;
  type: LoyaltyProgramType;
  description: string;
  pointsPerSpend?: number;
  stampsPerPurchase?: number;
  milestones: LoyaltyProgramMilestone[];
  tiers: LoyaltyProgramTier[];
}

export interface LoyaltyProgramMilestone {
  id: string;
  tierId?: string;
  points: number;
  expiryInDays?: number;
  reward: LoyaltyProgramReward;
}

export interface LoyaltyProgramTier {
  id: string;
  name: string;
  pointsThreshold: number;
  perks: LoyaltyProgramTierPerk[];
}

export interface LoyaltyProgramTierPerk {
  perkType: 'discount' | 'freeProduct' | 'pointsBonus';
  discountPercentage?: number;
  freeProduct?: string;
  pointsBonus?: number;
}

export interface LoyaltyProgramReward {
  name: string;
  rewardType: LoyaltyProgramRewardType;
  discountPercentage?: number;
  discountFixedAmount?: number;
  freeProduct?: string;
  freeProductQuantity?: number;
  pointsBonus?: number;
}

export const useLoyaltyProgramValidationRules = () => ({
  name: {
    required: 'Loyalty program name is required',
    minLength: {
      value: 3,
      message: 'Loyalty program name must be at least 3 characters long',
    },
    maxLength: {
      value: 50,
      message: 'Loyalty program name must be less than 50 characters',
    },
  },
  description: {
    maxLength: {
      value: 500,
      message: 'Description must be less than 500 characters',
    },
  },
  uniqueCode: {
    required: 'Unique code is required',
  },
  pointsPerSpend: {
    required: 'Points per spend is required',
    min: {
      value: 1,
      message: 'Points per spend must be at least 1',
    },
  },
  stampsPerVisit: {
    required: 'Stamps per visit is required',
    min: {
      value: 1,
      message: 'Stamps per visit must be at least 1',
    },
  },
});

export const useLoyaltyProgramTierValidationRules = () => ({
  name: {
    required: 'Loyalty program tier name is required',
    minLength: {
      value: 3,
      message: 'Loyalty program tier name must be at least 3 characters long',
    },
    maxLength: {
      value: 25,
      message: 'Loyalty program tier name must be less than 25 characters',
    },
  },
  pointsThreshold: {
    required: 'Points threshold is required',
    min: {
      value: 1,
      message: 'Points threshold must be at least 1',
    },
  },
});

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
