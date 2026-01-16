"use client";

import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/services/productApi";
import type { Product } from "@/types/product";

type ResponseData = {
  products: Product[];
  total: number;
  page: number;
  limit: number;
};

const getProducts = async () => {
  const response = await productApi.getProducts();
  if (response.status < 200 || response.status >= 300) {
    throw new Error("Network response was not ok");
  }
  return response;
};

export const useGetProducts = () => {
  return useQuery<ResponseData, Error>({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await getProducts();
      return data;
    },
  });
};
