import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { AppError } from "../utils/errors.js";
import {
  buildUserSearchQuery,
  ensureEmailIsAvailable,
  assertManagerCanAccess,
  assertCanUpdateUser,
} from "../services/userService.js";
import { ROLES, USER_STATUSES } from "../constants/roles.js";
import { serializeUser } from "../utils/serializers.js";

const auditPopulate = [
  { path: "createdBy", select: "name email role" },
  { path: "updatedBy", select: "name email role" },
];

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, search, role, status } = req.validated.query;
  const query = buildUserSearchQuery({ search, role, status });

  if (req.user.role === ROLES.MANAGER) {
    if (query.role === ROLES.ADMIN) {
      query.role = "__forbidden__";
    } else if (!query.role) {
      query.role = { $ne: ROLES.ADMIN };
    }
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(auditPopulate),
    User.countDocuments(query),
  ]);

  res.json({
    items: users.map(serializeUser),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.validated.params.id).populate(auditPopulate);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  assertManagerCanAccess(req.user, user);

  res.json({
    user: serializeUser(user),
  });
});

export const createUser = asyncHandler(async (req, res) => {
  await ensureEmailIsAvailable(req.body.email);

  const user = await User.create({
    ...req.body,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  const populatedUser = await User.findById(user._id).populate(auditPopulate);

  res.status(201).json({
    user: serializeUser(populatedUser),
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.validated.params.id).select("+password");

  if (!user) {
    throw new AppError(404, "User not found");
  }

  assertCanUpdateUser(req.user, user, req.body);

  if (req.body.email) {
    await ensureEmailIsAvailable(req.body.email, user._id);
  }

  Object.assign(user, req.body, { updatedBy: req.user._id });
  await user.save();

  const populatedUser = await User.findById(user._id).populate(auditPopulate);

  res.json({
    user: serializeUser(populatedUser),
  });
});

export const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.validated.params.id);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  assertCanUpdateUser(req.user, user, { status: USER_STATUSES.INACTIVE });

  user.status = USER_STATUSES.INACTIVE;
  user.updatedBy = req.user._id;
  await user.save();

  const populatedUser = await User.findById(user._id).populate(auditPopulate);

  res.json({
    message: "User deactivated successfully",
    user: serializeUser(populatedUser),
  });
});

export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(auditPopulate);

  res.json({
    user: serializeUser(user),
  });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if ("role" in req.body) {
    throw new AppError(403, "You cannot change your own role");
  }

  Object.assign(user, req.body, { updatedBy: req.user._id });
  await user.save();

  const populatedUser = await User.findById(user._id).populate(auditPopulate);

  res.json({
    user: serializeUser(populatedUser),
  });
});
