import { AQICategory } from './types';

export interface CPCBInfo {
  category: AQICategory;
  color: string;
  bgLight: string;
  textColor: string;
  advisory: string;
  impact: string;
}

export function getCPCBInfo(aqi: number): CPCBInfo {
  const val = Math.round(aqi);

  if (val <= 50) {
    return {
      category: 'Good',
      color: '#16a34a',
      bgLight: '#f0fdf4',
      textColor: '#15803d',
      advisory: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
      impact: 'Minimal health impact. Enjoy outdoor activities.'
    };
  } else if (val <= 100) {
    return {
      category: 'Satisfactory',
      color: '#65a30d',
      bgLight: '#f7fee7',
      textColor: '#4d7c0f',
      advisory: 'Air quality is acceptable; minor breathing discomfort to sensitive individuals.',
      impact: 'Sensitive people should observe personal comfort during prolonged exposure.'
    };
  } else if (val <= 200) {
    return {
      category: 'Moderate',
      color: '#d97706',
      bgLight: '#fffbeb',
      textColor: '#b45309',
      advisory: 'May cause breathing discomfort to people with asthma, heart disease, and children.',
      impact: 'Unhealthy for sensitive groups. Shift intense workouts indoors or to midday.'
    };
  } else if (val <= 300) {
    return {
      category: 'Poor',
      color: '#ea580c',
      bgLight: '#fff7ed',
      textColor: '#c2410c',
      advisory: 'Breathing discomfort to most people on prolonged exposure; avoid heavy outdoor cardio.',
      impact: 'Wear certified N95 masks outdoors. Keep indoor windows closed during peak morning inversion.'
    };
  } else if (val <= 400) {
    return {
      category: 'Very Poor',
      color: '#dc2626',
      bgLight: '#fef2f2',
      textColor: '#b91c1c',
      advisory: 'Respiratory illness on prolonged exposure. Significant health impact on vulnerable groups.',
      impact: 'Strictly avoid outdoor exertion. Run HEPA air purifiers indoors and use tight-seal N95 masks.'
    };
  } else {
    return {
      category: 'Severe',
      color: '#7f1d1d',
      bgLight: '#fef2f2',
      textColor: '#7f1d1d',
      advisory: 'Emergency health warning: affects healthy people and severely impacts those with pre-existing conditions.',
      impact: 'Stay indoors with air filtration. Avoid all non-essential outdoor travel.'
    };
  }
}

/**
 * Calculates Indian CPCB AQI from PM2.5 and PM10 concentrations (µg/m³)
 * using standard Central Pollution Control Board piecewise linear breakpoints.
 */
export function calculateCPCBIndex(pm25?: number | null, pm10?: number | null): { aqi: number; dominant: string } {
  let subPm25 = 0;
  if (pm25 !== undefined && pm25 !== null && pm25 > 0) {
    if (pm25 <= 30) {
      subPm25 = (50 / 30) * pm25;
    } else if (pm25 <= 60) {
      subPm25 = 50 + (50 / 30) * (pm25 - 30);
    } else if (pm25 <= 90) {
      subPm25 = 100 + (100 / 30) * (pm25 - 60);
    } else if (pm25 <= 120) {
      subPm25 = 200 + (100 / 30) * (pm25 - 90);
    } else if (pm25 <= 250) {
      subPm25 = 300 + (100 / 130) * (pm25 - 120);
    } else {
      subPm25 = 400 + (100 / 150) * (Math.min(pm25, 450) - 250);
    }
  }

  let subPm10 = 0;
  if (pm10 !== undefined && pm10 !== null && pm10 > 0) {
    if (pm10 <= 50) {
      subPm10 = pm10;
    } else if (pm10 <= 100) {
      subPm10 = 50 + (50 / 50) * (pm10 - 50);
    } else if (pm10 <= 250) {
      subPm10 = 100 + (100 / 150) * (pm10 - 100);
    } else if (pm10 <= 350) {
      subPm10 = 200 + (100 / 100) * (pm10 - 250);
    } else if (pm10 <= 430) {
      subPm10 = 300 + (100 / 80) * (pm10 - 350);
    } else {
      subPm10 = 400 + (100 / 70) * (Math.min(pm10, 500) - 430);
    }
  }

  const aqi = Math.max(Math.round(subPm25), Math.round(subPm10));
  const dominant = subPm25 >= subPm10 ? 'PM2.5' : 'PM10';

  return { aqi: Math.max(1, aqi), dominant };
}
