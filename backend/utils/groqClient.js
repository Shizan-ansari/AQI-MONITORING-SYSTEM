import axios from "axios";

export const callGroq = async (prompt) => {
  if (process.env.ENABLE_AI !== "true") {
    return null;
  }

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
               `
                You are a travel health advisory assistant.
                Give clear, structured, and moderately detailed advice.
                Explain health risks, precautions, and who should be extra careful.
                Avoid diagnosis.Use numbered sections instead of markdown or stars.
Do not use ** or * symbols.
Separate paragraphs clearly.
                `
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 700
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROK_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.warn(
      "⚠️ Groq failed:",
      error.response?.data?.error?.message || error.message
    );
    return null; // NEVER crash API
  }
};
