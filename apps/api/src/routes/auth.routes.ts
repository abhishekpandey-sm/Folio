import { Router } from "express";
import { verifyEmailController } from "../controllers/auth.controller.js";
import { signupController } from "../controllers/auth.controller.js";

const authRouter = Router()

authRouter.post("/verify-email", verifyEmailController);
authRouter.post("/signup", signupController);

export default authRouter