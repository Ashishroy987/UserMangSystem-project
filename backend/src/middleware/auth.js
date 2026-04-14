import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { AppError } from "../utils/errors.js";
import { USER_STATUSES } from "../constants/roles.js";

export const authRequired = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AppError(401, "Authentication required");
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub);

    if (!user) {
      throw new AppError(401, "User session is invalid");
    }

    if (user.status !== USER_STATUSES.ACTIVE) {
      throw new AppError(403, "This account is inactive");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(401, "Invalid or expired token");
  }
});

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError(401, "Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "You do not have permission for this action"));
    }

    return next();
  };
}
