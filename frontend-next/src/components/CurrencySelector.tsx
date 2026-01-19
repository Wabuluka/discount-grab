"use client";

import { useState, useRef, useEffect } from "react";
import { useGeo } from "@/providers/GeoProvider";

const POPULAR_CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"];

export default function CurrencySelector() {
  const { selectedCurrency, setSelectedCurrency, currencies, geoInfo } = useGeo();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCurrencySymbol = (code: string) => {
    const currency = currencies.find((c) => c.code === code);
    return currency?.symbol || code;
  };

  const popularList = currencies.filter((c) => POPULAR_CURRENCIES.includes(c.code));
  const otherList = currencies.filter((c) => !POPULAR_CURRENCIES.includes(c.code));

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        aria-label="Select currency"
      >
        <span className="font-medium">{getCurrencySymbol(selectedCurrency)}</span>
        <span className="text-gray-600 dark:text-gray-400">{selectedCurrency}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {geoInfo && (
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Detected: {geoInfo.country}
              </p>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto">
            {popularList.length > 0 && (
              <>
                <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-gray-700/30">
                  Popular
                </div>
                {popularList.map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => {
                      setSelectedCurrency(currency.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      selectedCurrency === currency.code
                        ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span className="w-6 text-center font-medium">{currency.symbol}</span>
                    <span className="flex-1">{currency.name}</span>
                    <span className="text-xs text-gray-400">{currency.code}</span>
                  </button>
                ))}
              </>
            )}

            {otherList.length > 0 && (
              <>
                <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-gray-700/30">
                  Other Currencies
                </div>
                {otherList.map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => {
                      setSelectedCurrency(currency.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      selectedCurrency === currency.code
                        ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span className="w-6 text-center font-medium">{currency.symbol}</span>
                    <span className="flex-1">{currency.name}</span>
                    <span className="text-xs text-gray-400">{currency.code}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
