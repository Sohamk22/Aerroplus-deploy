'use client';

import React from 'react';
import { Wind, MapPin, QrCode } from 'lucide-react';

interface NavbarProps {
  currentCity: string;
  onSelectCityClick: () => void;
  onOpenQR: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentCity, onSelectCityClick, onOpenQR }) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-header">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-700 to-emerald-500 flex items-center justify-center text-white shadow-sm">
            <Wind className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-slate-900 text-base">AeroPlus</span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions: City Button + QR Share */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSelectCityClick}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors shadow-2xs active:scale-95"
            title="Change Location"
          >
            <MapPin className="w-3.5 h-3.5 text-brand-700" />
            <span className="max-w-[110px] truncate">{currentCity}</span>
          </button>

          <button
            onClick={onOpenQR}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 transition-colors active:scale-95"
            title="Scan QR Code on Phone"
            aria-label="Scan QR Code"
          >
            <QrCode className="w-4 h-4 text-slate-800" />
          </button>
        </div>
      </div>
    </header>
  );
};
