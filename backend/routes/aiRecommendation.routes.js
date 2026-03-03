import { Router } from "express";
import { getCityAIReview } from "../controllers/aiRecommendation.controllers.js";


const router = Router();

router.route("/dashboard/ai_recommeded_response").post(getCityAIReview);

export default router;