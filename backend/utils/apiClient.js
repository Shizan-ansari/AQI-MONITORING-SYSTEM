import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const OPEN_WEATHER_BASE_URL = "https://api.openweathermap.org";
const API_KEY = process.env.AQI_MESUREMENT_KEY;

const apiClient = axios.create({
    baseURL: OPEN_WEATHER_BASE_URL,
    timeout: 5000
})

export const getCoordinatedByCity = async (city) =>{
    const response = await apiClient.get("/geo/1.0/direct",{
        params: {
            q:city,
            limit:1,
            appid: API_KEY
        }
    });

    if(!response.data.length){
        res.status(400).json({message: "City Not Found"})
    }

    return {
        lat: response.data[0].lat,
        lon: response.data[0].lon
    }
}

export const getAqiData = async(lat,lon) =>{
    const response = await apiClient.get("/data/2.5/air_pollution",{
        params:{
            lat,
            lon,
            appid: API_KEY
        }
    });

    return response.data;
}

