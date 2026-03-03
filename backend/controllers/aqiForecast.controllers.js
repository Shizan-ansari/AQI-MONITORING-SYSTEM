import axios from "axios";
import User from "../models/user.model.js";
import AQI_FORECAST_MODEL from "../models/aqi_historyForecast.models.js";
import { calculateIndianAQI } from "../services/indianAqiCalculation.services.js";

export const getAqiForecast = async (req, res) => {
  try {

    

    /* ---------------- INPUT VALIDATION ---------------- */

    let { city } = req.body;

    if (!city || city.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid city name."
      });
    }

    city = city.toLowerCase().trim();

    /* Block random characters */
    const cityRegex = /^[a-zA-Z\s]+$/;
    if (!cityRegex.test(city)) {
      return res.status(400).json({
        success: false,
        message: "That doesn't look like a valid city name."
      });
    }

    /* ---------------- GEO VALIDATION ---------------- */

    const geoRes = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${process.env.AQI_MESUREMENT_KEY}`
    );

    if (!geoRes.data || geoRes.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "City not found. Please check the spelling."
      });
    }

    const { lat, lon, name } = geoRes.data[0];

    /* ---------------- FETCH 5 DAY HISTORY ---------------- */

    const fiveDaysAgo = Math.floor(Date.now() / 1000) - (5 * 24 * 60 * 60);
    const now = Math.floor(Date.now() / 1000);

    const apiRes = await axios.get(
      `http://api.openweathermap.org/data/2.5/air_pollution/history?lat=${lat}&lon=${lon}&start=${fiveDaysAgo}&end=${now}&appid=${process.env.AQI_MESUREMENT_KEY}`
    );

    const apiData = apiRes.data.list;

    if (!apiData || apiData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Unable to fetch AQI data for this city."
      });
    }

    /* ---------------- PROCESS DATA ---------------- */

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

    if (processedHistory.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Not enough AQI data to generate prediction."
      });
    }

    /* ---------------- REPLACE OLD CITY DATA ---------------- */

    await AQI_FORECAST_MODEL.findOneAndUpdate(
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

    /* ---------------- ML PREDICTION ---------------- */

    const aqiArray = processedHistory.map(item => item.aqi);

    const pythonRes = await axios.post(
      `${process.env.PYTHON_SERVICE_URL}/predict`,
      { history: aqiArray }
    );

    const prediction = pythonRes.data.prediction;
    const todayAqi = aqiArray[aqiArray.length - 1];

    const changePercent = (
      ((prediction - todayAqi) / todayAqi) * 100
    ).toFixed(1);

    const trend =
      prediction > todayAqi ? "Increasing" :
      prediction < todayAqi ? "Decreasing" :
      "Stable";

    return res.status(200).json({
      success: true,
      city: name,
      prediction,
      category: getCategory(prediction),
      trend,
      changePercent,
      healthAdvice: getHealthAdvice(prediction)
    });

  } catch (error) {

    console.error("FORECAST ERROR:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while predicting AQI.",
      error: error.response?.data?.message || error.message
    });
  }
};


/* ---------------- CATEGORY ---------------- */

function getCategory(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";
  return "Severe";
}

/* ---------------- HEALTH ADVICE ---------------- */

function getHealthAdvice(aqi) {
  if (aqi <= 100)
    return "Air quality is acceptable for outdoor activities.";

  if (aqi <= 200)
    return "Sensitive groups should limit prolonged outdoor exertion.";

  if (aqi <= 300)
    return "Avoid outdoor exercise. Use N95 mask if going outside.";

  if (aqi <= 400)
    return "Stay indoors. Run air purifier. Avoid outdoor exposure.";

  return "Health emergency conditions. Stay indoors and avoid all outdoor activity.";
}