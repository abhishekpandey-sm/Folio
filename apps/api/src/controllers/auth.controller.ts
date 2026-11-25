import { Request, Response } from "express";
import { z } from "zod";
import { verifyEmail } from "../services/verification.service.js";
import { signup } from "../services/auth.service.js";
import { signupSchema } from "../validators/auth.schema.js";

const verifyEmailSchema = z.object({
    token: z.string().min(1)
})

export async function verifyEmailController(
    req: Request,
    res: Response
){
    const parsed = verifyEmailSchema.safeParse(req.body)

    if(!parsed.success){
        return res.status(400).json({   
            message: "Invalid verification request"
        })
    }

    try{
        await verifyEmail(parsed.data.token);

        return res.status(200).json({
            message: "Email verified successfully"
        })
    } catch(error){
        if(error instanceof Error){
            return res.status(400).json({
                message: error.message
            })
        }

        return res.status(500).json({
            message: "Something went wrong"
        })
    }
}


export async function signupController(
    req: Request,
    res: Response
) {
    const parsed = signupSchema.safeParse(req.body);

    if(!parsed.success){
        return res.status(400).json({
            message: "Invalid signup details",
            errors: parsed.error.issues
        })
    }

    try{
        const result = await signup(parsed.data)

        return res.status(201).json({
            message: "Account created. Please verify your email.",
            userId: result.userId
        })
    } catch(error){
        if (error instanceof Error){
            if(error.message === "Email is already registered"){
                return res.status(409).json({message: error.message})
            }
        }
        return res.status(500).json({ message: "Something went wrong" })
    }
}
