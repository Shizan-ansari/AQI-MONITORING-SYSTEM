import { calculateIndianAQI } from "./indianAqiCalculation.services.js";
import { getAndStoreAQiDataByCity } from "./aqi.services.js";
import { callGemini } from "../utils/geminiClient.js";
import { callGroq } from "../utils/groqClient.js";

export const generateTravelRecommendation = async (input) => {
  // Fetch pollutant data (already stored by you)
  const pollutants = await getAndStoreAQiDataByCity(input.destination);

  if (!pollutants || typeof pollutants !== "object") {
    throw new Error("Pollutant data not available for this city");
  }

  // Normalize pollutants (VERY IMPORTANT)
  const toNumber = (v) =>
    v === undefined || v === null || isNaN(v) ? null : Number(v);

  const normalizedPollutants = {
    pm2_5: toNumber(pollutants.pm2_5 ?? pollutants.pm2_5),
    pm10: toNumber(pollutants.pm10),
    no2: toNumber(pollutants.no2),
    so2: toNumber(pollutants.so2),
    o3: toNumber(pollutants.o3),
    co: toNumber(pollutants.co)
  };

  // Calculate CPCB AQI
  const { aqi, category } = calculateIndianAQI(normalizedPollutants);

  //  Risk score (use safe AQI)
  let riskScore = 0;
  const safeAqi = typeof aqi === "number" ? aqi : 0;

  if (safeAqi > 300) riskScore += 5;
  else if (safeAqi > 200) riskScore += 4;
  else if (safeAqi > 100) riskScore += 2;

  if (input.ageGroup !== "adult") riskScore += 2;
  if (
  Array.isArray(input.healthConditions) &&
  !input.healthConditions.includes("none")
) {
  riskScore += 3;
}

  if (input.outdoorExposure === ">3hr") riskScore += 3;
  if (input.activityIntensity === "heavy") riskScore += 3;

  if (input.maskType === "n95") riskScore -= 2;
  if (input.maskType === "n99") riskScore -= 3;
  if (input.airPurifier) riskScore -= 2;

  //  Final recommendation
  let recommendation = "Safe to travel";

  if (riskScore >= 8) {
    recommendation = input.canPostponeTravel
      ? "Avoid travel"
      : "Travel only if unavoidable";
  } else if (riskScore >= 5) {
    recommendation = "Travel with precautions";
  }

  //  Gemini prompt (SHORT & SAFE)
  const detailInstruction =
  input.recommendationDetail === "short"
    ? "Provide a concise but helpful response (~150–200 words)."
    : input.recommendationDetail === "standard"
    ? "Provide a well-explained, user-friendly response with clear sections (~300–400 words)."
    : "Provide a detailed, UI-ready response with clear headings and bullet points (~500–600 words).";

const prompt = `
City: ${input.destination}
Indian AQI (CPCB): ${aqi ?? "Unavailable"} (${category})
Age Group: ${input.ageGroup}
Health Conditions: ${input.healthConditions.join(", ")}
Outdoor Exposure: ${input.outdoorExposure}
Activity Intensity: ${input.activityIntensity}

${detailInstruction}

Rules:
- This response will be shown directly in a UI
- Use clear headings and bullet points
- Keep tone calm, professional, and reassuring
- Avoid medical diagnosis
- Base advice strictly on the provided inputs
`;

//  Gemini FAIL-SAFE (MOST IMPORTANT)
  let aiAdvice = "AI recommendations are temporarily unavailable.";

  try {
    const response = await callGroq(prompt);
    if (response) aiAdvice = response;
  } catch (err) {
    console.warn("⚠️ Gemini failed:", err.message);
  }

  // Final response
  return {
    destination: input.destination,
    aqi,
    category,
    riskScore,
    recommendation,
    aiAdvice
  };
};
