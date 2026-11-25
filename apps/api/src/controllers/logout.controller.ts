
import { Request, Response } from "express";
import { revokeSession } from "../services/session.service.js";
import { env } from "../config/env.js";

export async function logoutController(req: Request, res: Response) {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            await revokeSession(refreshToken);
        }

        // Clear the refresh-token cookie.
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/api/v1/auth"
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to log out"
        });
    }
}
