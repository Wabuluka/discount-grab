import api from "./api";

export interface GeoInfo {
  country: string;
  countryCode: string;
  currency: string;
  currencySymbol: string;
  currencyName: string;
  timezone: string;
  city?: string;
  region?: string;
}

export interface ShippingInfo {
  countryCode: string;
  shippingCost: number;
  isFreeShipping: boolean;
  estimatedDays: string;
  amountToFreeShipping: number;
}

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  rate: number;
}

export interface ConversionResult {
  original: number;
  originalCurrency: string;
  converted: number;
  targetCurrency: string;
  rate: number;
}

export async function detectLocation(): Promise<GeoInfo> {
  const response = await api.get<{ data: GeoInfo }>("/geo/detect");
  return response.data.data;
}

export async function getShippingRates(countryCode: string, orderTotal: number): Promise<ShippingInfo> {
  const response = await api.get<{ data: ShippingInfo }>("/geo/shipping", {
    params: { countryCode, orderTotal },
  });
  return response.data.data;
}

export async function getCurrencies(): Promise<CurrencyInfo[]> {
  const response = await api.get<{ data: CurrencyInfo[] }>("/geo/currencies");
  return response.data.data;
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<ConversionResult> {
  const response = await api.get<{ data: ConversionResult }>("/geo/convert", {
    params: { amount, from, to },
  });
  return response.data.data;
}
