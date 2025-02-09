import { LoyaltyCard } from '../entities/loyaltyCard';
import { LoyaltyCardTransaction } from '../entities/loyaltyCardTransaction';
import { DomainEvent } from './domainEvent';

export interface LoyaltyPointsEarnedEvent extends DomainEvent {
  readonly type: 'LoyaltyPointsEarned';
  readonly payload: {
    readonly loyaltyCard: LoyaltyCard;
    readonly loyaltyCardTransaction: LoyaltyCardTransaction;
    readonly pointsEarned: number;
  };
}

export interface LoyaltyPointsEarnedFailedEvent extends DomainEvent {
  readonly type: 'LoyaltyPointsEarnedFailed';
  readonly payload: {
    readonly error: string;
  };
}

export interface LoyaltyCardTransactionCreatedEvent extends DomainEvent {
  readonly type: 'LoyaltyCardTransactionCreated';
  readonly payload: {
    readonly loyaltyCardTransaction: LoyaltyCardTransaction;
  };
}

export interface LoyaltyCardPointsBalanceUpdatedEvent extends DomainEvent {
  readonly type: 'LoyaltyCardPointsBalanceUpdated';
  readonly payload: {
    readonly loyaltyCard: LoyaltyCard;
  };
}
