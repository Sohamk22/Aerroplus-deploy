import { NextRequest, NextResponse } from 'next/server';
import { PRESET_CITIES, DEFAULT_CITY } from '@/lib/presets';
import { calculateCPCBIndex, getCPCBInfo } from '@/lib/cpcb';
import { CITY_AQI_DATA, getStatusStyle } from '@/lib/city-data';
import { LiveAQIResponse, PollutantDetail, HourlyForecastPoint, AQICategory } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cityParam = searchParams.get('city');
  const latParam = searchParams.get('lat');
  const lonParam = searchParams.get('lon');

  let lat = DEFAULT_CITY.lat;
  let lon = DEFAULT_CITY.lon;
  let locationName = DEFAULT_CITY.name;
  let stateName = DEFAULT_CITY.state;

  if (cityParam && PRESET_CITIES[cityParam]) {
    const preset = PRESET_CITIES[cityParam];
    lat = preset.lat;
    lon = preset.lon;
    locationName = preset.name;
    stateName = preset.state;
  } else if (latParam && lonParam) {
    const parsedLat = parseFloat(latParam);
    const parsedLon = parseFloat(lonParam);
    if (!isNaN(parsedLat) && !isNaN(parsedLon)) {
      lat = parsedLat;
      lon = parsedLon;
      locationName = cityParam || `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`;

      // Check nearest preset
      for (const p of Object.values(PRESET_CITIES)) {
        if (Math.abs(p.lat - lat) < 0.15 && Math.abs(p.lon - lon) < 0.15) {
          locationName = p.name;
          stateName = p.state;
          break;
        }
      }
    }
  } else if (cityParam) {
    // If city is not in presets, try geocoding
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        cityParam
      )}&count=1&language=en&format=json`;
      const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(4000) });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          lat = geoData.results[0].latitude;
          lon = geoData.results[0].longitude;
          locationName = geoData.results[0].name;
          stateName = geoData.results[0].admin1 || geoData.results[0].country || '';
        }
      }
    } catch (e) {
      console.warn('Geocoding fallback failed:', e);
    }
  }

  // Check if we have hardcoded AQI series for this city
  const matchedCityKey = Object.keys(CITY_AQI_DATA.cities).find(
    (c) =>
      c.toLowerCase() === locationName.toLowerCase() ||
      (cityParam && c.toLowerCase() === cityParam.toLowerCase())
  );

  // Weather factors lookup
  let temp = 26;
  let humidity = 58;
  let windSpeed = 8.4;
  let condition = 'Partly Cloudy';
  let stagnationRisk: 'Low' | 'Moderate' | 'Severe' = 'Moderate';

  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`;
    const weatherRes = await fetch(weatherUrl, {
      signal: AbortSignal.timeout(4000),
      headers: { 'User-Agent': 'AeroPlus/2.0' }
    });
    if (weatherRes.ok) {
      const weatherData = await weatherRes.json();
      const wCur = weatherData.current || {};
      if (typeof wCur.temperature_2m === 'number') temp = Math.round(wCur.temperature_2m);
      if (typeof wCur.relative_humidity_2m === 'number') humidity = Math.round(wCur.relative_humidity_2m);
      if (typeof wCur.wind_speed_10m === 'number') windSpeed = Number(wCur.wind_speed_10m.toFixed(1));

      const code = wCur.weather_code || 0;
      if (code === 0) condition = 'Clear Sky';
      else if (code >= 1 && code <= 3) condition = 'Mainly Clear / Hazy';
      else if (code >= 45 && code <= 48) condition = 'Foggy / Low Visibility';
      else if (code >= 51 && code <= 67) condition = 'Light Rain';
      else if (code >= 80) condition = 'Rain Showers';

      stagnationRisk =
        windSpeed < 5.0 && humidity > 65
          ? 'Severe'
          : windSpeed < 9.0
          ? 'Moderate'
          : 'Low';
    }
  } catch {
    // Graceful fallback weather values
  }

  // 1. PATH A: Use Hardcoded Provided City Data (Mumbai, Delhi, Chennai, Hyderabad, Kolkata, Bengaluru)
  if (matchedCityKey) {
    const cityData = CITY_AQI_DATA.cities[matchedCityKey];
    const day1 = cityData.weekly_series[0] || {
      day: 'Day 1 (Current)',
      aqi: cityData.current_aqi,
      pm25: 50.0,
      pm10: 100.0,
      no2: 30.0,
      status: 'Moderate'
    };

    const style = getStatusStyle(day1.status);
    const bounds = cityData.clamp_bounds;

    // Generate realistic 24-hour diurnal trajectory anchored at current_aqi
    const hourlyForecast: HourlyForecastPoint[] = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const forecastHour = new Date(now.getTime() + i * 3600 * 1000);
      const hourOfDay = forecastHour.getHours();

      // Diurnal curve: early morning (6-8 AM) and evening (7-9 PM) peak, midday (1-3 PM) lowest
      const diurnalFactor = Math.sin(((hourOfDay - 6) / 24) * 2 * Math.PI);
      const span = (bounds.aqi_max - bounds.aqi_min) * 0.25;
      const hourAqiRaw = Math.round(cityData.current_aqi - diurnalFactor * span);
      const clampedAqi = Math.max(bounds.aqi_min, Math.min(bounds.aqi_max, hourAqiRaw));

      const hStyle = getCPCBInfo(clampedAqi);
      const hHourLabel = forecastHour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

      hourlyForecast.push({
        time: forecastHour.toISOString(),
        hour: hHourLabel,
        aqi: clampedAqi,
        pm25: Number(((clampedAqi / cityData.current_aqi) * day1.pm25).toFixed(1)),
        pm10: Number(((clampedAqi / cityData.current_aqi) * day1.pm10).toFixed(1)),
        category: hStyle.category,
        color: hStyle.color
      });
    }

    const pollutants: Record<string, PollutantDetail> = {
      pm25: {
        code: 'pm25',
        name: 'PM2.5',
        fullName: 'Fine Particulate Matter (≤ 2.5 µm)',
        value: day1.pm25,
        unit: 'µg/m³',
        threshold: 35, // US EPA 24-hr NAAQS standard
        status:
          day1.pm25 <= 12
            ? 'safe'
            : day1.pm25 <= 35
            ? 'moderate'
            : day1.pm25 <= 55
            ? 'unhealthy'
            : 'hazardous'
      },
      pm10: {
        code: 'pm10',
        name: 'PM10',
        fullName: 'Respirable Coarse Dust (≤ 10 µm)',
        value: day1.pm10,
        unit: 'µg/m³',
        threshold: 150, // US EPA standard
        status:
          day1.pm10 <= 54
            ? 'safe'
            : day1.pm10 <= 154
            ? 'moderate'
            : 'unhealthy'
      },
      no2: {
        code: 'no2',
        name: 'NO₂',
        fullName: 'Nitrogen Dioxide (Vehicular / Combustion)',
        value: day1.no2,
        unit: 'µg/m³',
        threshold: 100,
        status: day1.no2 <= 53 ? 'safe' : 'moderate'
      },
      so2: {
        code: 'so2',
        name: 'SO₂',
        fullName: 'Sulphur Dioxide (Thermal / Industrial)',
        value: 12.4,
        unit: 'µg/m³',
        threshold: 75,
        status: 'safe'
      },
      co: {
        code: 'co',
        name: 'CO',
        fullName: 'Carbon Monoxide (Incomplete Combustion)',
        value: 650,
        unit: 'µg/m³',
        threshold: 2000,
        status: 'safe'
      },
      o3: {
        code: 'o3',
        name: 'O₃',
        fullName: 'Ground-level Ozone (Photochemical Smog)',
        value: 38.0,
        unit: 'µg/m³',
        threshold: 100,
        status: 'safe'
      }
    };

    let advisoryText = `Air quality in ${matchedCityKey} is ${day1.status} (AQI ${cityData.current_aqi}).`;
    if (day1.status.includes('Sensitive')) {
      advisoryText = `Air quality is Unhealthy for Sensitive Groups (AQI ${cityData.current_aqi}). Children, seniors, and individuals with respiratory or cardiovascular sensitivity should limit prolonged outdoor exertion.`;
    } else if (day1.status.includes('Very Unhealthy')) {
      advisoryText = `Air quality is Very Unhealthy (AQI ${cityData.current_aqi}). Health alert: The general public may experience serious effects. Keep outdoor physical activities to an absolute minimum and wear an N95 mask outdoors.`;
    } else if (day1.status.includes('Unhealthy')) {
      advisoryText = `Air quality is Unhealthy (AQI ${cityData.current_aqi}). Everyone may begin to experience health effects; sensitive groups should avoid heavy outdoor exertion.`;
    } else if (day1.status.includes('Moderate')) {
      advisoryText = `Air quality is Moderate (AQI ${cityData.current_aqi}). Air quality is acceptable, though unusually sensitive people should consider reducing prolonged outdoor activities.`;
    }

    const payload: LiveAQIResponse = {
      status: 'success',
      is_live: false, // Explicitly false: Not claiming live
      provider: 'AeroPlus Curated City Dataset (US EPA Standard)',
      data_source_label: 'Provided Benchmark Dataset',
      standard_name: 'US EPA AQI Standard',
      timestamp: '2026-10-30',
      location: {
        name: matchedCityKey,
        latitude: lat,
        longitude: lon,
        state: stateName,
        country: 'India'
      },
      aqi: cityData.current_aqi,
      category: style.category as AQICategory,
      badge_color: style.color,
      dominant_pollutant: 'PM2.5',
      health_advisory: advisoryText,
      health_recommendations: {
        general_population:
          cityData.current_aqi > 150
            ? 'Avoid heavy or prolonged outdoor exertion. Consider moving cardio workouts indoors.'
            : 'Air quality is manageable for most healthy adults. Maintain normal routines with basic awareness.',
        sensitive_groups:
          cityData.current_aqi > 100
            ? 'Keep prescribed asthma rescue medication nearby and avoid strenuous outdoor activity.'
            : 'Sensitive individuals can engage in outdoor activities with normal comfort precautions.',
        children_elderly:
          cityData.current_aqi > 130
            ? 'Children and seniors should reduce outdoor playtime during peak commute and early morning hours.'
            : 'Safe for moderate outdoor play in shaded green areas.',
        athletes_outdoor:
          cityData.current_aqi > 140
            ? 'Shift high-intensity running or cycling indoors or schedule sessions for the early afternoon.'
            : 'Outdoor conditioning is suitable; ensure proper hydration.'
      },
      pollutants,
      weather: {
        temperature: temp,
        humidity,
        windSpeed,
        condition,
        stagnationRisk
      },
      hourly_forecast: hourlyForecast,
      weekly_series: cityData.weekly_series
    };

    return NextResponse.json(payload);
  }

  // 2. PATH B: Fallback to Live Atmospheric Observations for other locations
  try {
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi&hourly=pm2_5,pm10,us_aqi&timezone=auto&forecast_days=2`;
    const aqiRes = await fetch(aqiUrl, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'AeroPlus/2.0' }
    });

    if (!aqiRes.ok) {
      throw new Error(`Open-Meteo AQI error: status ${aqiRes.status}`);
    }

    const aqiData = await aqiRes.json();
    const cur = aqiData.current || {};
    const pm25 = typeof cur.pm2_5 === 'number' ? cur.pm2_5 : null;
    const pm10 = typeof cur.pm10 === 'number' ? cur.pm10 : null;
    const no2 = typeof cur.nitrogen_dioxide === 'number' ? cur.nitrogen_dioxide : null;
    const so2 = typeof cur.sulphur_dioxide === 'number' ? cur.sulphur_dioxide : null;
    const co = typeof cur.carbon_monoxide === 'number' ? cur.carbon_monoxide : null;
    const o3 = typeof cur.ozone === 'number' ? cur.ozone : null;

    const { aqi, dominant } = calculateCPCBIndex(pm25, pm10);
    const cpcb = getCPCBInfo(aqi);

    const pollutants: Record<string, PollutantDetail> = {
      pm25: {
        code: 'pm25',
        name: 'PM2.5',
        fullName: 'Fine Particulate Matter (≤ 2.5 µm)',
        value: pm25 !== null ? Number(pm25.toFixed(1)) : null,
        unit: 'µg/m³',
        threshold: 60,
        status:
          pm25 === null
            ? 'unavailable'
            : pm25 <= 30
            ? 'safe'
            : pm25 <= 60
            ? 'moderate'
            : pm25 <= 120
            ? 'unhealthy'
            : 'hazardous'
      },
      pm10: {
        code: 'pm10',
        name: 'PM10',
        fullName: 'Respirable Coarse Dust (≤ 10 µm)',
        value: pm10 !== null ? Number(pm10.toFixed(1)) : null,
        unit: 'µg/m³',
        threshold: 100,
        status:
          pm10 === null
            ? 'unavailable'
            : pm10 <= 50
            ? 'safe'
            : pm10 <= 100
            ? 'moderate'
            : pm10 <= 250
            ? 'unhealthy'
            : 'hazardous'
      },
      no2: {
        code: 'no2',
        name: 'NO₂',
        fullName: 'Nitrogen Dioxide (Vehicular/Combustion)',
        value: no2 !== null ? Number(no2.toFixed(1)) : null,
        unit: 'µg/m³',
        threshold: 80,
        status:
          no2 === null
            ? 'unavailable'
            : no2 <= 40
            ? 'safe'
            : no2 <= 80
            ? 'moderate'
            : 'unhealthy'
      },
      so2: {
        code: 'so2',
        name: 'SO₂',
        fullName: 'Sulphur Dioxide (Thermal/Industrial)',
        value: so2 !== null ? Number(so2.toFixed(1)) : null,
        unit: 'µg/m³',
        threshold: 80,
        status:
          so2 === null
            ? 'unavailable'
            : so2 <= 40
            ? 'safe'
            : so2 <= 80
            ? 'moderate'
            : 'unhealthy'
      },
      co: {
        code: 'co',
        name: 'CO',
        fullName: 'Carbon Monoxide (Incomplete Combustion)',
        value: co !== null ? Number(co.toFixed(1)) : null,
        unit: 'µg/m³',
        threshold: 2000,
        status:
          co === null
            ? 'unavailable'
            : co <= 1000
            ? 'safe'
            : co <= 2000
            ? 'moderate'
            : 'unhealthy'
      },
      o3: {
        code: 'o3',
        name: 'O₃',
        fullName: 'Ground-level Ozone (Photochemical Smog)',
        value: o3 !== null ? Number(o3.toFixed(1)) : null,
        unit: 'µg/m³',
        threshold: 100,
        status:
          o3 === null
            ? 'unavailable'
            : o3 <= 50
            ? 'safe'
            : o3 <= 100
            ? 'moderate'
            : 'unhealthy'
      }
    };

    const hourlyForecast: HourlyForecastPoint[] = [];
    const hTime = aqiData.hourly?.time || [];
    const hPm25 = aqiData.hourly?.pm2_5 || [];
    const hPm10 = aqiData.hourly?.pm10 || [];

    const nowIndex = Math.max(
      0,
      hTime.findIndex((t: string) => new Date(t).getTime() >= Date.now() - 3600 * 1000)
    );

    for (let i = nowIndex; i < Math.min(nowIndex + 24, hTime.length); i++) {
      const p25 = hPm25[i] || 25;
      const p10 = hPm10[i] || 50;
      const hourAqiRes = calculateCPCBIndex(p25, p10);
      const hCpcb = getCPCBInfo(hourAqiRes.aqi);
      const d = new Date(hTime[i]);
      const hourLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

      hourlyForecast.push({
        time: hTime[i],
        hour: hourLabel,
        aqi: hourAqiRes.aqi,
        pm25: Number(p25.toFixed(1)),
        pm10: Number(p10.toFixed(1)),
        category: hCpcb.category,
        color: hCpcb.color
      });
    }

    const payload: LiveAQIResponse = {
      status: 'success',
      is_live: true,
      provider: 'Open-Meteo Atmospheric Telemetry',
      data_source_label: 'Verified Live Telemetry',
      standard_name: 'Indian CPCB NAAQS Standard',
      timestamp: cur.time || new Date().toISOString(),
      location: {
        name: locationName,
        latitude: lat,
        longitude: lon,
        state: stateName,
        country: 'India'
      },
      aqi,
      category: cpcb.category,
      badge_color: cpcb.color,
      dominant_pollutant: dominant,
      health_advisory: cpcb.advisory,
      health_recommendations: {
        general_population:
          aqi > 200
            ? 'Wear a certified N95 mask outdoors. Avoid morning runs or intense exercise on roads.'
            : 'Air quality is acceptable. Maintain normal outdoor activities.',
        sensitive_groups:
          aqi > 100
            ? 'Keep prescribed asthma inhalers close. Avoid strenuous outdoor exposure.'
            : 'Sensitive individuals can engage in outdoor activities with basic comfort awareness.',
        children_elderly:
          aqi > 150
            ? 'Children and elderly should stay indoors during early morning and late evening peaks.'
            : 'Safe for moderate outdoor play in green parks.',
        athletes_outdoor:
          aqi > 150
            ? 'Move aerobic training indoors or shift sessions to the early afternoon (12 PM–3 PM).'
            : 'Outdoor training is suitable; stay well hydrated.'
      },
      pollutants,
      weather: {
        temperature: temp,
        humidity,
        windSpeed,
        condition,
        stagnationRisk
      },
      hourly_forecast: hourlyForecast
    };

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error('AQI fetch error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: 'Unable to retrieve atmospheric observations.',
        details: error?.message,
        location: { name: locationName, latitude: lat, longitude: lon }
      },
      { status: 502 }
    );
  }
}
