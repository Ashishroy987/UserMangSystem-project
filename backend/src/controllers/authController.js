import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { AppError } from "../utils/errors.js";
import { signAccessToken } from "../utils/auth.js";
import { serializeUser } from "../utils/serializers.js";
import { ROLES, USER_STATUSES } from "../constants/roles.js";
import { ensureEmailIsAvailable } from "../services/userService.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new AppError(401, "Invalid email or password");
  }

  if (user.status !== USER_STATUSES.ACTIVE) {
    throw new AppError(403, "This account is inactive");
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signAccessToken(user);

  res.json({
    token,
    user: serializeUser(user),
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("createdBy", "name email role")
    .populate("updatedBy", "name email role");

  res.json({
    user: serializeUser(user),
  });
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  await ensureEmailIsAvailable(email);

  const user = await User.create({
    name,
    email,
    password,
    role: ROLES.USER,
    status: USER_STATUSES.ACTIVE,
  });

  user.createdBy = user._id;
  user.updatedBy = user._id;
  await user.save();

  const token = signAccessToken(user);

  res.status(201).json({
    token,
    user: serializeUser(user),
  });
});
