import { CustomerEnrollmentAggregate } from '../aggregates/customerEnrollmentAggregate';
import { Business } from '../entities/business';
import { Customer } from '../entities/customer';
import { LoyaltyCard } from '../entities/loyaltyCard';
import { LoyaltyProgram } from '../entities/loyaltyProgram';
import { EventBus } from '../events/eventBus';
import { pipe, Result } from './helpers';
import { generateMembershipNumber } from './generateMembershipNumber';
import { CustomerEnrolledEvent } from '../events/customerEnrollmentEvents';

interface EnrollmentContext {
  readonly business: Business;
  readonly customer: Customer;
  readonly usedMembershipNumbers: string[];
  readonly loyaltyProgram: LoyaltyProgram;
}

const createLoyaltyCard = (
  context: EnrollmentContext,
  aggregate: CustomerEnrollmentAggregate
): Result<EnrollmentContext, CustomerEnrollmentAggregate> => {
  const { loyaltyProgram, customer, business, usedMembershipNumbers } = context;

  const membershipNumber =
    generateMembershipNumber(6, new Set(usedMembershipNumbers)) +
    '-' +
    business.id.slice(-4).toUpperCase(); // append last four digits of the businessId

  const loyaltyCard: Omit<LoyaltyCard, 'id'> = {
    membershipNumber: membershipNumber,
    businessId: business.id,
    businessName: business.name,
    customerId: customer.id,
    customerName: customer.firstName + ' ' + customer.lastName,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    loyaltyProgramId: loyaltyProgram.id,
    loyaltyProgramName: loyaltyProgram.name,
    tierId: '',
    tierName: '',
    tierPoints: 0,
    rewardPoints: 0,
    stamps: 0,
    membershipDate: new Date(),
  };

  return {
    success: true,
    context,
    aggregate: {
      ...aggregate,
      loyaltyCard,
    },
  };
};

export const enrollCustomerToLoyaltyProgram = async (
  initialContext: EnrollmentContext,
  eventBus: EventBus
): Promise<{
  success: boolean;
  error?: any;
  data?: {
    loyaltyCardId: string;
  };
}> => {
  const result = pipe(createLoyaltyCard)(initialContext, {
    loyaltyCard: {} as LoyaltyCard,
  } as CustomerEnrollmentAggregate);

  if (!result.success || !result.aggregate) {
    await eventBus.publish({
      type: 'CustomerEnrollmentFailed',
      payload: {
        error: result.error || new Error('Transaction processing failed'),
      },
    });
    return {
      success: false,
      error: result.error || new Error('Transaction processing failed'),
    };
  }

  const event = {
    type: 'CustomerEnrolled',
    payload: {
      loyaltyCard: result.aggregate.loyaltyCard,
    },
  } as CustomerEnrolledEvent;

  const handlerResult = (await eventBus.publish(event))?.get(
    'CustomerEnrolled'
  );
  const loyaltyCardId = handlerResult?.data.loyaltyCardId ?? '';

  return {
    success: true,
    data: {
      loyaltyCardId: loyaltyCardId,
    },
  };
};
