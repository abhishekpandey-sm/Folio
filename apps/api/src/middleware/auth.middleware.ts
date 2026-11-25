import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/token.service.js"; 
import { success } from "zod";


export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
){
    const authorization = req.headers.authorization

    if(!authorization || !authorization.startsWith("Bearer ")){
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        })
    }

    const accessToken = authorization.slice(7).trim();

    if(!accessToken){
        return res.status(401).json({
            success: false,
            message: "Access token required"
        })
    }

    try{
        const payload = await verifyAccessToken(accessToken)

        if(typeof payload.sub !== "string" ){
            return res.status(401).json({
                success: false,
                message: "Invalid access token"
            })
        }

        res.locals.userId = payload.sub;

        next()
    } catch{
        return res.status(401).json({
            success: false,
            message: "Invalid or expired access token"
        })
    }
}