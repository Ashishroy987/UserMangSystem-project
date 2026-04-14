import { z } from "zod";
import { ROLES, USER_STATUSES } from "../constants/roles.js";

const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid identifier");

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional().default(""),
  role: z.enum([ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]).optional(),
  status: z.enum([USER_STATUSES.ACTIVE, USER_STATUSES.INACTIVE]).optional(),
});

const createUserBody = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
  role: z.enum([ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]).default(ROLES.USER),
  status: z
    .enum([USER_STATUSES.ACTIVE, USER_STATUSES.INACTIVE])
    .default(USER_STATUSES.ACTIVE),
});

const updateUserBody = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    email: z.email().transform((value) => value.toLowerCase()).optional(),
    password: z.string().min(8).max(128).optional(),
    role: z.enum([ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]).optional(),
    status: z.enum([USER_STATUSES.ACTIVE, USER_STATUSES.INACTIVE]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

const updateProfileBody = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    password: z.string().min(8).max(128).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

const userIdParams = z.object({
  id: mongoId,
});

export const listUsersSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
  query: querySchema,
});

export const createUserSchema = z.object({
  body: createUserBody,
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const updateUserSchema = z.object({
  body: updateUserBody,
  query: z.object({}).optional().default({}),
  params: userIdParams,
});

export const userIdSchema = z.object({
  body: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
  params: userIdParams,
});

export const updateProfileSchema = z.object({
  body: updateProfileBody,
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});
