import mongoose from "mongoose";
const PM25_BREAKPOINTS = [
    {bpLo:0,bpHi:30,iLo:0,iHi:50},
    {bpLo:31,bpHi:60,iLo:51,iHi:100},
    {bpLo:61,bpHi:90,iLo:101,iHi:200},
    {bpLo:91,bpHi:120,iLo:201,iHi:300},
    {bpLo:121,bpHi:250,iLo:301,iHi:400},
    {bpLo:251,bpHi:500,iLo:401,iHi:500},
];

const calculateIndianAqi = (pm25) =>{
    const bp = PM25_BREAKPOINTS.find(
        b => pm25 >= b.bpLo && pm25 <= b.bpHi
    );
    if(!bp){
        return null;
    }

    return Math.round(
        ((bp.iHi - bp.iLo) / (bp.bpHi - bp.bpLo)) * 
        (pm25 - bp.bpLo) + bp.iLo
    );
};

const getAqiCategory = (aqi) =>{
    if(aqi <= 50) return "Good";
    if(aqi <= 100) return "Satisfactory";
    if(aqi <= 200) return "Moderate";
    if(aqi <= 300) return "Poor";
    if(aqi <= 400) return "Very Poor";
    return "Severe"
}

export const AqiSchema = new mongoose.Schema({
    city:{
        type: String,
        required: true,
        unique: true,
        index: true
    },
    coordinates:{
        lat: Number,
        lon: Number
    },
    aqi:{
        value:Number,
        category: String,
        standard:{
            type: String,
            default: "CPCB (India)"
        }

    },
    pollutants:{
        pm2_5: Number,
        pm10: Number,
        no2: Number,
        so2: Number,
        o3: Number,
        co: Number
    },
    timestamp:{
        type: Date,
        required: true,

    },
    
},
{timestamps: true}
);

AqiSchema.statics.buildFromAPI = function (city, lat, lon, rawData) {
  const data = rawData.list[0];
  const components = data.components;

  const indianAqi = calculateIndianAqi(components.pm2_5);

  return {
    city,
    coordinates: { lat, lon },
    aqi: {
      value: indianAqi,
      category: getAqiCategory(indianAqi),
      standard: "CPCB (India)"
    },
    pollutants: {
      pm2_5: components.pm2_5,
      pm10: components.pm10,
      no2: components.no2,
      so2: components.so2,
      o3: components.o3,
      co: components.co
    },
    timestamp: new Date(data.dt * 1000)
  };
};

export const AQI_MODEL = new mongoose.model("AQI_DATA", AqiSchema);

