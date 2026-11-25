import { Router } from "express";
import { verifyEmailController } from "../controllers/auth.controller.js";
import { signupController } from "../controllers/auth.controller.js";
import { signinController } from "../controllers/auth.controller.js";
import { refreshController } from "../controllers/refresh.controller.js";
import { logoutController } from "../controllers/logout.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const authRouter = Router()

authRouter.post("/verify-email", verifyEmailController);
authRouter.post("/signup", signupController);
authRouter.post("/signin", signinController);
authRouter.post("/refresh", refreshController);
authRouter.post("/logout", logoutController);

authRouter.get("/me", authenticate, (req, res) => {
    return res.status(200).json({
        success: true,
        message: "You are authenticated",
        userId: res.locals.userId
    })
})

export default authRouter;