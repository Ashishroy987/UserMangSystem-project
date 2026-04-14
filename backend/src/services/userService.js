import User from "../models/User.js";
import { ROLES, USER_STATUSES } from "../constants/roles.js";
import { AppError } from "../utils/errors.js";

export function buildUserSearchQuery({ search, role, status }) {
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (role) {
    query.role = role;
  }

  if (status) {
    query.status = status;
  }

  return query;
}

export async function ensureEmailIsAvailable(email, currentUserId) {
  const existingUser = await User.findOne({ email }).select("_id");

  if (existingUser && existingUser._id.toString() !== currentUserId?.toString()) {
    throw new AppError(409, "Email is already in use");
  }
}

export function assertManagerCanAccess(actor, targetUser) {
  if (actor.role === ROLES.ADMIN) {
    return;
  }

  if (actor.role === ROLES.MANAGER && targetUser.role !== ROLES.ADMIN) {
    return;
  }

  throw new AppError(403, "You do not have permission for this user");
}

export function assertCanUpdateUser(actor, targetUser, payload) {
  if (actor.role === ROLES.ADMIN) {
    return;
  }

  if (actor.role === ROLES.MANAGER) {
    if (targetUser.role === ROLES.ADMIN) {
      throw new AppError(403, "Managers cannot update admin accounts");
    }

    if (payload.role === ROLES.ADMIN) {
      throw new AppError(403, "Managers cannot assign admin role");
    }

    return;
  }

  throw new AppError(403, "You do not have permission for this action");
}

export async function seedBaseUsers() {
  const existingCount = await User.countDocuments();

  if (existingCount > 0) {
    return;
  }

  const admin = await User.create({
    name: "System Admin",
    email: "admin@purplemerit.local",
    password: "Admin@123",
    role: ROLES.ADMIN,
    status: USER_STATUSES.ACTIVE,
  });

  const manager = await User.create({
    name: "Team Manager",
    email: "manager@purplemerit.local",
    password: "Manager@123",
    role: ROLES.MANAGER,
    status: USER_STATUSES.ACTIVE,
    createdBy: admin._id,
    updatedBy: admin._id,
  });

  const user = await User.create({
    name: "Demo User",
    email: "user@purplemerit.local",
    password: "User@1234",
    role: ROLES.USER,
    status: USER_STATUSES.ACTIVE,
    createdBy: admin._id,
    updatedBy: manager._id,
  });

  admin.createdBy = admin._id;
  admin.updatedBy = admin._id;
  await admin.save();

  console.log("Seeded demo users:");
  console.log(`Admin: ${admin.email} / Admin@123`);
  console.log(`Manager: ${manager.email} / Manager@123`);
  console.log(`User: ${user.email} / User@1234`);
}
