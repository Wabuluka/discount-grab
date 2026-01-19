import { NextFunction, Request, Response } from "express";
import { getGeoFromIP, getClientIP, calculateShipping, SHIPPING_ZONES } from "../utils/geo";
import { getCurrencyForCountry, getSupportedCurrencies, convertPrice, CURRENCIES } from "../utils/currency";

export const detectLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = getClientIP(req);
    const geoInfo = await getGeoFromIP(ip);
    const currency = getCurrencyForCountry(geoInfo.countryCode);

    res.json({
      data: {
        ...geoInfo,
        currency: currency.code,
        currencySymbol: currency.symbol,
        currencyName: currency.name,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getShippingRates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { countryCode, orderTotal } = req.query;
    const country = String(countryCode || "US");
    const total = Number(orderTotal) || 0;

    const shipping = calculateShipping(country, total);

    res.json({
      data: {
        countryCode: country,
        ...shipping,
        amountToFreeShipping: shipping.isFreeShipping
          ? 0
          : Math.max(0, (SHIPPING_ZONES[country]?.freeThreshold || 150) - total),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAllShippingZones = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      data: SHIPPING_ZONES,
    });
  } catch (err) {
    next(err);
  }
};

export const getCurrencies = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      data: getSupportedCurrencies(),
    });
  } catch (err) {
    next(err);
  }
};

export const convertCurrency = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, from, to } = req.query;
    const amountNum = Number(amount) || 0;
    const fromCurrency = String(from || "USD");
    const toCurrency = String(to || "USD");

    // First convert to USD, then to target currency
    const fromRate = CURRENCIES[fromCurrency]?.rate || 1;
    const amountInUSD = amountNum / fromRate;
    const converted = convertPrice(amountInUSD, toCurrency);

    res.json({
      data: {
        original: amountNum,
        originalCurrency: fromCurrency,
        converted,
        targetCurrency: toCurrency,
        rate: CURRENCIES[toCurrency]?.rate || 1,
      },
    });
  } catch (err) {
    next(err);
  }
};
