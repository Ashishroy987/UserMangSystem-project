import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.email().transform((value) => value.toLowerCase()),
    password: z.string().min(8),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.email().transform((value) => value.toLowerCase()),
    password: z.string().min(8).max(128),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});
