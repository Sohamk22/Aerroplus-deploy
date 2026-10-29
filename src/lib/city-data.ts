export interface CityWeeklyPoint {
  day: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  status: string;
}

export interface CityDataEntry {
  current_aqi: number;
  clamp_bounds: {
    aqi_min: number;
    aqi_max: number;
    pm25_min: number;
    pm25_max: number;
  };
  weekly_series: CityWeeklyPoint[];
}

export interface CityDataStore {
  metadata: {
    standard: string;
    unit_pm: string;
    last_updated: string;
  };
  cities: Record<string, CityDataEntry>;
}

export const CITY_AQI_DATA: CityDataStore = {
  metadata: {
    standard: "US_EPA_AQI",
    unit_pm: "ug/m3",
    last_updated: "2026-10-30"
  },
  cities: {
    Mumbai: {
      current_aqi: 156,
      clamp_bounds: { aqi_min: 130, aqi_max: 201, pm25_min: 47.2, pm25_max: 150.5 },
      weekly_series: [
        { day: "Day 1 (Current)", aqi: 156, pm25: 65.2, pm10: 128.0, no2: 36.4, status: "Unhealthy" },
        { day: "Day 2", aqi: 148, pm25: 54.6, pm10: 115.2, no2: 33.1, status: "Unhealthy for Sensitive Groups" },
        { day: "Day 3", aqi: 139, pm25: 50.9, pm10: 108.5, no2: 30.8, status: "Unhealthy for Sensitive Groups" },
        { day: "Day 4 (Peak)", aqi: 201, pm25: 150.5, pm10: 234.0, no2: 54.2, status: "Very Unhealthy" },
        { day: "Day 5", aqi: 152, pm25: 57.4, pm10: 121.0, no2: 34.9, status: "Unhealthy" },
        { day: "Day 6", aqi: 132, pm25: 48.1, pm10: 102.4, no2: 28.5, status: "Unhealthy for Sensitive Groups" },
        { day: "Day 7", aqi: 144, pm25: 53.0, pm10: 112.0, no2: 31.7, status: "Unhealthy for Sensitive Groups" }
      ]
    },
    Delhi: {
      current_aqi: 146,
      clamp_bounds: { aqi_min: 140, aqi_max: 290, pm25_min: 51.3, pm25_max: 240.0 },
      weekly_series: [
        { day: "Day 1 (Current)", aqi: 146, pm25: 53.8, pm10: 118.5, no2: 39.2, status: "Unhealthy for Sensitive Groups" },
        { day: "Day 2", aqi: 176, pm25: 103.9, pm10: 188.0, no2: 48.5, status: "Unhealthy" },
        { day: "Day 3", aqi: 228, pm25: 177.8, pm10: 284.5, no2: 61.0, status: "Very Unhealthy" },
        { day: "Day 4 (Peak)", aqi: 283, pm25: 233.3, pm10: 368.0, no2: 74.6, status: "Very Unhealthy" },
        { day: "Day 5", aqi: 163, pm25: 78.7, pm10: 152.0, no2: 43.1, status: "Unhealthy" },
        { day: "Day 6", aqi: 185, pm25: 121.4, pm10: 210.5, no2: 52.8, status: "Unhealthy" },
        { day: "Day 7", aqi: 212, pm25: 161.6, pm10: 258.0, no2: 57.4, status: "Very Unhealthy" }
      ]
    },
    Chennai: {
      current_aqi: 152,
      clamp_bounds: { aqi_min: 130, aqi_max: 170, pm25_min: 47.2, pm25_max: 92.3 },
      weekly_series: [
        { day: "Day 1 (Current)", aqi: 152, pm25: 57.4, pm10: 119.0, no2: 31.2, status: "Unhealthy" },
        { day: "Day 2", aqi: 144, pm25: 53.0, pm10: 110.5, no2: 29.4, status: "Unhealthy for Sensitive Groups" },
        { day: "Day 3", aqi: 159, pm25: 71.0, pm10: 134.2, no2: 34.8, status: "Unhealthy" },
        { day: "Day 4", aqi: 136, pm25: 49.7, pm10: 103.0, no2: 27.1, status: "Unhealthy for Sensitive Groups" },
        { day: "Day 5", aqi: 148, pm25: 54.6, pm10: 114.8, no2: 30.5, status: "Unhealthy for Sensitive Groups" },
        { day: "Day 6", aqi: 164, pm25: 80.7, pm10: 145.0, no2: 36.9, status: "Unhealthy" },
        { day: "Day 7", aqi: 141, pm25: 51.7, pm10: 107.6, no2: 28.3, status: "Unhealthy for Sensitive Groups" }
      ]
    },
    Hyderabad: {
      current_aqi: 120,
      clamp_bounds: { aqi_min: 110, aqi_max: 150, pm25_min: 39.1, pm25_max: 55.4 },
      weekly_series: [
        { day: "Day 1 (Current)", aqi: 120, pm25: 43.2, pm10: 94.0, no2: 26.5, status: "Unhealthy for Sensitive Groups" },
        { day: "Day 2", aqi: 128, pm25: 46.4, pm10: 101.2, no2: 28.4, status: "Unhealthy for Sensitive Groups" },
        { day: "Day 3", aqi: 114, pm25: 40.8, pm10: 88.5, no2: 24.9, status: "Unhealthy for Sensitive Groups" },
        { day: "Day 4", aqi: 135, pm25: 49.3, pm10: 108.0, no2: 30.1, status: "Unhealthy for Sensitive Groups" },
        { day: "Day 5", aqi: 142, pm25: 52.1, pm10: 114.5, no2: 32.0, status: "Unhealthy for Sensitive Groups" },
        { day: "Day 6", aqi: 118, pm25: 42.4, pm10: 92.0, no2: 25.8, status: "Unhealthy for Sensitive Groups" },
        { day: "Day 7", aqi: 125, pm25: 45.2, pm10: 98.4, no2: 27.6, status: "Unhealthy for Sensitive Groups" }
      ]
    },
    Kolkata: {
      current_aqi: 148,
      clamp_bounds: { aqi_min: 135, aqi_max: 200, pm25_min: 49.3, pm25_max: 150.4 },
      weekly_series: [
        { day: "Day 1 (Current)", aqi: 148, pm25: 54.6, pm10: 116.0, no2: 33.5, status: "Unhealthy for Sensitive Groups" },
        { day: "Day 2", aqi: 162, pm25: 76.8, pm10: 142.5, no2: 38.2, status: "Unhealthy" },
        { day: "Day 3", aqi: 175, pm25: 102.0, pm10: 174.0, no2: 42.9, status: "Unhealthy" },
        { day: "Day 4", aqi: 194, pm25: 138.8, pm10: 212.0, no2: 49.1, status: "Unhealthy" },
        { day: "Day 5", aqi: 158, pm25: 69.0, pm10: 133.4, no2: 36.8, status: "Unhealthy" },
        { day: "Day 6", aqi: 142, pm25: 52.1, pm10: 111.0, no2: 31.4, status: "Unhealthy for Sensitive Groups" },
        { day: "Day 7", aqi: 166, pm25: 84.5, pm10: 151.2, no2: 39.7, status: "Unhealthy" }
      ]
    },
    Bengaluru: {
      current_aqi: 104,
      clamp_bounds: { aqi_min: 92, aqi_max: 125, pm25_min: 31.6, pm25_max: 45.2 },
      weekly_series: [
        { day: "Day 1 (Current)", aqi: 104, pm25: 36.7, pm10: 78.5, no2: 22.4, status: "Unhealthy for Sensitive Groups" },
        { day: "Day 2", aqi: 96,  pm25: 33.5, pm10: 72.0, no2: 20.1, status: "Moderate" },
        { day: "Day 3", aqi: 112, pm25: 40.0, pm10: 84.5, no2: 24.8, status: "Unhealthy for Sensitive Groups" },
        { day: "Day 4", aqi: 118, pm25: 42.4, pm10: 89.2, no2: 26.3, status: "Unhealthy for Sensitive Groups" },
        { day: "Day 5", aqi: 98,  pm25: 34.4, pm10: 74.0, no2: 21.0, status: "Moderate" },
        { day: "Day 6", aqi: 108, pm25: 38.3, pm10: 81.6, no2: 23.5, status: "Unhealthy for Sensitive Groups" },
        { day: "Day 7", aqi: 115, pm25: 41.2, pm10: 87.0, no2: 25.4, status: "Unhealthy for Sensitive Groups" }
      ]
    }
  }
};

export function getStatusStyle(status: string): { category: string; color: string; bg: string; text: string } {
  const s = status.toLowerCase();
  if (s.includes('good')) {
    return { category: 'Good', color: '#16a34a', bg: '#f0fdf4', text: '#15803d' };
  }
  if (s.includes('moderate')) {
    return { category: 'Moderate', color: '#ca8a04', bg: '#fefce8', text: '#a16207' };
  }
  if (s.includes('sensitive')) {
    return { category: 'Unhealthy for Sensitive Groups', color: '#ea580c', bg: '#fff7ed', text: '#c2410c' };
  }
  if (s.includes('very unhealthy')) {
    return { category: 'Very Unhealthy', color: '#9333ea', bg: '#faf5ff', text: '#7e22ce' };
  }
  if (s.includes('unhealthy')) {
    return { category: 'Unhealthy', color: '#dc2626', bg: '#fef2f2', text: '#b91c1c' };
  }
  if (s.includes('hazardous')) {
    return { category: 'Hazardous', color: '#7f1d1d', bg: '#fef2f2', text: '#7f1d1d' };
  }
  return { category: status, color: '#64748b', bg: '#f8fafc', text: '#334155' };
}
