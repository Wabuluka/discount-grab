"use client";

import { useQuery } from "@tanstack/react-query";
import { productApi, PopularProductsParams } from "@/services/productApi";
import type { Product } from "@/types/product";

type ResponseData = {
  products: Product[];
  total: number;
  page: number;
  limit: number;
};

export const useGetPopularProducts = (params?: PopularProductsParams) => {
  return useQuery<ResponseData, Error>({
    queryKey: ["popularProducts", params],
    queryFn: async () => {
      const { data } = await productApi.getPopularProducts(params);
      return data;
    },
  });
};
