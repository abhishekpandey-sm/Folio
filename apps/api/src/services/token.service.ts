import { SignJWT, jwtVerify } from "jose"
import { env } from "../config/env.js"

const secret = new TextEncoder().encode( env.ACCESS_TOKEN_SECRET )

const ISSUER = "folio-api";
const AUDIENCE = "foilio-web"

export async function generateAccessToken(userId: string){
    return new SignJWT({})
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(userId)
        .setIssuedAt()
        .setIssuer(ISSUER)
        .setAudience(AUDIENCE)
        .setExpirationTime("15m")
        .sign(secret)
}

export async function verifyAccessToken(token: string) {
    const {payload} =  await jwtVerify(token, secret, {
        algorithms: ["HS256"],
        issuer: ISSUER,
        audience: AUDIENCE
    })

    return payload
}