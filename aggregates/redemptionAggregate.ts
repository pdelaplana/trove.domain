import { CustomerReward, LoyaltyCard, LoyaltyCardTransaction } from '..';

export interface RedemptionAggregate {
  readonly transaction: Omit<LoyaltyCardTransaction, 'id'>;
  readonly reward: Omit<CustomerReward, 'id'>;
  readonly loyaltyCard: LoyaltyCard;
}
