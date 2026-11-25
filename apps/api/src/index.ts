import express from "express"
import { env } from "./config/env.js"
import { connectDatabase } from "@folio/database"
import authRouter from "./routes/auth.routes.js"

const app = express()

app.use(express.json())

app.use("/api/v1/auth", authRouter)

app.get('/health', (req, res) => {
    res.status(201).json({
        success: true,
        message: "Folio ai is running"
    })
})

async function startServer() {
    try{
        await connectDatabase(env.MONGODB_URI)

        app.listen(env.PORT, () => {
            console.log(`Folio api running on port ${env.PORT}`)
        }) 

    } catch(error) {
        console.error("Failed to start Folio API: ", error)
        process.exit(1)
    }
}

startServer()