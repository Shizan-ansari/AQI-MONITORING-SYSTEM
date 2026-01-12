import { Router } from "express";
import { getAqiByCity } from "../controllers/aqi.controllers.js";



const router = Router();
router.route("/get_aqi_by_city").get(getAqiByCity);

export default router;