// import { resend } from "../lib/resend.js";
// import { env } from "../config/env.js"

// export async function sendTestEmail(to: string){
//     const { data, error } = await resend.emails.send({
//         from: env.RESEND_FROM,
//         to,
//         subject: "Folio email integration test",
//         text: "Your resend integration is working"
//     });

//     if(error){
//         console.error("Resend error: ", error)
//         throw new Error("Failed to send email")
//     }

//     return data;
// }


import { mailer } from "../lib/mailer.js"
import { env } from "../config/env.js"

export async function sendTestEmail(to: string){
    const info = await mailer.sendMail({
        from: `Folio <${env.SMTP_USER}>`,
        to,
        subject: "Folio email integration test",
        text: "Your Gmail SMTP integration is working!"
    })

    return {
        messageId: info.messageId
    }
}

export async function sendVerificationEmail(
    to: string,
    token: string
){
    const verificationUrl = `${env.APP_BASE_URL}/verify-email?token=${encodeURIComponent(token)}`;

    const info = await mailer.sendMail({
        from: `Folio <${env.SMTP_USER}>`,
        to,
        subject: "Verify your Folio account",
        text: `
    Welcome to Folio!

    Please verify your email by visiting to this link: 

    ${verificationUrl}

    This link expires in 30 minutes.

    If you did not create this account please ignore this email.

        
        `,

        html: `
            <h2> Welcome to Folio! </h2>
            <p>  Please verify your email by visiting to this link:  </p>
            <a href="${verificationUrl}">Verify my email</a>
            <p>This link expires in 30 minutes.</p>
            <p>If you did not create this account, ignore this email.</p>
        `
    })

    return { messageId: info.messageId };

}

