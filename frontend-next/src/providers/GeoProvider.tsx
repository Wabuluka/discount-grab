"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { detectLocation, getCurrencies, type GeoInfo, type CurrencyInfo } from "@/services/geoApi";

interface GeoContextType {
  geoInfo: GeoInfo | null;
  currencies: CurrencyInfo[];
  selectedCurrency: string;
  isLoading: boolean;
  error: string | null;
  setSelectedCurrency: (currency: string) => void;
  convertPrice: (priceUSD: number) => number;
  formatPrice: (price: number) => string;
  refreshLocation: () => Promise<void>;
}

const GeoContext = createContext<GeoContextType | undefined>(undefined);

const CURRENCY_STORAGE_KEY = "dg_selected_currency";

// Exchange rates relative to USD
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.53,
  JPY: 149.5,
  CNY: 7.24,
  INR: 83.12,
  BRL: 4.97,
  MXN: 17.15,
  CHF: 0.88,
  KRW: 1320,
  SGD: 1.34,
  HKD: 7.82,
  SEK: 10.42,
  NOK: 10.65,
  DKK: 6.88,
  NZD: 1.64,
  ZAR: 18.65,
  AED: 3.67,
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "\u20AC",
  GBP: "\u00A3",
  CAD: "C$",
  AUD: "A$",
  JPY: "\u00A5",
  CNY: "\u00A5",
  INR: "\u20B9",
  BRL: "R$",
  MXN: "$",
  CHF: "CHF",
  KRW: "\u20A9",
  SGD: "S$",
  HKD: "HK$",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  NZD: "NZ$",
  ZAR: "R",
  AED: "AED",
};

export function GeoProvider({ children }: { children: ReactNode }) {
  const [geoInfo, setGeoInfo] = useState<GeoInfo | null>(null);
  const [currencies, setCurrencies] = useState<CurrencyInfo[]>([]);
  const [selectedCurrency, setSelectedCurrencyState] = useState<string>("USD");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [geo, currencyList] = await Promise.all([
        detectLocation(),
        getCurrencies(),
      ]);
      setGeoInfo(geo);
      setCurrencies(currencyList);

      // Check localStorage first, then use detected currency
      const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (savedCurrency && EXCHANGE_RATES[savedCurrency]) {
        setSelectedCurrencyState(savedCurrency);
      } else if (geo.currency && EXCHANGE_RATES[geo.currency]) {
        setSelectedCurrencyState(geo.currency);
        localStorage.setItem(CURRENCY_STORAGE_KEY, geo.currency);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to detect location");
      // Set defaults on error
      setGeoInfo({
        country: "United States",
        countryCode: "US",
        currency: "USD",
        currencySymbol: "$",
        currencyName: "US Dollar",
        timezone: "America/New_York",
      });
      // Set default currencies list
      setCurrencies([
        { code: "USD", symbol: "$", name: "US Dollar", rate: 1 },
        { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
        { code: "GBP", symbol: "\u00A3", name: "British Pound", rate: 0.79 },
        { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 1.36 },
        { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 1.53 },
        { code: "JPY", symbol: "\u00A5", name: "Japanese Yen", rate: 149.5 },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  const setSelectedCurrency = useCallback((currency: string) => {
    if (EXCHANGE_RATES[currency]) {
      setSelectedCurrencyState(currency);
      localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    }
  }, []);

  const convertPrice = useCallback(
    (priceUSD: number): number => {
      const rate = EXCHANGE_RATES[selectedCurrency] || 1;
      return Math.round(priceUSD * rate * 100) / 100;
    },
    [selectedCurrency]
  );

  const formatPrice = useCallback(
    (price: number): string => {
      const symbol = CURRENCY_SYMBOLS[selectedCurrency] || "$";
      const isWholeNumber = selectedCurrency === "JPY" || selectedCurrency === "KRW";

      if (isWholeNumber) {
        return `${symbol}${Math.round(price).toLocaleString()}`;
      }

      return `${symbol}${price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    [selectedCurrency]
  );

  return (
    <GeoContext.Provider
      value={{
        geoInfo,
        currencies,
        selectedCurrency,
        isLoading,
        error,
        setSelectedCurrency,
        convertPrice,
        formatPrice,
        refreshLocation,
      }}
    >
      {children}
    </GeoContext.Provider>
  );
}

export function useGeo() {
  const context = useContext(GeoContext);
  if (context === undefined) {
    throw new Error("useGeo must be used within a GeoProvider");
  }
  return context;
}
