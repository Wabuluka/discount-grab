export interface GeoInfo {
  country: string;
  countryCode: string;
  currency: string;
  timezone: string;
  city?: string;
  region?: string;
}

export interface ShippingZone {
  rate: number;
  freeThreshold: number;
  estimatedDays: string;
}

// Shipping zones by country code
export const SHIPPING_ZONES: Record<string, ShippingZone> = {
  US: { rate: 0, freeThreshold: 50, estimatedDays: "3-5" },
  CA: { rate: 9.99, freeThreshold: 75, estimatedDays: "5-7" },
  GB: { rate: 12.99, freeThreshold: 100, estimatedDays: "7-10" },
  DE: { rate: 14.99, freeThreshold: 100, estimatedDays: "7-10" },
  FR: { rate: 14.99, freeThreshold: 100, estimatedDays: "7-10" },
  AU: { rate: 19.99, freeThreshold: 120, estimatedDays: "10-14" },
  JP: { rate: 17.99, freeThreshold: 100, estimatedDays: "7-10" },
  default: { rate: 24.99, freeThreshold: 150, estimatedDays: "14-21" },
};

// EU countries for grouping
const EU_COUNTRIES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE"
];

export function getShippingZone(countryCode: string): ShippingZone {
  // Check direct match first
  if (SHIPPING_ZONES[countryCode]) {
    return SHIPPING_ZONES[countryCode];
  }

  // Check if EU country (use France/Germany rates)
  if (EU_COUNTRIES.includes(countryCode)) {
    return { rate: 14.99, freeThreshold: 100, estimatedDays: "7-10" };
  }

  return SHIPPING_ZONES.default;
}

export function calculateShipping(countryCode: string, orderTotal: number): {
  shippingCost: number;
  isFreeShipping: boolean;
  estimatedDays: string;
} {
  const zone = getShippingZone(countryCode);
  const isFreeShipping = orderTotal >= zone.freeThreshold;

  return {
    shippingCost: isFreeShipping ? 0 : zone.rate,
    isFreeShipping,
    estimatedDays: zone.estimatedDays,
  };
}

export async function getGeoFromIP(ip: string): Promise<GeoInfo> {
  // Skip for localhost/private IPs
  if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return {
      country: "United States",
      countryCode: "US",
      currency: "USD",
      timezone: "America/New_York",
    };
  }

  try {
    // Use ip-api.com (free, no API key needed, 45 requests/minute limit)
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,regionName,timezone,currency`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch geo data");
    }

    const data = await response.json();

    if (data.status === "fail") {
      throw new Error("IP lookup failed");
    }

    return {
      country: data.country || "Unknown",
      countryCode: data.countryCode || "US",
      currency: data.currency || "USD",
      timezone: data.timezone || "UTC",
      city: data.city,
      region: data.regionName,
    };
  } catch {
    // Fallback to US defaults on error
    return {
      country: "United States",
      countryCode: "US",
      currency: "USD",
      timezone: "America/New_York",
    };
  }
}

export function getClientIP(req: {
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
  ip?: string;
}): string {
  // Check various headers for proxied requests
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    return ips.split(",")[0].trim();
  }

  const realIP = req.headers["x-real-ip"];
  if (realIP) {
    return Array.isArray(realIP) ? realIP[0] : realIP;
  }

  return req.ip || req.socket?.remoteAddress || "127.0.0.1";
}
