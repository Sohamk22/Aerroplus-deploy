'use client';

import React from 'react';
import {
  Activity,
  MapPin,
  Wind,
  Droplets,
  Thermometer,
  Clock,
  Navigation,
  AlertTriangle,
  HeartPulse,
  Baby,
  Dumbbell,
  Users,
  Calendar
} from 'lucide-react';
import { LiveAQIResponse } from '@/lib/types';
import { PRESET_CITIES } from '@/lib/presets';
import { getStatusStyle } from '@/lib/city-data';

interface AirQualityViewProps {
  aqiData: LiveAQIResponse | null;
  isLoading: boolean;
  currentCity: string;
  onSelectCity: (cityName: string, lat?: number, lon?: number) => void;
  onUseGeolocation: () => void;
  isLocating?: boolean;
}

export const AirQualityView: React.FC<AirQualityViewProps> = ({
  aqiData,
  isLoading,
  currentCity,
  onSelectCity,
  onUseGeolocation,
  isLocating = false
}) => {
  const popularCities = Object.values(PRESET_CITIES).slice(0, 6);

  if (isLoading && !aqiData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-10 h-10 border-3 border-brand-700 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading atmospheric dataset and forecast...</p>
      </div>
    );
  }

  const aqi = aqiData?.aqi || 146;
  const category = aqiData?.category || 'Moderate';
  const color = aqiData?.badge_color || '#ea580c';
  const dominant = aqiData?.dominant_pollutant || 'PM2.5';
  const weather = aqiData?.weather;
  const pollutants = aqiData?.pollutants || {};

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-5 pb-24 animate-fade-in">
      {/* City Switcher & Geolocation Header */}
      <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <MapPin className="w-4 h-4 text-brand-700" />
            <span>Active City:</span>
            <span className="font-bold text-slate-900 text-sm">{currentCity}</span>
          </div>

          <button
            onClick={onUseGeolocation}
            disabled={isLocating}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-[11px] font-semibold hover:bg-brand-100 transition-colors disabled:opacity-50"
          >
            <Navigation className="w-3 h-3 text-brand-700 fill-brand-700" />
            <span>{isLocating ? 'Locating...' : 'Near Me (GPS)'}</span>
          </button>
        </div>

        {/* Quick City Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {popularCities.map((c) => {
            const isSelected = currentCity.toLowerCase() === c.name.toLowerCase();
            return (
              <button
                key={c.name}
                onClick={() => onSelectCity(c.name, c.lat, c.lon)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-brand-700 text-white border-brand-700 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main AQI Gauge Card */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm text-center">
        <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-1">
          {aqiData?.standard_name || 'Air Quality Index'}
        </div>

        {/* Big AQI Number with Category Ring */}
        <div className="relative my-3 inline-flex flex-col items-center justify-center">
          <div
            className="w-36 h-36 rounded-full flex flex-col items-center justify-center border-8 shadow-inner transition-colors duration-500"
            style={{
              borderColor: color,
              backgroundColor: `${color}10`
            }}
          >
            <span className="text-5xl font-black text-slate-900 tracking-tight">{aqi}</span>
            <span
              className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white mt-1 shadow-2xs"
              style={{ backgroundColor: color }}
            >
              {category}
            </span>
          </div>
        </div>

        {/* Health Statement */}
        <div className="max-w-md mx-auto text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
          {aqiData?.health_advisory}
        </div>

        {/* Dominant Pollutant & Data Source Tag */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-around text-xs text-slate-500">
          <div>
            <span>Primary Criteria: </span>
            <strong className="text-slate-900">{dominant}</strong>
          </div>
          <div>
            <span>Standard: </span>
            <strong className="text-slate-900">{aqiData?.standard_name || 'CPCB National NAAQS'}</strong>
          </div>
          <div>
            <span>Data Source: </span>
            {aqiData?.is_live ? (
              <strong className="text-emerald-700 font-semibold">Verified Live Telemetry</strong>
            ) : (
              <strong className="text-amber-700 font-semibold">{aqiData?.data_source_label || 'Provided Benchmark Dataset'}</strong>
            )}
          </div>
        </div>
      </div>

      {/* 7-Day Weekly AQI Series (From Provided Dataset) */}
      {aqiData?.weekly_series && aqiData.weekly_series.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-700" />
              <span>7-Day Air Quality Outlook (Weekly Series)</span>
            </h4>
            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Provided Research Series
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
            {aqiData.weekly_series.map((item, idx) => {
              const style = getStatusStyle(item.status);
              const isCurrent = idx === 0;
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                    isCurrent
                      ? 'bg-slate-50 border-brand-500 shadow-xs ring-1 ring-brand-500/20'
                      : 'bg-white border-slate-200/70 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[10px] font-bold truncate ${isCurrent ? 'text-brand-800' : 'text-slate-600'}`}>
                        {item.day.replace(' (Current)', '').replace(' (Peak)', '')}
                      </span>
                      {isCurrent && (
                        <span className="text-[8px] font-extrabold uppercase px-1 rounded bg-brand-600 text-white">
                          Now
                        </span>
                      )}
                      {item.day.includes('Peak') && (
                        <span className="text-[8px] font-extrabold uppercase px-1 rounded bg-rose-600 text-white">
                          Peak
                        </span>
                      )}
                    </div>
                    <div className="text-xl font-black text-slate-900">
                      {item.aqi}
                    </div>
                  </div>

                  <div className="mt-2 space-y-1">
                    <span
                      className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-tight text-center w-full truncate"
                      style={{ backgroundColor: style.bg, color: style.text }}
                      title={item.status}
                    >
                      {item.status}
                    </span>
                    <div className="text-[9px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
                      <span>PM2.5:</span>
                      <span className="font-semibold text-slate-700">{item.pm25}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weather & Meteorological Stagnation Drivers */}
      {weather && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-brand-700" />
              <span>Atmospheric Dispersion & Weather Drivers</span>
            </h4>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                weather.stagnationRisk === 'Severe'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : weather.stagnationRisk === 'Moderate'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {weather.stagnationRisk} Stagnation
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-[10px] font-semibold uppercase">Temp</span>
              </div>
              <div className="text-base font-bold text-slate-900">{weather.temperature}°C</div>
              <div className="text-[10px] text-slate-400">{weather.condition}</div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[10px] font-semibold uppercase">Humidity</span>
              </div>
              <div className="text-base font-bold text-slate-900">{weather.humidity}%</div>
              <div className="text-[10px] text-slate-400">Relative</div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                <Wind className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px] font-semibold uppercase">Wind</span>
              </div>
              <div className="text-base font-bold text-slate-900">{weather.windSpeed} <span className="text-[10px] font-normal">km/h</span></div>
              <div className="text-[10px] text-slate-400">
                {weather.windSpeed < 9 ? 'Calm (Traps smog)' : 'Active dispersion'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Criteria Pollutants Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-brand-700" />
            <span>Criteria Pollutants Breakdown</span>
          </h4>
          <span className="text-[10px] text-slate-400">Standard Threshold Limits</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {Object.values(pollutants).map((p) => {
            const isOver = p.value !== null && p.value > p.threshold;
            return (
              <div
                key={p.code}
                className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{p.name}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      p.status === 'safe'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : p.status === 'unhealthy'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="my-1.5">
                  <div className="text-lg font-black text-slate-900">
                    {p.value !== null ? p.value : '--'}
                    <span className="text-[10px] font-normal text-slate-500 ml-1">{p.unit}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate" title={p.fullName}>
                    {p.fullName}
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 flex justify-between">
                  <span>Standard:</span>
                  <span className={isOver ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                    ≤ {p.threshold} {p.unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 24-Hour Hourly Trajectory */}
      {aqiData?.hourly_forecast && aqiData.hourly_forecast.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-700" />
              <span>24-Hour Forecast Timeline</span>
            </h4>
            <span className="text-[10px] text-slate-400">Hourly Expected AQI</span>
          </div>

          <div className="flex items-end gap-2 overflow-x-auto no-scrollbar py-2 h-36">
            {aqiData.hourly_forecast.map((pt, idx) => {
              const barHeightPct = Math.min(100, Math.max(15, (pt.aqi / 350) * 100));
              return (
                <div key={idx} className="shrink-0 flex flex-col items-center justify-end w-12 h-full group">
                  <span className="text-[10px] font-bold text-slate-700 mb-1">{pt.aqi}</span>
                  <div
                    className="w-8 rounded-t-md transition-all duration-300 group-hover:opacity-80"
                    style={{
                      height: `${barHeightPct}%`,
                      backgroundColor: pt.color
                    }}
                  />
                  <span className="text-[9px] text-slate-400 mt-1 whitespace-nowrap">{pt.hour}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tailored Health Advisories */}
      {aqiData?.health_recommendations && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
          <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-brand-700" />
            <span>Targeted Health Guidance for Today</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Users className="w-3.5 h-3.5 text-brand-600" />
                <span>General Public</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {aqiData.health_recommendations.general_population}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Sensitive Groups (Asthma, Heart)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {aqiData.health_recommendations.sensitive_groups}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Baby className="w-3.5 h-3.5 text-blue-600" />
                <span>Children & Senior Citizens</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {aqiData.health_recommendations.children_elderly}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Dumbbell className="w-3.5 h-3.5 text-emerald-600" />
                <span>Athletes & Outdoor Workers</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {aqiData.health_recommendations.athletes_outdoor}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
