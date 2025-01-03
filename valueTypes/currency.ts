export type CurrencyCode = keyof typeof currencies;

export type Currency = {
  code: string;
  name: string;
  shortName?: string;
};

export const currencies: Record<string, Omit<Currency, 'code'>> = {
  USD: { name: 'United States Dollar', shortName: 'Dollar' },
  EUR: { name: 'Euro', shortName: 'Euro' },
  JPY: { name: 'Japanese Yen', shortName: 'Yen' },
  GBP: { name: 'British Pound', shortName: 'Pound' },
  AUD: { name: 'Australian Dollar', shortName: 'Dollar' },
  CAD: { name: 'Canadian Dollar', shortName: 'Dollar' },
  CHF: { name: 'Swiss Franc', shortName: 'Franc' },
  CNY: { name: 'Chinese Yuan', shortName: 'Yuan' },
  SEK: { name: 'Swedish Krona', shortName: 'Krona' },
  NZD: { name: 'New Zealand Dollar', shortName: 'Dollar' },
  PHP: { name: 'Philippine Pesos', shortName: 'Peso' },
};

export const currencyMap: Record<string, string> = Object.fromEntries(
  Object.entries(currencies).map(([code, { name }]) => [code, name])
);

// Example function to get currency details by code
function getCurrency(code: string) {
  const currency = currencies[code];
  if (currency) {
    return { code, ...currency };
  } else {
    return null;
  }
}

export default getCurrency;
