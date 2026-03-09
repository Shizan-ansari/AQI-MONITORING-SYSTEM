import axios from "axios";
import AQI_FORECAST_MODEL from "../models/aqi_historyForecast.models.js";
import { calculateIndianAQI } from "../services/indianAqiCalculation.services.js";

//Getting detailed history of 5 days with 24 hours
export const getDetailedAQIHistory = async (req, res) => {
  try {
    let { city } = req.query;

    if (!city || city.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid city name."
      });
    }

    city = city.toLowerCase().trim();

    const cityRegex = /^[a-zA-Z\s]+$/;
    if (!cityRegex.test(city)) {
      return res.status(400).json({
        success: false,
        message: "That doesn't look like a valid city name."
      });
    }

    //checking in the db if exist
    let forecastData = await AQI_FORECAST_MODEL.findOne({ city });

    if (!forecastData) {
      //fetch aqi from the api

      const geoRes = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${process.env.AQI_MESUREMENT_KEY}`
      );

      if (!geoRes.data.length) {
        return res.status(404).json({
          success: false,
          message: "City not found."
        });
      }

      const { lat, lon } = geoRes.data[0];

      const fiveDaysAgo = Math.floor(Date.now() / 1000) - (5 * 24 * 60 * 60);
      const now = Math.floor(Date.now() / 1000);

      const apiRes = await axios.get(
        `http://api.openweathermap.org/data/2.5/air_pollution/history?lat=${lat}&lon=${lon}&start=${fiveDaysAgo}&end=${now}&appid=${process.env.AQI_MESUREMENT_KEY}`
      );

      const apiData = apiRes.data.list;

      const processedHistory = [];

      for (let item of apiData) {
        const components = item.components;

        const result = calculateIndianAQI({
          pm2_5: components.pm2_5,
          pm10: components.pm10,
          no2: components.no2,
          so2: components.so2,
          o3: components.o3,
          co: components.co
        });

        if (!result.aqi) continue;

        processedHistory.push({
          timestamp: item.dt,
          date: new Date(item.dt * 1000),
          aqi: result.aqi,
          pm25: components.pm2_5,
          pm10: components.pm10,
          no2: components.no2,
          so2: components.so2,
          co: components.co,
          o3: components.o3
        });
      }

      forecastData = await AQI_FORECAST_MODEL.findOneAndUpdate(
        { city },
        {
          city,
          lat,
          lon,
          history: processedHistory,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );
    }

    const history = forecastData.history;

    const last24h = history.slice(-24);

    return res.json({
      success: true,
      fiveDayHourly: history,
      last24Hours: last24h
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load detailed history."
    });
  }
};