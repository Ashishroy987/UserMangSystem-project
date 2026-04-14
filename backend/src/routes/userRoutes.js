import express from "express";
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  getMyProfile,
  updateMyProfile,
} from "../controllers/userController.js";
import { authRequired, authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {
  listUsersSchema,
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  updateProfileSchema,
} from "../validators/userValidators.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

router.use(authRequired);

router.get("/me", getMyProfile);
router.patch("/me", validate(updateProfileSchema), updateMyProfile);
router.get("/", authorize(ROLES.ADMIN, ROLES.MANAGER), validate(listUsersSchema), listUsers);
router.post("/", authorize(ROLES.ADMIN), validate(createUserSchema), createUser);
router.get("/:id", authorize(ROLES.ADMIN, ROLES.MANAGER), validate(userIdSchema), getUserById);
router.patch(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.MANAGER),
  validate(updateUserSchema),
  updateUser,
);
router.delete(
  "/:id",
  authorize(ROLES.ADMIN),
  validate(userIdSchema),
  deactivateUser,
);

export default router;
