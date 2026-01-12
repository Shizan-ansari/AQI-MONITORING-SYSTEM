import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

export const callGemini = async (prompt) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;


  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  const data = await response.json();
  

  if (data.error) {
    throw new Error(data.error.message);
  }

  if (!data.candidates || !data.candidates.length) {
    throw new Error("No response from Gemini AI");
  }

  return data.candidates[0].content.parts[0].text;
};
