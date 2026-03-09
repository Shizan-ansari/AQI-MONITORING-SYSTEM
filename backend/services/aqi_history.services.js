import { AQI_MODEL } from "../models/aqi.models.js";
import { AQI_HISTORY_MODEL } from "../models/aqi_history.models.js";

//save daily aqi snapshot for city
export const saveAQISnapshotByCity = async (city) => {
  if (!city) throw new Error("City is required");

  const normalizeCity = city.toLowerCase().trim();

  //get latest aqi 
  const latestAQI = await AQI_MODEL.findOne({ city: normalizeCity });

  if (!latestAQI) {
    throw new Error("NO_AQI_DATA_FOUND");
  }

  //normalize day start of the day 00.00
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  //db prevents duplicate if same name data exist of city
  try {
    await AQI_HISTORY_MODEL.create({
      city: normalizeCity,
      date: today,
      aqi: latestAQI.aqi.value,
      pollutants: latestAQI.pollutants
    });
  } catch (err) {
    // Duplicate (cron ran twice)
    if (err.code === 11000) {
      return { skipped: true, reason: "Already saved today" };
    }
    throw err;
  }

  //keep only last 7 days data
  const records = await AQI_HISTORY_MODEL.find({ city: normalizeCity })
    .sort({ date: -1 });

  if (records.length > 7) {
    const excess = records.slice(7);
    await AQI_HISTORY_MODEL.deleteMany({
      _id: { $in: excess.map(r => r._id) }
    });
  }

  return {
    success: true,
    city: normalizeCity
  };
};
