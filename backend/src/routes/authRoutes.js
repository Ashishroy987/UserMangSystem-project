import express from "express";
import { login, me, register } from "../controllers/authController.js";
import validate from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../validators/authValidators.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", authRequired, me);

export default router;
