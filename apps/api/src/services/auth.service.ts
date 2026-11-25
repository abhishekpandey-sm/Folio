import { randomBytes, createHash } from "crypto";

import {
    mongoose,
    User,
    AuthAccount,
    VerificationToken
} from "@folio/database"

import { hashPassword } from "./password.service.js";
import { sendVerificationEmail } from "./email.service.js";
import { verifyPassword } from "./password.service.js";
import { generateAccessToken } from "./token.service.js";
import { createSession } from "./session.service.js";


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

interface ISigninInput {
    email: string;
    password: string;
}

export async function signin(input: ISigninInput, userAgent: string) {
    const email = input.email.trim().toLowerCase()

    const account = await AuthAccount.findOne({
        provider: "email",
        providerAccountId: email
    }).select("+passwordHash");

    if(!account || !account.passwordHash){
        throw new Error("Invalid email or password")
    }

    const isPasswordValid = await verifyPassword(
        input.password,
        account.passwordHash
    )

    if(!isPasswordValid){
        throw new Error("Invalid email or password")
    }

    if(!account.emailVerifiedAt){
        throw new Error("Please verify your email before signing in")
    }

    const accessToken = await generateAccessToken(account.userId.toString())
    const session = await createSession(account.userId, userAgent)

    return {
        accessToken,
        refreshToken: session.refreshToken,
        refreshTokenExpiresAt: session.expiresAt,
        userId: account.userId.toString()
    }
}