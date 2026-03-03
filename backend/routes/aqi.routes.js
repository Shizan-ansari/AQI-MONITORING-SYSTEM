import { Router } from "express";
import { getAqiByCity, getMapAQI } from "../controllers/aqi.controllers.js";
import { getAQIHistoryByCity, saveAQISnapshotController } from "../controllers/aqi_history.controllers.js";
import { getTravelRecommendation } from "../controllers/travel_recommendation.controllers.js";
import { getAqiForecast } from "../controllers/aqiForecast.controllers.js";
import { getDetailedAQIHistory } from "../controllers/get_detailed_history.controllers.js";
import { getCleanRoute } from "../controllers/travel.controllers.js";



const router = Router();
router.route("/get_aqi_by_city").post(getAqiByCity);
router.route("/snapshot").post(saveAQISnapshotController);
router.route("/get_aqi_history_graph").get(getAQIHistoryByCity);
router.route("/get_travel_recommendation").get(getTravelRecommendation);
router.route("/get_detailed_history").get(getDetailedAQIHistory);
router.route("/map").get(getMapAQI);
router.route("/clean-route").post(getCleanRoute);
router.route("/forecast").post(getAqiForecast);

export default router;