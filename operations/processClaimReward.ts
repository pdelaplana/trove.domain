import { Business } from '../entities/business';
import { Customer } from '../entities/customer';
import {
  CustomerReward,
  CustomerRewardDiscountFixedAmount,
  CustomerRewardDiscountPercentage,
  CustomerRewardFreeProduct,
  CustomerRewardPointsBonus,
  CustomerRewardPromoCode,
} from '../entities/customerReward';
import { LoyaltyCard } from '../entities/loyaltyCard';
import {
  LoyaltyCardTransactionType,
  LoyaltyCardTransaction,
} from '../entities/loyaltyCardTransaction';
import { LoyaltyProgramMilestone } from '../entities/loyaltyProgram';
import {
  LoyaltyProgramRewardDiscountFixedAmount,
  LoyaltyProgramRewardDiscountPercentage,
  LoyaltyProgramRewardFreeProduct,
  LoyaltyProgramRewardPointsBonus,
  LoyaltyProgramRewardPromoCode,
} from '../entities/loyaltyProgramReward';
import { pipe, Result } from './helpers';
import { RewardClaimedEvent } from '../events/rewardEvents';
import { EventBus } from '../events/eventBus';
import { RedemptionAggregate } from '../aggregates/redemptionAggregate';
import { RewardClaimedAggregate } from '../aggregates/rewardClaimedAggregate';

interface TransactionContext {
  readonly loyaltyCard: LoyaltyCard;
  readonly business: Business;
  readonly customer: Customer;
  readonly loyaltyProgramMilestone: LoyaltyProgramMilestone;
  readonly customerRewards: CustomerReward[];
  readonly transactionType: LoyaltyCardTransactionType;
}

const initializeTransaction = (
  context: TransactionContext,
  aggregate: RewardClaimedAggregate
): Result<TransactionContext, RewardClaimedAggregate> => {
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
      purchaseAmount: 0,
      discountAmount: 0,
      finalAmount: 0,
      earnedPoints: 0,
      bonusPoints: 0,
      redeemedPoints: 0,
      totalPoints: 0,
      rewardsEarned: [],
    };

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

const checkIfRewardHasNotExpired = (
  context: TransactionContext,
  aggregate: RewardClaimedAggregate
): Result<TransactionContext, RewardClaimedAggregate> => {
  const { loyaltyProgramMilestone } = context;

  if (
    loyaltyProgramMilestone.reward.validUntilDate &&
    loyaltyProgramMilestone.reward.validUntilDate < new Date()
  ) {
    return {
      success: false,
      context,
      aggregate,
      error: new Error('Reward has expired.'),
    };
  }

  return { success: true, context, aggregate };
};

const checkIfRewardAlreadyClaimed = (
  context: TransactionContext,
  aggregate: RewardClaimedAggregate
): Result<TransactionContext, RewardClaimedAggregate> => {
  const { loyaltyProgramMilestone, customerRewards } = context;

  if (
    customerRewards &&
    customerRewards.some(
      (reward) =>
        reward.loyaltyProgramMilestoneId === loyaltyProgramMilestone.id
    )
  ) {
    return {
      success: false,
      context,
      aggregate,
      error: new Error('Reward already claimed.'),
    };
  }

  return { success: true, context, aggregate };
};

const checkPointsBalance = (
  context: TransactionContext,
  aggregate: RewardClaimedAggregate
): Result<TransactionContext, RewardClaimedAggregate> => {
  const { loyaltyCard, loyaltyProgramMilestone } = context;

  if (loyaltyCard.rewardPoints < loyaltyProgramMilestone.points) {
    return {
      success: false,
      context,
      aggregate,
      error: new Error('Insufficient points balance.'),
    };
  }

  return { success: true, context, aggregate };
};

const redeemPoints = (
  context: TransactionContext,
  aggregate: RewardClaimedAggregate
): Result<TransactionContext, RewardClaimedAggregate> => {
  try {
    const { loyaltyProgramMilestone } = context;
    const { transaction } = aggregate;

    transaction.transactionType = 'redeem';
    transaction.redeemedPoints = loyaltyProgramMilestone.points;

    transaction.totalPoints = -transaction.redeemedPoints;

    return {
      success: true,
      context,
      aggregate: {
        ...aggregate,
        transaction,
      },
    };
  } catch (error) {
    return {
      success: false,
      context,
      aggregate,
      error: error as Error,
    };
  }
};

const updateCardBalance = (
  context: TransactionContext,
  aggregate: RewardClaimedAggregate
): Result<TransactionContext, RewardClaimedAggregate> => {
  const { transaction, loyaltyCard } = aggregate;

  loyaltyCard.rewardPoints =
    loyaltyCard.rewardPoints - transaction.redeemedPoints;

  return {
    success: true,
    context,
    aggregate: {
      ...aggregate,
      loyaltyCard,
    },
  };
};

const createCustomerReward = (
  context: TransactionContext,
  aggregate: RewardClaimedAggregate
): Result<TransactionContext, RewardClaimedAggregate> => {
  const { customer, business, loyaltyProgramMilestone } = context;
  const { loyaltyCard } = aggregate;

  const expirydate = new Date(
    Date.now() +
      (loyaltyProgramMilestone.reward.expiryInDays ?? 0) * 24 * 60 * 60 * 1000
  );

  let customerReward: Omit<CustomerReward, 'id'> = {
    customerId: customer.id,
    businessId: business.id,
    loyaltyCardId: loyaltyCard.id,
    loyaltyProgramId: loyaltyCard.loyaltyProgramId,
    loyaltyProgramMilestoneId: loyaltyProgramMilestone.id,
    rewardType: loyaltyProgramMilestone.reward.rewardType,
    name: loyaltyProgramMilestone.reward.name,
    description: loyaltyProgramMilestone.reward.description,
    imageUrl: loyaltyProgramMilestone.reward.imageUrl,
    termsAndConditions: loyaltyProgramMilestone.reward.termsAndConditions,
    expiryDate: loyaltyProgramMilestone.reward.validUntilDate
      ? loyaltyProgramMilestone.reward.validUntilDate > expirydate
        ? expirydate
        : loyaltyProgramMilestone.reward.validUntilDate
      : expirydate,
    claimedDate: new Date(),
  };

  switch (loyaltyProgramMilestone.reward.rewardType) {
    case 'discountFixedAmount':
      customerReward = {
        ...customerReward,
        discountFixedAmount:
          (
            loyaltyProgramMilestone.reward as LoyaltyProgramRewardDiscountFixedAmount
          ).discountFixedAmount ?? 0,
      } as CustomerRewardDiscountFixedAmount;
      break;
    case 'discountPercentage':
      customerReward = {
        ...customerReward,
        discountPercentage:
          (
            loyaltyProgramMilestone.reward as LoyaltyProgramRewardDiscountPercentage
          ).discountPercentage ?? 0,
      } as CustomerRewardDiscountPercentage;
      break;
    case 'freeProduct':
      customerReward = {
        ...customerReward,
        freeProduct: (
          loyaltyProgramMilestone.reward as LoyaltyProgramRewardFreeProduct
        ).freeProduct,
        freeProductQuantity: (
          loyaltyProgramMilestone.reward as LoyaltyProgramRewardFreeProduct
        ).freeProductQuantity,
      } as CustomerRewardFreeProduct;
      break;
    case 'pointsBonus':
      customerReward = {
        ...customerReward,
        pointsBonus: (
          loyaltyProgramMilestone.reward as LoyaltyProgramRewardPointsBonus
        ).pointsBonus,
      } as CustomerRewardPointsBonus;
      break;
    case 'promoCode':
      customerReward = {
        ...customerReward,
        promoCode: (
          loyaltyProgramMilestone.reward as LoyaltyProgramRewardPromoCode
        ).promoCode,
      } as CustomerRewardPromoCode;
      break;
  }

  return {
    success: true,
    context,
    aggregate: {
      ...aggregate,
      reward: customerReward,
    },
  };
};

const processClaimReward = async (
  initialContext: TransactionContext,
  eventBus: EventBus
): Promise<{
  success: boolean;
  error?: any;
  data?: {
    rewardId: string;
    transactionId: string;
  };
}> => {
  const result = pipe(
    initializeTransaction,
    checkIfRewardHasNotExpired,
    checkIfRewardAlreadyClaimed,
    checkPointsBalance,
    redeemPoints,
    updateCardBalance,
    createCustomerReward
  )(initialContext, {
    loyaltyCard: initialContext.loyaltyCard,
    transaction: {} as LoyaltyCardTransaction,
    reward: {} as CustomerReward,
  } as RedemptionAggregate);

  if (!result.success || !result.aggregate || result.error) {
    await eventBus.publish({
      type: 'RewardClaimFailed',
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
    type: 'RewardClaimed',
    payload: {
      customerReward: result.aggregate.reward,
      loyaltyCard: result.aggregate.loyaltyCard,
      loyaltyCardTransaction: result.aggregate.transaction,
    },
  } as RewardClaimedEvent;

  const handlerResult = (await eventBus.publish(event))?.get('RewardClaimed');
  const transactionId = handlerResult?.data.transactionId ?? '';
  const rewardId = handlerResult?.data.rewardId ?? '';

  return {
    success: true,
    data: {
      rewardId,
      transactionId,
    },
  };
};

export default processClaimReward;
