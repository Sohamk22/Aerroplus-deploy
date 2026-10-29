export type AQICategory =
  | 'Good'
  | 'Satisfactory'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous'
  | 'Poor'
  | 'Very Poor'
  | 'Severe'
  | 'Unknown';

export interface PollutantDetail {
  code: string;
  name: string;
  fullName: string;
  value: number | null;
  unit: string;
  threshold: number; // CPCB 24-hr standard
  status: 'safe' | 'moderate' | 'unhealthy' | 'hazardous' | 'unavailable';
}

export interface WeatherData {
  temperature: number; // Celsius
  humidity: number; // %
  windSpeed: number; // km/h
  windDirection?: number;
  condition: string;
  stagnationRisk: 'Low' | 'Moderate' | 'Severe';
}

export interface HourlyForecastPoint {
  time: string; // ISO or '14:00'
  hour: string;
  aqi: number;
  pm25: number;
  pm10: number;
  category: AQICategory;
  color: string;
}

export interface LiveAQIResponse {
  status: 'success' | 'error';
  is_live: boolean;
  provider: string;
  timestamp: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
    state?: string;
    country?: string;
  };
  aqi: number;
  category: AQICategory;
  badge_color: string;
  dominant_pollutant: string;
  health_advisory: string;
  health_recommendations: {
    general_population: string;
    sensitive_groups: string;
    children_elderly: string;
    athletes_outdoor: string;
  };
  pollutants: Record<string, PollutantDetail>;
  weather: WeatherData;
  hourly_forecast: HourlyForecastPoint[];
  daily_forecast?: {
    date: string;
    avg_aqi: number;
    category: AQICategory;
  }[];
  weekly_series?: {
    day: string;
    aqi: number;
    pm25: number;
    pm10: number;
    no2: number;
    status: string;
  }[];
  data_source_label?: string;
  standard_name?: string;
}

export interface CitationSource {
  docName: string;
  docTitle: string;
  pageNumber?: number;
  authority: string;
  excerpt: string;
  relevanceNote?: string;
}

export interface AssistantAnswer {
  intent: string;
  headerTitle: string;
  summary: string;
  mainContent: string;
  citations: CitationSource[];
  caveats: string[];
  suggestedFollowups: string[];
  aqiSnapshot?: {
    location: string;
    aqi: number;
    category: AQICategory;
    dominantPollutant: string;
    trend?: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text?: string;
  structuredAnswer?: AssistantAnswer;
  isLoading?: boolean;
  error?: string;
}

export interface TreeSimulationParams {
  numUnits: number;
  airflowPerUnitM3h: number;
  operatingHoursPerDay: number;
  inletPm25Ugm3: number;
  inletPm10Ugm3: number;
  efficiencyPm25: number;
  powerKwPerUnit: number;
}

export interface TreeSimulationResult {
  params: TreeSimulationParams;
  dailyAirVolumeM3: number;
  annualAirVolumeMillionM3: number;
  dailyPm25RemovedKg: number;
  annualPm25RemovedKg: number;
  annualPm10RemovedKg: number;
  dailyEnergyKwh: number;
  annualEnergyKwh: number;
  dailyCostInr: number;
  annualCostInr: number;
  microZoneRadiusMeters: number;
  scientificDisclaimer: string;
}
