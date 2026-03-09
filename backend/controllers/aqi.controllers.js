import { getAndStoreAQiDataByCity, getRealtimeAQIForMap } from "../services/aqi.services.js";
import { saveAQISnapshotByCity } from "../services/aqi_history.services.js";


export const getAqiByCity = async (req, res) => {
  try {
    const { city } = req.body;
    if (!city) {
      return res.status(400).json({ message: "City Name is required" });
    }

    
    const AqiData = await getAndStoreAQiDataByCity(city);

  
    saveAQISnapshotByCity(city)
      .catch(err => console.log("History skip:", err.message));

    return res.status(200).json(AqiData);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMapAQI = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: "lat and lon are required"
      });
    }

    const feature = await getRealtimeAQIForMap(lat, lon);

    res.status(200).json({
      success: true,
      data: feature
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch AQI for map",
      error: err.message
    });
  }
};