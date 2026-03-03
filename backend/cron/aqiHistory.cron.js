import cron from "node-cron";
import { AQI_MODEL } from "../models/aqi.models.js";
import { saveAQISnapshotByCity } from "../services/aqi_history.services.js";

export const startAQIHistoryCron = () => {
  cron.schedule("5 0 * * *", async () => {
    console.log("🌙 AQI History Cron Started");

    const cities = await AQI_MODEL.distinct("city");

    for (const city of cities) {
      try {
        await saveAQISnapshotByCity(city);
        console.log(`✅ Snapshot saved for ${city}`);
      } catch (err) {
        console.error(`❌ ${city}:`, err.message);
      }
    }
  });
};
