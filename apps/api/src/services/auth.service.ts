import { randomBytes, createHash } from "crypto";

import {
    mongoose,
    User,
    AuthAccount,
    VerificationToken
} from "@folio/database"

import { hashPassword } from "./password.service.js";
import { sendVerificationEmail } from "./email.service.js";

interface ISignupInput {
    name: string,
    email: string,
    password: string
}

export async function signup(input : ISignupInput) {
    const email = input.email.trim().toLowerCase();

    const existingUser = await User.findOne({email})

    if(existingUser){
        throw new Error("Email is already registered")
    }

    const passwordHash = await hashPassword(input.password)

    const rawToken = randomBytes(32).toString("hex")

    const tokenHash = createHash("sha256")
        .update(rawToken)
        .digest("hex");

    const session = await mongoose.startSession();

    let createdUserId: string | undefined;

    try{
        await session.withTransaction(async() => {
            const [user] = await User.create(
                [{
                    name: input.name,
                    email
                }], 
                { session }
            )

            await AuthAccount.create(
                [{
                    userId: user._id,
                    provider: "email",
                    providerAccountId: email,
                    passwordHash,
                    emailVerifiedAt: null
                }],
                { session }
            )

            await VerificationToken.create(
                [{
                    userId: user._id,
                    tokenHash,
                    purpose: "email_verification",
                    expiresAt: new Date(Date.now() + 30 * 60 * 1000)
                }],
                { session }
            );

            createdUserId = user._id.toString();
        });
    } finally{
        await session.endSession();
    }

    if(!createdUserId){
        throw new Error("Signup failed")
    }

    await sendVerificationEmail(email, rawToken)

    return{
        userId: createdUserId
    }

}