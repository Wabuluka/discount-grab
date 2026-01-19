export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Rate relative to USD
}

// Exchange rates relative to USD (these would ideally be fetched from an API)
// Last updated: January 2026 (approximate rates)
export const CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", rate: 1 },
  EUR: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  GBP: { code: "GBP", symbol: "\u00A3", name: "British Pound", rate: 0.79 },
  CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 1.36 },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 1.53 },
  JPY: { code: "JPY", symbol: "\u00A5", name: "Japanese Yen", rate: 149.5 },
  CNY: { code: "CNY", symbol: "\u00A5", name: "Chinese Yuan", rate: 7.24 },
  INR: { code: "INR", symbol: "\u20B9", name: "Indian Rupee", rate: 83.12 },
  BRL: { code: "BRL", symbol: "R$", name: "Brazilian Real", rate: 4.97 },
  MXN: { code: "MXN", symbol: "$", name: "Mexican Peso", rate: 17.15 },
  CHF: { code: "CHF", symbol: "CHF", name: "Swiss Franc", rate: 0.88 },
  KRW: { code: "KRW", symbol: "\u20A9", name: "South Korean Won", rate: 1320 },
  SGD: { code: "SGD", symbol: "S$", name: "Singapore Dollar", rate: 1.34 },
  HKD: { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", rate: 7.82 },
  SEK: { code: "SEK", symbol: "kr", name: "Swedish Krona", rate: 10.42 },
  NOK: { code: "NOK", symbol: "kr", name: "Norwegian Krone", rate: 10.65 },
  DKK: { code: "DKK", symbol: "kr", name: "Danish Krone", rate: 6.88 },
  NZD: { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", rate: 1.64 },
  ZAR: { code: "ZAR", symbol: "R", name: "South African Rand", rate: 18.65 },
  AED: { code: "AED", symbol: "\u062F.\u0625", name: "UAE Dirham", rate: 3.67 },
};

// Map country codes to their default currencies
export const COUNTRY_CURRENCIES: Record<string, string> = {
  US: "USD",
  CA: "CAD",
  GB: "GBP",
  AU: "AUD",
  NZ: "NZD",
  JP: "JPY",
  CN: "CNY",
  IN: "INR",
  BR: "BRL",
  MX: "MXN",
  CH: "CHF",
  KR: "KRW",
  SG: "SGD",
  HK: "HKD",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  ZA: "ZAR",
  AE: "AED",
  // EU countries use EUR
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  PT: "EUR",
  IE: "EUR",
  FI: "EUR",
  GR: "EUR",
};

export function getCurrencyForCountry(countryCode: string): CurrencyInfo {
  const currencyCode = COUNTRY_CURRENCIES[countryCode] || "USD";
  return CURRENCIES[currencyCode] || CURRENCIES.USD;
}

export function convertPrice(priceUSD: number, toCurrency: string): number {
  const currency = CURRENCIES[toCurrency];
  if (!currency) return priceUSD;
  return Math.round(priceUSD * currency.rate * 100) / 100;
}

export function formatPrice(price: number, currencyCode: string): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;

  // Use Intl.NumberFormat for proper formatting
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: currency.code === "JPY" || currency.code === "KRW" ? 0 : 2,
    maximumFractionDigits: currency.code === "JPY" || currency.code === "KRW" ? 0 : 2,
  }).format(price);
}

export function getSupportedCurrencies(): CurrencyInfo[] {
  return Object.values(CURRENCIES);
}
