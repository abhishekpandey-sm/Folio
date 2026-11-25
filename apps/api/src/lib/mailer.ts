import nodemailer from "nodemailer"
import { env } from "../config/env.js"

export const mailer = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_APP_PASSWORD
    }
})