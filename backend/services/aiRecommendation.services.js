import { AQI_MODEL } from "../models/aqi.models.js"
import { generateAQIRecommendation } from "./promptGeneration.js";



export const getDashboardAQIdata = async (city) =>{
    const aqiData = await AQI_MODEL.findOne({city});
    if(!city){
        res.status(404).json({message: "AQI Data is not found for this City"});;

    }

    const recommendation = await generateAQIRecommendation(aqiData);

    return {
        ...aqiData.toObject(),
        recommendation,
    }
}