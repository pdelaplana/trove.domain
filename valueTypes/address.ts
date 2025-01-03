export interface Address {
  fullAddress?: string;
  streetAddress1?: string;
  streetAddress2?: string;
  streetAddress3?: string;
  cityOrSuburb?: string;
  stateOrProvince?: string;
  postCode?: string;
  country?: string;
}

export const useAddressValidationRules = () => ({
  streetAddress1: {
    required: 'Address is required',
  },
  streetAddress2: {
    maxLength: {
      value: 100,
      message: 'Address line must be less than 100 characters',
    },
  },
  cityOrSuburb: {
    required: 'City is required',
    maxLength: {
      value: 50,
      message: 'City name must be less than 50 characters',
    },
  },
  stateOrProvince: {
    required: 'State is required',
    maxLength: {
      value: 50,
      message: 'State name must be less than 50 characters',
    },
  },
  postCode: {
    required: 'Postal code is required',
    pattern: {
      value: /^[0-9]{5}$/,
      message: 'Enter a valid postal code',
    },
  },
});
