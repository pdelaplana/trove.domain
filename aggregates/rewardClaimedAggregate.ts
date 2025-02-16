import { CustomerReward } from '../entities/customerReward';
import { LoyaltyCard } from '../entities/loyaltyCard';
import { LoyaltyCardTransaction } from '../entities/loyaltyCardTransaction';

export interface RewardClaimedAggregate {
  readonly transaction: Omit<LoyaltyCardTransaction, 'id'>;
  readonly reward: Omit<CustomerReward, 'id'>;
  readonly loyaltyCard: LoyaltyCard;
}
