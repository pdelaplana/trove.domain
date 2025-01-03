import { Address } from '../valueTypes/address';
import { CurrencyCode } from '../valueTypes/currency';
import { OperatingHours } from '../valueTypes/operatingHours';
import { LoyaltyProgram } from './loyaltyProgram';

export interface Business {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  website: string;
  phone: string;
  email: string;
  operatingHours: OperatingHours[];
  address: Address;
  currency: CurrencyCode;
  loyaltyPrograms: LoyaltyProgram[];
}

export const useBusinessValidationRules = () => ({
  name: {
    required: 'Shop name is required',
    minLength: {
      value: 3,
      message: 'Shop name must be at least 3 characters long',
    },
    maxLength: {
      value: 50,
      message: 'Shop name must be less than 50 characters',
    },
  },
  description: {
    maxLength: {
      value: 500,
      message: 'Description must be less than 500 characters',
    },
  },
  website: {
    pattern: {
      value: /^(http|https):\/\/[^ "]+$/,
      message: 'Enter a valid website URL',
    },
  },
  email: {
    pattern: {
      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: 'Enter a valid email address',
    },
  },
  phone: {
    pattern: {
      value: /^[0-9]{1,15}$/,
      message: 'Enter a valid phone number',
    },
  },
});
