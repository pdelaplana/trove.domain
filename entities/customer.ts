import { Address } from '../valueTypes/address';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthday?: Date;
  gender: 'male' | 'female' | 'other' | 'preferNotToSay';
  address?: Address;
  userId?: string;
}
