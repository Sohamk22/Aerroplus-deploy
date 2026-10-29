'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, MapPin, Navigation, Check, Loader2 } from 'lucide-react';
import { PRESET_CITIES } from '@/lib/presets';

interface CitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string;
  onSelectCity: (cityName: string, lat?: number, lon?: number) => void;
  onUseGeolocation: () => void;
  isLocating?: boolean;
}

export const CitySelectorModal: React.FC<CitySelectorModalProps> = ({
  isOpen,
  onClose,
  selectedCity,
  onSelectCity,
  onUseGeolocation,
  isLocating = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchTerm.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isOpen) return null;

  const popularList = Object.values(PRESET_CITIES).filter((c) => c.isPopular);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-700">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Select Location</h3>
              <p className="text-xs text-slate-500">Choose a city or use your device GPS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Button */}
        <div className="p-4 border-b border-slate-100">
          <button
            onClick={() => {
              onUseGeolocation();
              onClose();
            }}
            disabled={isLocating}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold hover:bg-brand-100/70 transition-colors disabled:opacity-50 shadow-2xs"
          >
            {isLocating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-brand-700" />
                <span>Detecting GPS Coordinates...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 text-brand-700 fill-brand-700" />
                <span>Use My Current Location (GPS)</span>
              </>
            )}
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 pb-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              placeholder="Search any Indian or global city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 animate-spin text-slate-400 absolute right-3" />
            )}
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-4">
          {searchResults.length > 0 ? (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Search Results
              </div>
              <div className="space-y-1">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onSelectCity(res.name, res.latitude, res.longitude);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 text-xs text-slate-800"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{res.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {res.state ? `${res.state}, ` : ''}{res.country}
                      </div>
                    </div>
                    {selectedCity.toLowerCase() === res.name.toLowerCase() && (
                      <Check className="w-4 h-4 text-brand-700" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Popular Cities
              </div>
              <div className="grid grid-cols-2 gap-2">
                {popularList.map((c) => {
                  const isSelected = selectedCity.toLowerCase() === c.name.toLowerCase();
                  return (
                    <button
                      key={c.name}
                      onClick={() => {
                        onSelectCity(c.name, c.lat, c.lon);
                        onClose();
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all border ${
                        isSelected
                          ? 'bg-brand-50 border-brand-200 text-brand-900 font-semibold shadow-2xs'
                          : 'bg-slate-50/70 border-slate-200/60 text-slate-700 hover:bg-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{c.name}</div>
                        <div className="text-[10px] text-slate-400">{c.state}</div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-brand-700" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
