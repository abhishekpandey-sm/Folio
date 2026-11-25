import { Session } from "@folio/database";
import {
    generateRefreshToken,
    hashRefreshToken
} from "./refresh-token.service.js";
import { generateAccessToken } from "./token.service.js";

const REFRESH_TOKEN_EXPIRY_DAYS = 30;

export async function createSession(
    userId: string,
    userAgent: string
) {
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken)

    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

    await Session.create({
        userId,
        refreshTokenHash,
        expiresAt,
        userAgent
    })

    return {
        refreshToken,
        expiresAt
    }

}

export async function rotateSession(refreshToken: string){
    const oldTokenHash =  hashRefreshToken(refreshToken)


    const newRefreshToken = generateRefreshToken();
    const newTokenHash = hashRefreshToken(newRefreshToken)

    const now = new Date();

    const expiresAt = new Date(now.getTime() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

    const session = await Session.findOneAndUpdate(
        {
            refreshTokenHash: oldTokenHash,
            revokedAt: null,
            expiresAt: { $gt: now }
        }, {
            $set: {
                refreshTokenHash: newTokenHash,
                expiresAt,
                lastUsedAt: now
            }
        }, {
            new: true
        }
    )

    if(!session){
        throw new Error("Invalid or expired refresh token")
    }

    const userId = session.userId.toString();

    const accessToken = await generateAccessToken(userId);

    return{
        accessToken,
        refreshToken: newRefreshToken,
        expiresAt
    }
}

export async function revokeSession(refreshToken: string){
    const tokenHash = hashRefreshToken(refreshToken);

    const session = await Session.findOneAndUpdate(
        {
            refreshTokenHash: tokenHash,
            revokedAt: null
        }, {
            $set: {
                revokedAt: new Date()
            }
        }, {
            new: true
        }
    )

    return session;
}