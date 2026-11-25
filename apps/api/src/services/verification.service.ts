import { createHash } from "node:crypto";

import {
    mongoose,
    AuthAccount,
    VerificationToken
} from '@folio/database';

export async function verifyEmail(rawToken: string){
    const tokenHash = createHash("sha256")
        .update(rawToken)
        .digest("hex");

    const session = await mongoose.startSession();

    try{
        await session.withTransaction(async () => {
            const now = new Date();

            const verificationToken = await VerificationToken.findOneAndUpdate(
                {
                    tokenHash,
                    purpose: "email_verification",
                    usedAt: null,
                    expiresAt: { $gt: now }
                },
                {
                    $set: { usedAt: now }
                },
                {
                    new: true,
                    session
                }
            );

            if(!verificationToken){
                throw new Error("Invalid or expired verification token")
            }

            const account = await AuthAccount.findOneAndUpdate(
                {
                    userId: verificationToken.userId,
                    provider: "email"
                },
                {
                    $set: { emailVerifiedAt: now }
                },
                {
                    new: true,
                    session
                }
            );

            if(!account){
                throw new Error("Authentication account not found")
            }
        });
        return { success: true}
    } finally {
        await session.endSession();
    }
}
