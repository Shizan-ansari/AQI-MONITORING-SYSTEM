import { Router } from "express";
import { getCityAIReview } from "../controllers/aiRecommendation.controllers.js";


const router = Router();

router.route("/dashboard/ai_recommeded_response").get(getCityAIReview);

export default router;