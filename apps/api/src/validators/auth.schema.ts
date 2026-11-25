import {z} from "zod";

export const signupSchema = z.object({
    name: z.string()
            .trim()
            .min(2, "Name must contain atleast 2 characters")
            .max(100),
        
    email: z.email()
            .trim()
            .toLowerCase(),
    
    password: z.string()
            .min(12, "Password must be at least 12 characters")
            .max(128)
})

