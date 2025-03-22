import mongoose from "mongoose"

const main = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL as string)
        console.log("Connected to db");
    } catch (error) {
        console.error("Error while connecting to db", )
    }
}