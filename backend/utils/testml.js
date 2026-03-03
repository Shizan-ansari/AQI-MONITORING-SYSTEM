import axios from "axios";

export default async function handler(req, res) {
  try {
    const response = await axios.post(
      "http://127.0.0.1:5000/predict",
      {
        history: [150, 170, 180, 200, 220, 250]
      }
    );

    res.status(200).json(response.data);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Python service not reachable" });
  }
}
