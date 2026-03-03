import axios from "axios";
import pkg from "@mapbox/polyline";   // ESM-safe import
import { getRealtimeAQIForMap } from "../services/aqi.services.js";

const polyline = pkg;

export const getCleanRoute = async (req, res) => {
  try {
    const { source, destination } = req.body;

    if (!source || !destination) {
      return res.status(400).json({
        success: false,
        message: "Source and destination required"
      });
    }

    /* ---------------- 1️⃣ GEOCODE ---------------- */

    const geoSource = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(source)}.json`,
      { params: { access_token: process.env.MAPBOX_TOKEN } }
    );

    const geoDest = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json`,
      { params: { access_token: process.env.MAPBOX_TOKEN } }
    );

    if (
      !geoSource.data.features.length ||
      !geoDest.data.features.length
    ) {
      return res.status(404).json({
        success: false,
        message: "Invalid city names"
      });
    }

    const sourceCoords = geoSource.data.features[0].center;
    const destCoords = geoDest.data.features[0].center;

    /* ---------------- 2️⃣ GET ROUTES ---------------- */

    const routeRes = await axios.get(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${sourceCoords[0]},${sourceCoords[1]};${destCoords[0]},${destCoords[1]}`,
      {
        params: {
          alternatives: true,
          geometries: "polyline",
          access_token: process.env.MAPBOX_TOKEN
        }
      }
    );

    const routes = routeRes.data.routes;

    if (!routes || routes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No routes found"
      });
    }

    let bestRoute = null;
    let lowestExposure = Infinity;

    /* ---------------- 3️⃣ ANALYZE EACH ROUTE ---------------- */

    for (let route of routes) {
      const decoded = polyline.decode(route.geometry);

      if (!decoded || decoded.length === 0) continue;

      const sampleCount = 12;
      const step = Math.max(1, Math.floor(decoded.length / sampleCount));

      let totalAQI = 0;
      let validPoints = 0;

      for (let i = 0; i < decoded.length; i += step) {
        const [lat, lon] = decoded[i];

        try {
          const feature = await getRealtimeAQIForMap(lat, lon);

          if (feature?.properties?.aqi) {
            totalAQI += feature.properties.aqi;
            validPoints++;
          }
        } catch (err) {
          console.error("AQI sample failed:", err.message);
        }
      }

      const avgAQI =
        validPoints > 0 ? totalAQI / validPoints : 999;

      if (avgAQI < lowestExposure) {
        lowestExposure = avgAQI;
        bestRoute = route;
      }
    }

    if (!bestRoute) {
      return res.status(500).json({
        success: false,
        message: "Failed to evaluate routes"
      });
    }

    /* ---------------- 4️⃣ RETURN RESULT ---------------- */

    return res.status(200).json({
      success: true,
      averageAQI: Math.round(lowestExposure),
      distance: (bestRoute.distance / 1000).toFixed(1),
      duration: Math.round(bestRoute.duration / 60),
      geometry: bestRoute.geometry,
      message: `Recommended route has approximately ${Math.round(
        lowestExposure
      )} average AQI exposure, which is the cleanest available path.`
    });

  } catch (err) {
    console.error("FULL CLEAN ROUTE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Clean route calculation failed",
      error: err.message
    });
  }
};




