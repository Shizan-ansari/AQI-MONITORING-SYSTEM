import { TRAVEL_RECOMMENDATION_MODEL } from "../models/travel_recommendation.models.js";
import { generateTravelRecommendation } from "../services/travel_recommendation.services.js";

export const getTravelRecommendation = async (req, res) => {
  try {
    //normalize and validate input

    const destinationRaw = req.query.destination;

    if (
      !destinationRaw ||
      typeof destinationRaw !== "string" ||
      destinationRaw.trim().length < 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid destination city is required"
      });
    }

    const input = {
      // normalized city
      destination: destinationRaw.toLowerCase().trim(),

      ageGroup: req.query.ageGroup,
      outdoorExposure: req.query.outdoorExposure,
      activityIntensity: req.query.activityIntensity,
      maskType: req.query.maskType,
      aqiAwareness: req.query.aqiAwareness,

      // normalize array
      healthConditions: Array.isArray(req.query.healthConditions)
        ? req.query.healthConditions
        : req.query.healthConditions
        ? [req.query.healthConditions]
        : ["none"],

      // normalize booleans safely
      airPurifier: String(req.query.airPurifier) === "true",
      canPostponeTravel: String(req.query.canPostponeTravel) === "true",

      recommendationDetail: req.query.recommendationDetail || "standard"
    };

    //store user input

    await TRAVEL_RECOMMENDATION_MODEL.create(input);

   //generate recommendation

    const result = await generateTravelRecommendation(input);

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (err) {
    console.error("Travel Recommendation Error:", err.message);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to generate recommendation"
    });
  }
};
