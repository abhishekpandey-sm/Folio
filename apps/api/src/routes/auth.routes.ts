import { Router } from "express";
import { verifyEmailController } from "../controllers/auth.controller.js";
import { signupController } from "../controllers/auth.controller.js";
import { signinController } from "../controllers/auth.controller.js";
import { refreshController } from "../controllers/refresh.controller.js";
import { logoutController } from "../controllers/logout.controller.js";

const authRouter = Router()

authRouter.post("/verify-email", verifyEmailController);
authRouter.post("/signup", signupController);
authRouter.post("/signin", signinController);
authRouter.post("/refresh", refreshController);
authRouter.post("/logout", logoutController);

export default authRouter;