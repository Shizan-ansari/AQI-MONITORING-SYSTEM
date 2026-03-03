import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./routes/user.routes.js"
import aqiRoutes from "./routes/aqi.routes.js";
import aiRoutes from "./routes/aiRecommendation.routes.js"

dotenv.config();
const MONGO_URL = process.env.MONGO_URL;
const app = express();
app.use(express.json());

app.use(cors())

app.use(userRoutes);
app.use(aqiRoutes);
app.use(aiRoutes);


const start = async () =>{
    const connectDB = await mongoose.connect(MONGO_URL);

    console.log("MongoDb Connected")
    const PORT = process.env.PORT || 9090;
    app.listen(PORT, (req,res) =>{
        console.log(`server is listening on port ${PORT}`)
    })
}
start();


