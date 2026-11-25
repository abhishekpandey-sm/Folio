import mongoose from "mongoose"

export async function connectDatabase(uri: string) {
    try{
        await mongoose.connect(uri);
        console.log("MongoDB connected successfully")
    }catch(error){
        console.error("MongoDb connection failed: ", error);
        throw error;
    }
}