"use client";

import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/services/productApi";
import type { Product } from "@/types/product";

const getProduct = async (id: string) => {
  const response = await productApi.getProduct(id);
  if (response.status < 200 || response.status >= 300) {
    throw new Error("Network response was not ok");
  }
  return response.data;
};

export const useSingleProduct = (id: string) => {
  return useQuery<Product>({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await getProduct(id);
      return data;
    },
    enabled: !!id,
  });
};
