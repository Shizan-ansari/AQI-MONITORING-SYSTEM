import mongoose from "mongoose";

const hourlyHistorySchema = new mongoose.Schema(
  {
    timestamp: {
      type: Number,
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    aqi: {
      type: Number,
      required: true,
      min: 0,
      max: 500
    },

    pm25: Number,
    pm10: Number,
    no2: Number,
    so2: Number,
    co: Number,
    o3: Number
  },
  { _id: false }
);

const aqiForecastSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,   //ONLY ONE DOCUMENT PER CITY
      index: true
    },

    lat: {
      type: Number,
      required: true
    },

    lon: {
      type: Number,
      required: true
    },

    // Entire 5-day hourly history stored here
    history: {
      type: [hourlyHistorySchema],
      required: true
    },

    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

/* Ensure unique city constraint */
aqiForecastSchema.index({ city: 1 }, { unique: true });

export default mongoose.models.AqiHistoryForecast ||
  mongoose.model("AqiHistoryForecast", aqiForecastSchema);