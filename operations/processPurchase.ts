import { Business } from '../entities/business';
import { Customer } from '../entities/customer';
import { LoyaltyCard } from '../entities/loyaltyCard';
import {
  LoyaltyCardTransaction,
  LoyaltyCardTransactionType,
} from '../entities/loyaltyCardTransaction';
import {
  LoyaltyProgram,
  LoyaltyProgramTier,
  LoyaltyProgramTierPerk,
} from '../entities/loyaltyProgram';
import { pipe, PipeFunction, Result } from './helpers';
import { LoyaltyPointsEarnedEvent } from '../events/earnEvents';
import { DomainEvent } from '../events/domainEvent';
import { EventBus } from '../events/eventBus';
import { PointsEarnedAggregate } from '../aggregates/pointsEarnedAggregate';

interface TransactionContext {
  readonly loyaltyProgram: LoyaltyProgram;
  readonly loyaltyCard: LoyaltyCard;
  readonly business: Business;
  readonly customer: Customer;
  readonly amount: number;
  readonly transactionType: LoyaltyCardTransactionType;
  readonly events?: DomainEvent[];
}

// Pure functions for calculations
const calculateEarnedPoints = (
  amount: number,
  program: LoyaltyProgram
): number => {
  if (program.type === 'pointsPerSpend') {
    return amount * (program.pointsPerSpend ?? 1);
  }
  return 0; // Handle other cases
};

const calculatePerkBenefits = (
  amount: number,
  perk: LoyaltyProgramTierPerk
): Partial<LoyaltyCardTransaction> => {
  let discountAmount = 0;
  switch (perk.perkType) {
    case 'discount':
      discountAmount = amount * ((perk.discountPercentage ?? 0) / 100);
      return {
        discountAmount,
        finalAmount: amount - discountAmount,
      };
    case 'pointsBonus':
      return {
        bonusPoints: perk.pointsBonus ?? 0,
      };
    case 'freeProduct':
      return {
        rewardsEarned: perk.freeProduct ? [perk.freeProduct] : [],
      };
    default:
      return {};
  }
};

// Core business logic functions
const initializeTransaction: PipeFunction<
  TransactionContext,
  PointsEarnedAggregate
> = (
  context: TransactionContext,
  aggregate: PointsEarnedAggregate
): Result<TransactionContext, PointsEarnedAggregate> => {
  try {
    const transaction: Omit<LoyaltyCardTransaction, 'id'> = {
      businessId: context.business.id,
      businessName: context.business.name,
      businessEmail: context.business.email,
      loyaltyCardId: context.loyaltyCard.id,
      loyaltyProgramId: context.loyaltyCard.loyaltyProgramId,
      loyaltyProgramName: context.loyaltyCard.loyaltyProgramName,
      loyaltyProgramTierId: context.loyaltyCard.tierId,
      loyaltyProgramTierName: context.loyaltyCard.tierName,
      customerId: context.customer.id,
      customerName: `${context.customer.firstName} ${context.customer.lastName}`,
      customerEmail: context.customer.email,
      membershipNumber: context.loyaltyCard.membershipNumber,
      transactionDate: new Date(),
      transactionType: context.transactionType,
      purchaseAmount: context.amount,
      discountAmount: 0,
      finalAmount: 0,
      earnedPoints: 0,
      bonusPoints: 0,
      redeemedPoints: 0,
      totalPoints: 0,
      rewardsEarned: [],
    };

    const aggregate = {
      loyaltyCard: { ...context.loyaltyCard },
      transaction: { ...transaction },
    };

    return {
      success: true,
      context,
      aggregate,
    };
  } catch (error) {
    return { success: false, context, aggregate, error: error as Error };
  }
};

const calculateRewards = (
  context: TransactionContext,
  aggregate: PointsEarnedAggregate
): Result<TransactionContext, PointsEarnedAggregate> => {
  try {
    const { loyaltyProgram, amount } = context;

    const { transaction } = aggregate;

    transaction.earnedPoints = calculateEarnedPoints(amount, loyaltyProgram);

    const tier = loyaltyProgram.tiers.find(
      (t: LoyaltyProgramTier) => t.id === context.loyaltyCard.tierId
    );

    if (tier) {
      const perkBenefits = tier.perks.reduce(
        (acc, perk) => ({ ...acc, ...calculatePerkBenefits(amount, perk) }),
        {}
      );

      Object.assign(transaction, perkBenefits);
      transaction.totalPoints =
        (transaction.earnedPoints as number) +
        ((transaction.bonusPoints as number) || 0);
    }

    return {
      success: true,
      context,
      aggregate: {
        ...aggregate,
        transaction,
      },
    };
  } catch (error) {
    return { success: false, context, aggregate, error: error as Error };
  }
};

const evaluateTierProgression = (
  context: TransactionContext,
  aggregate: PointsEarnedAggregate
): Result<TransactionContext, PointsEarnedAggregate> => {
  try {
    const { loyaltyProgram } = context;

    //const event = extractEvent('LoyaltyPointsEarned', context.events);

    const { loyaltyCard, transaction } = aggregate;

    const currentPoints =
      loyaltyCard.tierPoints + (transaction.totalPoints || 0);

    const nextTier = loyaltyProgram.tiers
      .filter((tier) => tier.pointsThreshold <= currentPoints)
      .sort((a, b) => b.pointsThreshold - a.pointsThreshold)[0];

    if (nextTier && loyaltyCard.tierId !== nextTier.id) {
      return {
        success: true,
        context,
        aggregate: {
          ...aggregate,
          loyaltyCard: {
            ...loyaltyCard,
            tierId: nextTier.id,
            tierPoints: 0,
          },
        },
      };
    }
    return { success: true, context, aggregate };
  } catch (error) {
    return { success: false, context, aggregate, error: error as Error };
  }
};

const updateCardBalance = (
  context: TransactionContext,
  aggregate: PointsEarnedAggregate
): Result<TransactionContext, PointsEarnedAggregate> => {
  try {
    const { loyaltyCard, transaction } = aggregate;

    const updatedCard = {
      ...loyaltyCard,
      rewardPoints: loyaltyCard.rewardPoints + transaction.totalPoints,
      tierPoints: loyaltyCard.tierPoints + transaction.totalPoints,
    };

    return {
      success: true,
      context,
      aggregate: {
        ...aggregate,
        loyaltyCard: updatedCard,
      },
    };
  } catch (error) {
    return { success: false, context, aggregate, error: error as Error };
  }
};

// Main transaction handler
export const processPurchase = async (
  initialContext: TransactionContext,
  eventBus: EventBus
): Promise<{
  success: boolean;
  error?: any;
  data?: {
    transactionId: string;
  };
}> => {
  const result = pipe(
    initializeTransaction,
    calculateRewards,
    evaluateTierProgression,
    updateCardBalance
  )(initialContext, {
    loyaltyCard: initialContext.loyaltyCard,
    transaction: {} as LoyaltyCardTransaction,
  } as PointsEarnedAggregate);

  if (!result.success || !result.context) {
    eventBus.publish({
      type: 'LoyaltyPointsEarnFailed',
      payload: {
        error: result.error?.message ?? 'Transaction processing failed',
      },
    });
    return {
      success: false,
      error: result.error || new Error('Transaction processing failed'),
    };
  }

  const event = {
    type: 'LoyaltyPointsEarned',
    payload: {
      loyaltyCard: result.aggregate.loyaltyCard,
      loyaltyCardTransaction: result.aggregate.transaction,
    },
  } as LoyaltyPointsEarnedEvent;

  const mapResult = await eventBus.publish(event);

  //const results = await eventBus.publishAll(result.context.events ?? []);

  //const handlerResult = getHandlerResult('LoyaltyPointsEarned', results);

  //handlerResult.data.transactionId;
  const transactionId = mapResult.get('LoyaltyPointsEarned')?.data
    .transactionId;

  return {
    success: true,
    data: {
      transactionId,
    },
  };
};
