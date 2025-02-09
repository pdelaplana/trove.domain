import { LoyaltyCard } from '../entities/loyaltyCard';
import { LoyaltyCardTransaction } from '../entities/loyaltyCardTransaction';

export interface PointsEarnedAggregate {
  readonly transaction: Omit<LoyaltyCardTransaction, 'id'>;
  readonly loyaltyCard: LoyaltyCard;
}
