import { CustomerReward } from '../entities/customerReward';
import { LoyaltyCard } from '../entities/loyaltyCard';
import { LoyaltyCardTransaction } from '../entities/loyaltyCardTransaction';
import { DomainEvent } from './domainEvent';

export interface RewardClaimedEvent extends DomainEvent {
  readonly type: 'RewardClaimed';
  readonly payload: {
    readonly customerReward: Omit<CustomerReward, 'id'>;
    readonly loyaltyCard: LoyaltyCard;
    readonly loyaltyCardTransaction: Omit<LoyaltyCardTransaction, 'id'>;
  };
}

export interface RewardClaimFailedEvent extends DomainEvent {
  readonly type: 'RewardClaimFailed';
  readonly payload: {
    readonly error: string;
  };
}
