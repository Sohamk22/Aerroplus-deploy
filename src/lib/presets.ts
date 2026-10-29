export interface CityPreset {
  name: string;
  state: string;
  lat: number;
  lon: number;
  airshed: string;
  isPopular?: boolean;
}

export const PRESET_CITIES: Record<string, CityPreset> = {
  Delhi: { name: 'Delhi', state: 'Delhi NCR', lat: 28.6139, lon: 77.2090, airshed: 'Indo-Gangetic Plain', isPopular: true },
  Mumbai: { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777, airshed: 'Konkan Coast', isPopular: true },
  Chennai: { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, airshed: 'Coromandel Coast', isPopular: true },
  Hyderabad: { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867, airshed: 'Deccan Plateau', isPopular: true },
  Kolkata: { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639, airshed: 'Lower Gangetic Plain', isPopular: true },
  Bengaluru: { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946, airshed: 'Deccan Plateau', isPopular: true },
  Gurugram: { name: 'Gurugram', state: 'Haryana', lat: 28.4595, lon: 77.0266, airshed: 'Delhi NCR' },
  Noida: { name: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lon: 77.3910, airshed: 'Delhi NCR' },
  Patna: { name: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376, airshed: 'Indo-Gangetic Plain', isPopular: true },
  Pune: { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567, airshed: 'Western Ghats Leeward', isPopular: true },
  Lucknow: { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462, airshed: 'Central Gangetic Basin' },
  Jaipur: { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873, airshed: 'Semi-Arid Basin' },
  Ahmedabad: { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714, airshed: 'Sabarmati Basin' },
  Chandigarh: { name: 'Chandigarh', state: 'Punjab/Haryana', lat: 30.7333, lon: 76.7794, airshed: 'Sub-Himalayan Foot' },
};

export const DEFAULT_CITY = PRESET_CITIES.Delhi;

export const SUGGESTED_QUESTIONS = [
  "What's the current AQI in Delhi?",
  "Is it safe to go outside today?",
  "Should I wear a mask?",
  "How is air pollution affecting my health?",
  "Which precautions should I take today?",
  "What can I do to reduce my contribution to air pollution?",
  "What measures are authorities taking?",
  "Can I plan a trip to Delhi next week?",
];
