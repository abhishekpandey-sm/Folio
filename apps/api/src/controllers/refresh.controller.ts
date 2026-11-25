import { Request, Response } from "express";
import { rotateSession } from "../services/session.service.js";
import { env } from "../config/env.js";

export async function refreshController(req: Request, res: Response){
    const refreshToken = req.cookies?.refreshToken;

    if(!refreshToken){
        return res.status(401).json({
            success: false,
            message: "Refresh Token Missing"
        })
    }

    try{
        const result = await rotateSession(refreshToken);

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV == "production",
            sameSite: "lax",
            expires: result.expiresAt,
            path: "/api/v1/auth"
        })

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            accessToken: result.accessToken
        })
    } catch(error){
        console.error("Refresh token error: ", error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token"
        })
    }
}