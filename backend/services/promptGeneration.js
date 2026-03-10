import { callGroq } from "../utils/groqClient.js";


export const generateAQIRecommendation = async (aqiData) =>{
    const prompt= `
    You are an environmental health expert.

    City: ${aqiData.city}
    AQI VALUE : ${aqiData.aqi}

    pollutants level : 
    pm2_5: ${aqiData.pollutants.pm2_5}
    pm10: ${aqiData.pollutants.pm10}
    no2: ${aqiData.pollutants.no2}
    so2: ${aqiData.pollutants.so2}
    o3: ${aqiData.pollutants.o3}
    co: ${aqiData.pollutants.co}

    Task: 
    Give a detailed 200 words and in points format, easy to understand health recommendation.
    Include:
    -Current health impact
    -Outdoor activity
    -Mask/Precautions tips
    -Advice for children, elderly, and asthma patients
    -What to do if Aqi remains high for days
    -Which types of foods should avoid 

    `;

    return await callGroq(prompt);
}