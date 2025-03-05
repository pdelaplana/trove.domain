import { RewardRedemptionAggregate } from '../aggregates/rewardRedemptionAggregate';
import { Business } from '../entities/business';
import { Customer } from '../entities/customer';
import {
  CustomerReward,
  CustomerRewardDiscountFixedAmount,
  CustomerRewardDiscountPercentage,
  CustomerRewardFreeProduct,
  CustomerRewardPointsBonus,
} from '../entities/customerReward';
import { LoyaltyCard } from '../entities/loyaltyCard';
import {
  LoyaltyCardTransaction,
  LoyaltyCardTransactionType,
} from '../entities/loyaltyCardTransaction';
import { EventBus } from '../events/eventBus';
import { RewardRedemptionEvent } from '../events/rewardEvents';
import { pipe, PipeFunction, Result } from './helpers';

interface OperationContext {
  readonly purchaseAmount: number;
  readonly customerReward: CustomerReward;
  readonly customer: Customer;
  readonly loyaltyCard: LoyaltyCard;
  readonly business: Business;
  readonly transactionType: LoyaltyCardTransactionType;
}

const initializeTransaction: PipeFunction<
  OperationContext,
  RewardRedemptionAggregate
> = (
  context: OperationContext,
  aggregate: RewardRedemptionAggregate
): Result<OperationContext, RewardRedemptionAggregate> => {
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
      currency: context.business.currency,
      purchaseAmount: context.purchaseAmount,
      discountAmount: 0,
      finalAmount: context.purchaseAmount,
      earnedPoints: 0,
      bonusPoints: 0,
      redeemedPoints: 0,
      totalPoints: 0,
      freeProducts: [],
    };

    const aggregate = {
      loyaltyCard: { ...context.loyaltyCard },
      transaction: { ...transaction },
      reward: { ...context.customerReward },
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

const checkIfRewardAlreadyRedeemed = (
  context: OperationContext,
  aggregate: RewardRedemptionAggregate
): Result<OperationContext, RewardRedemptionAggregate> => {
  const { reward } = aggregate;

  if (reward.redeemedDate) {
    return {
      success: false,
      context,
      aggregate,
      error: new Error('Reward has already been redeemed'),
    };
  }

  return {
    success: true,
    context,
    aggregate: {
      ...aggregate,
      reward,
    },
  };
};

const applyReward = (
  context: OperationContext,
  aggregate: RewardRedemptionAggregate
): Result<OperationContext, RewardRedemptionAggregate> => {
  const { reward, transaction, loyaltyCard } = aggregate;

  switch (reward.rewardType) {
    case 'discountFixedAmount':
      transaction.discountAmount = (
        reward as CustomerRewardDiscountFixedAmount
      ).discountFixedAmount;
      transaction.finalAmount =
        context.purchaseAmount - transaction.discountAmount;
      break;
    case 'discountPercentage':
      transaction.discountAmount =
        context.purchaseAmount *
        ((reward as CustomerRewardDiscountPercentage).discountPercentage / 100);
      transaction.finalAmount =
        context.purchaseAmount - transaction.discountAmount;
      break;
    case 'pointsBonus':
      transaction.bonusPoints = (
        reward as CustomerRewardPointsBonus
      ).pointsBonus;
      transaction.totalPoints =
        transaction.earnedPoints + transaction.bonusPoints;
      loyaltyCard.rewardPoints += transaction.totalPoints;
      loyaltyCard.tierPoints += transaction.totalPoints;
      break;
    case 'promoCode':
      // Implement the logic to apply a promo code reward
      break;
    case 'freeProduct':
      transaction.freeProducts = [
        (reward as CustomerRewardFreeProduct).freeProduct,
      ];
      break;
    default:
      break;
  }
  return {
    success: true,
    context,
    aggregate: {
      ...aggregate,
      transaction,
    },
  };
};

const redeemReward = (
  context: OperationContext,
  aggregate: RewardRedemptionAggregate
): Result<OperationContext, RewardRedemptionAggregate> => {
  const { reward } = aggregate;

  reward.redeemedDate = new Date();

  return {
    success: true,
    context,
    aggregate: {
      ...aggregate,
      reward,
    },
  };
};

export const processRedeemReward = async (
  initialContext: OperationContext,
  eventBus: EventBus
): Promise<{
  success: boolean;
  error?: any;
  data?: {
    transactionId: string;
  };
}> => {
  // Implement the logic to redeem a reward
  console.log('Redeeming reward', { initialContext });

  const result = pipe(
    initializeTransaction,
    checkIfRewardAlreadyRedeemed,
    applyReward,
    redeemReward
  )(initialContext, {
    loyaltyCard: initialContext.loyaltyCard,
    transaction: {} as LoyaltyCardTransaction,
    reward: {} as CustomerReward,
  } as RewardRedemptionAggregate);

  if (!result.success || !result.context) {
    await eventBus.publish({
      type: 'RewardRedemptionFailed',
      payload: {
        error: result.error?.message ?? 'Transaction processing failed',
      },
    });

    return {
      success: false,
      error:
        result.error?.message || new Error('Transaction processing failed'),
    };
  }

  const event = {
    type: 'RewardRedemption',
    payload: {
      customerReward: result.aggregate.reward,
      loyaltyCard: result.aggregate.loyaltyCard,
      loyaltyCardTransaction: result.aggregate.transaction,
    },
  } as RewardRedemptionEvent;

  const mapResult = await eventBus.publish(event);

  const transactionId = mapResult.get('RewardRedemption')?.data.transactionId;

  return {
    success: true,
    data: {
      transactionId,
    },
  };
};
