import mongoose from "mongoose";

const AQI_HISTORY_SCHEMA = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },

    /*  KEY CHANGE */
    date: {
      type: Date,
      required: true,
      index: true
    },

    aqi: {
      type: Number,
      required: true
    },

    pollutants: {
      pm2_5: Number,
      pm10: Number,
      no2: Number,
      o3: Number,
      so2: Number,
      co: Number
    }
  },
  {
    timestamps: true,   // createdAt / updatedAt
    versionKey: false
  }
);

/*  HARD GUARANTEE: one city per day */
AQI_HISTORY_SCHEMA.index(
  { city: 1, date: 1 },
  { unique: true }
);

/* Optional: fast graph queries */
AQI_HISTORY_SCHEMA.index({ city: 1, date: -1 });

export const AQI_HISTORY_MODEL =
  mongoose.models.AQI_HISTORY ||
  mongoose.model("AQI_HISTORY", AQI_HISTORY_SCHEMA);
