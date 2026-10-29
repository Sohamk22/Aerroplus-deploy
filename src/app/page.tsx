'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { BottomNav, NavTab } from '@/components/BottomNav';
import { AssistantView } from '@/components/views/AssistantView';
import { AirQualityView } from '@/components/views/AirQualityView';
import { InsightsView } from '@/components/views/InsightsView';
import { CitySelectorModal } from '@/components/CitySelectorModal';
import { ShareModal } from '@/components/ShareModal';
import { LiveAQIResponse } from '@/lib/types';
import { DEFAULT_CITY } from '@/lib/presets';

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>('assistant');
  const [currentCity, setCurrentCity] = useState<string>(DEFAULT_CITY.name);
  const [, setCoords] = useState<{ lat?: number; lon?: number }>({
    lat: DEFAULT_CITY.lat,
    lon: DEFAULT_CITY.lon
  });
  const [aqiData, setAqiData] = useState<LiveAQIResponse | null>(null);
  const [isLoadingAQI, setIsLoadingAQI] = useState<boolean>(true);
  const [isCityModalOpen, setIsCityModalOpen] = useState<boolean>(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Fetch live AQI data
  const fetchAQIData = useCallback(async (cityName: string, lat?: number, lon?: number) => {
    setIsLoadingAQI(true);
    try {
      let url = `/api/aqi?city=${encodeURIComponent(cityName)}`;
      if (lat !== undefined && lon !== undefined) {
        url += `&lat=${lat}&lon=${lon}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data: LiveAQIResponse = await res.json();
        setAqiData(data);
        if (data.location?.name) {
          setCurrentCity(data.location.name);
        }
      }
    } catch (error) {
      console.error('Failed to load live AQI:', error);
    } finally {
      setIsLoadingAQI(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAQIData(DEFAULT_CITY.name, DEFAULT_CITY.lat, DEFAULT_CITY.lon);
  }, [fetchAQIData]);

  const handleSelectCity = (cityName: string, lat?: number, lon?: number) => {
    setCurrentCity(cityName);
    setCoords({ lat, lon });
    fetchAQIData(cityName, lat, lon);
  };

  const handleUseGeolocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your current browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lon: longitude });
        fetchAQIData('Near Me', latitude, longitude);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err.message);
        setIsLocating(false);
        alert(
          'Location permission was not granted. You can still select or search any city manually from the list!'
        );
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentCity={currentCity}
        onSelectCityClick={() => setIsCityModalOpen(true)}
        onOpenQR={() => setIsQRModalOpen(true)}
      />

      {/* Main Tab Content */}
      <main className="flex-1 w-full">
        {activeTab === 'assistant' && (
          <AssistantView
            aqiData={aqiData}
            currentCity={currentCity}
            onSelectCityClick={() => setIsCityModalOpen(true)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'airquality' && (
          <AirQualityView
            aqiData={aqiData}
            isLoading={isLoadingAQI}
            currentCity={currentCity}
            onSelectCity={handleSelectCity}
            onUseGeolocation={handleUseGeolocation}
            isLocating={isLocating}
          />
        )}

        {activeTab === 'insights' && <InsightsView />}
      </main>

      {/* Mobile-First Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modals */}
      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        selectedCity={currentCity}
        onSelectCity={handleSelectCity}
        onUseGeolocation={handleUseGeolocation}
        isLocating={isLocating}
      />

      <ShareModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />
    </div>
  );
}
