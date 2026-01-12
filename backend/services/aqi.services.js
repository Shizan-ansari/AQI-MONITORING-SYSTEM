import {AQI_MODEL} from "../models/aqi.models.js";
import mongoose from "mongoose";
import { getAqiData, getCoordinatedByCity } from "../utils/apiClient.js";


export const getAndStoreAQiDataByCity = async(city) =>{
    //get lat/lon
    const {lat,lon} = await getCoordinatedByCity(city);

    const rawAQIData = await getAqiData(lat,lon);

    const aqiDoc = AQI_MODEL.buildFromAPI(city,lat,lon, rawAQIData);

    const latestAQI = await AQI_MODEL.findOneAndUpdate(
        {city},
        aqiDoc,
        {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        }
    );
    return latestAQI;
}