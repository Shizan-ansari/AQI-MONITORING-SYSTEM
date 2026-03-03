// Generic CPCB sub-index calculator
const calculateSubIndex = (C, breakpoints) => {
  for (const bp of breakpoints) {
    if (C >= bp.clo && C <= bp.chi) {
      return Math.round(
        ((bp.ihi - bp.ilo) / (bp.chi - bp.clo)) *
          (C - bp.clo) +
          bp.ilo
      );
    }
  }
  return null;
};

// SAFE wrapper (FIXED )
const safeSubIndex = (value, breakpoints) => {
  if (value === undefined || value === null) return null;

  const num = Number(value);
  if (Number.isNaN(num)) return null;

  return calculateSubIndex(num, breakpoints);
};

// CPCB Breakpoints
const PM25 = [
  { clo: 0, chi: 30, ilo: 0, ihi: 50 },
  { clo: 31, chi: 60, ilo: 51, ihi: 100 },
  { clo: 61, chi: 90, ilo: 101, ihi: 200 },
  { clo: 91, chi: 120, ilo: 201, ihi: 300 },
  { clo: 121, chi: 250, ilo: 301, ihi: 400 },
  { clo: 251, chi: 500, ilo: 401, ihi: 500 }
];

const PM10 = [
  { clo: 0, chi: 50, ilo: 0, ihi: 50 },
  { clo: 51, chi: 100, ilo: 51, ihi: 100 },
  { clo: 101, chi: 250, ilo: 101, ihi: 200 },
  { clo: 251, chi: 350, ilo: 201, ihi: 300 },
  { clo: 351, chi: 430, ilo: 301, ihi: 400 },
  { clo: 431, chi: 600, ilo: 401, ihi: 500 }
];

const NO2 = [
  { clo: 0, chi: 40, ilo: 0, ihi: 50 },
  { clo: 41, chi: 80, ilo: 51, ihi: 100 },
  { clo: 81, chi: 180, ilo: 101, ihi: 200 },
  { clo: 181, chi: 280, ilo: 201, ihi: 300 },
  { clo: 281, chi: 400, ilo: 301, ihi: 400 },
  { clo: 401, chi: 600, ilo: 401, ihi: 500 }
];

const SO2 = [
  { clo: 0, chi: 40, ilo: 0, ihi: 50 },
  { clo: 41, chi: 80, ilo: 51, ihi: 100 },
  { clo: 81, chi: 380, ilo: 101, ihi: 200 },
  { clo: 381, chi: 800, ilo: 201, ihi: 300 },
  { clo: 801, chi: 1600, ilo: 301, ihi: 400 },
  { clo: 1601, chi: 2000, ilo: 401, ihi: 500 }
];

const O3 = [
  { clo: 0, chi: 50, ilo: 0, ihi: 50 },
  { clo: 51, chi: 100, ilo: 51, ihi: 100 },
  { clo: 101, chi: 168, ilo: 101, ihi: 200 },
  { clo: 169, chi: 208, ilo: 201, ihi: 300 },
  { clo: 209, chi: 748, ilo: 301, ihi: 400 },
  { clo: 749, chi: 1000, ilo: 401, ihi: 500 }
];

const CO = [
  { clo: 0, chi: 1.0, ilo: 0, ihi: 50 },
  { clo: 1.1, chi: 2.0, ilo: 51, ihi: 100 },
  { clo: 2.1, chi: 10, ilo: 101, ihi: 200 },
  { clo: 10.1, chi: 17, ilo: 201, ihi: 300 },
  { clo: 17.1, chi: 34, ilo: 301, ihi: 400 },
  { clo: 34.1, chi: 50, ilo: 401, ihi: 500 }
];

//  FINAL INDIAN AQI CALCULATOR
export const calculateIndianAQI = (pollutants) => {
  // console.log(" Pollutants received by AQI:", pollutants);

  const indexes = [
    safeSubIndex(pollutants.pm2_5, PM25),
    safeSubIndex(pollutants.pm10, PM10),
    safeSubIndex(pollutants.no2, NO2),
    safeSubIndex(pollutants.so2, SO2),
    safeSubIndex(pollutants.o3, O3),
    safeSubIndex(pollutants.co, CO)
  ].filter((v) => typeof v === "number");

  if (indexes.length === 0) {
    return { aqi: null, category: "Data unavailable" };
  }

  const aqi = Math.max(...indexes);

  let category = "Good";
  if (aqi > 400) category = "Severe";
  else if (aqi > 300) category = "Very Poor";
  else if (aqi > 200) category = "Poor";
  else if (aqi > 100) category = "Moderate";
  else if (aqi > 50) category = "Satisfactory";

  return { aqi, category };
};
