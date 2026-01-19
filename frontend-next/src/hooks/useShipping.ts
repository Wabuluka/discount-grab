"use client";

import { useQuery } from "@tanstack/react-query";
import { getShippingRates, type ShippingInfo } from "@/services/geoApi";
import { useGeo } from "@/providers/GeoProvider";

export function useShipping(orderTotal: number = 0) {
  const { geoInfo } = useGeo();
  const countryCode = geoInfo?.countryCode || "US";

  return useQuery<ShippingInfo>({
    queryKey: ["shipping", countryCode, orderTotal],
    queryFn: () => getShippingRates(countryCode, orderTotal),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!countryCode,
  });
}
