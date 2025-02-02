import { LoyaltyProgramReward } from './loyaltyProgramReward';

export type LoyaltyProgramType = 'pointsPerSpend' | 'stampsPerPurchase';

export type LoyaltyProgramTierPerkType =
  | 'discount'
  | 'freeProduct'
  | 'pointsBonus';

export interface LoyaltyProgram {
  id: string;
  businessId: string;
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
  businessId: string;
  loyaltyProgramId: string;
  tierId?: string;
  points: number;
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
