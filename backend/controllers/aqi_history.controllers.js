import { AQI_HISTORY_MODEL } from "../models/aqi_history.models.js";
import { saveAQISnapshotByCity } from "../services/aqi_history.services.js";

//manual snapshot for test only
export const saveAQISnapshotController = async (req, res) => {
  try {
    const { city } = req.body;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "City is required"
      });
    }

    const result = await saveAQISnapshotByCity(city);

    return res.status(200).json({
      success: true,
      result
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

//getting aqi history
export const getAQIHistoryByCity = async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "City is required"
      });
    }
    const normalizedCity = city.toLowerCase().trim();

    const history = await AQI_HISTORY_MODEL.find({
      city: city.toLowerCase().trim()
    })
      .sort({ date: 1 })
      .select("date aqi pollutants -_id");

    return res.status(200).json({
      success: true,
      city: normalizedCity,
      data: history
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
