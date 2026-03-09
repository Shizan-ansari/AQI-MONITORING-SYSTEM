import { AQI_MODEL } from "../models/aqi.models.js"
import { generateAQIRecommendation } from "./promptGeneration.js"
import { getAndStoreAQiDataByCity } from "./aqi.services.js"

export const getDashboardAQIdata = async (city) => {

    let aqiData = await AQI_MODEL.findOne({ city: city.toLowerCase() });

    //if city not found in db then generate aqi 
    if (!aqiData) {

        const apiData = await getAndStoreAQiDataByCity(city);

        if (!apiData) {
            throw new Error("City AQI data not available");
        }

        aqiData = await AQI_MODEL.findOne({ city: city.toLowerCase() });
    }

    const recommendation = await generateAQIRecommendation(aqiData);

    return {
        ...aqiData.toObject(),
        recommendation
    };
};