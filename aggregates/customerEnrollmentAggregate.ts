import { LoyaltyCard } from '../entities/loyaltyCard';

export interface CustomerEnrollmentAggregate {
  readonly loyaltyCard: Omit<LoyaltyCard, 'id'>;
}
