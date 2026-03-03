import mongoose from "mongoose";

export const TRAVEL_RECOMMENDATION_SCHEMA = new mongoose.Schema({
    destination:{
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    ageGroup:{
        type: String,
        enum: ["child", "adult", "senior"],
        required: true
    },
    healthConditions:{
        type: [String],
        enum: ["asthma", "copd", "heart", "none"],
        default:["none"]
    },
    outdoorExposure:{
        type: String,
        enum:["<1hr", "1-3hr",">3hr"],
        required: true
    },
    activityIntensity:{
        type: String,
        enum:["light", "moderate", "heavy"],
        required: true
    },
    airPurifier:{
        type: Boolean,
        default: false
    },
    maskType: {
        type: String,
        enum:["none","cloth","n95", "n99"],
        required: true,

    },
    aqiAwareness:{
        type: String,
        enum:["low","medium","high"],
        required: true
    },
    canPostponeTravel:{
        type: Boolean,
        required: true
    },
    recommendationDetail:{
        type:String,
        enum:["short","standard","detail"],
        default:"standard"
    }
},
{timestamps: true}
)

export const TRAVEL_RECOMMENDATION_MODEL = new mongoose.model("travel_recommendation", TRAVEL_RECOMMENDATION_SCHEMA);