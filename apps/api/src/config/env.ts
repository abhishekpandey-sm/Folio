import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    NODE_ENV : z
                .enum(["development", "test", "production"])
                .default("development"),
            
    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

    PORT: z.coerce.number().default(3000),

    // RESEND_API_KEY: z.string().min(1),

    // RESEND_FROM: z
    //     .string()
    //     .min(1)
    //     .default("Folio <onboarding@resend.dev>"),

    SMTP_USER: z.email(),

    SMTP_APP_PASSWORD: z.string().min(16),

    APP_BASE_URL: z.url().default("http://localhost:5173"),

    ACCESS_TOKEN_SECRET: z.string().min(32),
})


const parsedEnv = envSchema.safeParse(process.env)

if(!parsedEnv.success){
    console.error("Invalid environmwnt variables: ", parsedEnv.error.flatten())
    throw new Error("Environment validation failed");
}

export const env = parsedEnv.data;