import { register } from "@/controller";
import { validateRequest } from "@/middlewares/validator.middleware";
import { registerSchema } from "@/validators/auth.validator";
import { Router } from "express";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);

export default router;
