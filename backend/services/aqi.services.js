import {AQI_MODEL} from "../models/aqi.models.js";
import { getAqiData, getCoordinatedByCity } from "../utils/apiClient.js";
import axios from "axios";
import { calculateIndianAQI } from "./indianAqiCalculation.services.js";


export const getAndStoreAQiDataByCity = async(city) =>{
     if (!city || city.trim() === "" || typeof city !== "string") {
    throw new Error("City Required");
  }

  
  let lat, lon;
  try {
    const coords = await getCoordinatedByCity(city);
    lat = coords?.lat;
    lon = coords?.lon;
  } catch (error) {
    throw new Error("CITY_NOT_FOUND");
  }

  if (!lat || !lon) {
    throw new Error("CITY_NOT_FOUND");
  }
  

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
    return {
    latestAQI,
    pm2_5: latestAQI.pollutants?.pm2_5 ?? null,
    pm10: latestAQI.pollutants?.pm10 ?? null,
    no2: latestAQI.pollutants?.no2 ?? null,
    so2: latestAQI.pollutants?.so2 ?? null,
    o3: latestAQI.pollutants?.o3 ?? null,
    co: latestAQI.pollutants?.co ?? null

    };
}

export const getRealtimeAQIForMap = async (lat, lon) => {
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.AQI_MESUREMENT_KEY}`;

  const response = await axios.get(url);
  const pollution = response.data.list[0];

  // YOUR existing function
  const indianAQI = calculateIndianAQI(pollution.components);

  return {
    type: "Feature", // Mapbox-ready
    geometry: {
      type: "Point",
      coordinates: [Number(lon), Number(lat)]
    },
    properties: {
      aqi: indianAQI.aqi,
      category: indianAQI.category,
      advice: indianAQI.healthAdvice,
      pollutants: pollution.components,
      timestamp: new Date()
    }
  };
};