import { z } from "zod";

export const productCreateSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  images: z.array(z.string().url()).optional(),
  stock: z.number().int().nonnegative(),
  category: z.string().optional(),
  specs: z.record(z.string(), z.string()).optional(),
});
