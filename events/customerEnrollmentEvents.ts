import { Customer } from '../entities/customer';
import { LoyaltyCard } from '../entities/loyaltyCard';
import { DomainEvent } from './domainEvent';

export interface CustomerEnrolledEvent extends DomainEvent {
  readonly type: 'CustomerEnrolled';
  readonly payload: {
    readonly customer: Omit<Customer, 'id'>;
    readonly loyaltyCard: Omit<LoyaltyCard, 'id'>;
  };
}

export interface CustomerEnrollmentFailedEvent extends DomainEvent {
  readonly type: 'CustomerEnrollmentFailed';
  readonly payload: {
    readonly error: any;
  };
}
