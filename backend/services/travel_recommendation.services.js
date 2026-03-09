import { calculateIndianAQI } from "./indianAqiCalculation.services.js";
import { getAndStoreAQiDataByCity } from "./aqi.services.js";
import { callGroq } from "../utils/groqClient.js";

  //formating ai response

const cleanAIText = (text) => {
  if (!text) return "";

  return text
    .replace(/\*\*/g, "")        
    .replace(/\*/g, "")          
    .replace(/undefined/g, "")   
    .replace(/\r/g, "")
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join("\n\n");   
};
  
export const generateTravelRecommendation = async (input) => {
  //fetching polutants data
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
- The response will be displayed directly inside a web UI.
- Write in clear, readable paragraphs with proper spacing.
- Start each section with a short heading followed by a colon.
- Leave one blank line between sections.
- Do NOT use *, **, -, or markdown formatting.
- Do NOT use numbered lists like 1,2,3.
- Avoid repeating numbers or symbols in headings.
- Each section should contain 2–3 sentences maximum.
- Use simple and friendly language suitable for travelers.
- Focus only on the provided inputs (AQI, age group, exposure, etc.).
- Do NOT include any technical explanations or AI disclaimers.
`;

let aiAdvice = "AI recommendations are temporarily unavailable.";

try {

  const response = await callGroq(prompt);

  if (response) {
    aiAdvice = cleanAIText(response);
  }

} catch (err) {
  console.warn("⚠️ AI failed:", err.message);
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
