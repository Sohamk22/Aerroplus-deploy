'use client';

import React, { useState } from 'react';
import {
  Building2,
  TreePine,
  Sliders,
  Zap,
  Scale,
  ShieldCheck,
  Bus,
  Car,
  Flame,
  Wind,
  Leaf,
  Info,
  Layers
} from 'lucide-react';
import { calculateTreePhysics } from '@/lib/tree-physics';

export const InsightsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'authorities' | 'citizens' | 'trees'>('trees');
  const [treeUnits, setTreeUnits] = useState(5);

  const simulation = calculateTreePhysics({ numUnits: treeUnits });

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-5 pb-24 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Clean Air Solutions & Civic Intelligence
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Verified government enforcement schedules, concrete citizen actions, and innovative engineering pilots.
        </p>
      </div>

      {/* Segmented Sub-Navigation Pills */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
        <button
          onClick={() => setActiveSubTab('trees')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'trees'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <TreePine className="w-3.5 h-3.5 text-brand-700" />
          <span>Artificial Trees Lab</span>
        </button>

        <button
          onClick={() => setActiveSubTab('authorities')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'authorities'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Government Action (GRAP)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('citizens')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'citizens'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Leaf className="w-3.5 h-3.5 text-emerald-600" />
          <span>Citizen Action</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: INNOVATIVE ARTIFICIAL TREE CONCEPT LAB                         */}
      {/* ========================================================================= */}
      {activeSubTab === 'trees' && (
        <div className="space-y-4 animate-fade-in">
          {/* Hero Concept Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <TreePine className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  Experimental Civic Pilot
                </span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1">
                  Active Outdoor Filtration Trees & Smog Columns
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Engineered vertical columns combining multi-stage HEPA pre-filters, electrostatic precipitators, and living moss bio-panels to create localized clean-air bubbles in high-exposure pedestrian plazas.
            </p>

            {/* Interactive Units Slider */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-brand-600" />
                  <span>Deployment Scale:</span>
                </span>
                <span className="font-bold text-brand-800 bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-200 text-xs">
                  {treeUnits} {treeUnits === 1 ? 'Unit' : 'Units'} (Corridor Scale)
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={treeUnits}
                onChange={(e) => setTreeUnits(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-700"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>1 Unit (Hotspot)</span>
                <span>10 Units (District)</span>
                <span>20 Units (Fleet)</span>
              </div>
            </div>
          </div>

          {/* Real-time Physics Output Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase mb-1">
                <Wind className="w-3.5 h-3.5 text-blue-500" />
                <span>Air Processed</span>
              </div>
              <div className="text-lg font-black text-slate-900">
                {simulation.dailyAirVolumeM3.toLocaleString()} <span className="text-xs font-normal text-slate-500">m³/day</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                ~{simulation.annualAirVolumeMillionM3} million m³/year
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>PM2.5 Mass Trapped</span>
              </div>
              <div className="text-lg font-black text-slate-900">
                {simulation.dailyPm25RemovedKg} <span className="text-xs font-normal text-slate-500">kg/day</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                ~{simulation.annualPm25RemovedKg} kg fine soot/year
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Energy Draw</span>
              </div>
              <div className="text-lg font-black text-slate-900">
                {simulation.dailyEnergyKwh} <span className="text-xs font-normal text-slate-500">kWh/day</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                ~{simulation.annualEnergyKwh.toLocaleString()} kWh/yr (grid/solar)
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase mb-1">
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                <span>Clean Bubble Radius</span>
              </div>
              <div className="text-lg font-black text-slate-900">
                ~{simulation.microZoneRadiusMeters} <span className="text-xs font-normal text-slate-500">meters</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Pedestrian micro-zone protection
              </div>
            </div>
          </div>

          {/* Scientific Guardrail & Honest Disclaimer */}
          <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Scientific Guardrail & Reality Check</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900/90">
              {simulation.scientificDisclaimer}
            </p>
          </div>

          {/* Alternative Solutions Comparison */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-brand-700" />
              <span>Comparative Intervention Matrix</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>1. Road Dust Sweeping & Mist Cannons</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Highest Immediate ROI
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Mechanized vacuum sweepers eliminate coarse particulate before it re-suspends into the breathing zone. Lowest cost per kg PM removed.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>2. Urban Green Belts (Miyawaki Forests)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    Permanent Ecological ROI
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Dense multi-tier native canopies (Neem, Peepal, Bougainvillea) trap dust through foliar impaction with zero operational electrical consumption.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>3. Fleet Electrification & EV Feeder Fleets</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    Root Cause Solution
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Transitioning public transit and delivery fleets directly to electric stops carcinogenic black carbon and toxic NO2 before it enters the air.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: GOVERNMENT ACTION & GRAP 2024                                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'authorities' && (
        <div className="space-y-4 animate-fade-in">
          {/* Statutory Notice */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <Building2 className="w-4 h-4 text-blue-700" />
              <span>Statutory Mandate: CAQM & GRAP 2024 Schedule</span>
            </div>
            <p className="text-[11px] text-blue-900/90 leading-relaxed">
              Enforcement actions across Delhi NCR are governed by statutory directions from the Commission for Air Quality Management (CAQM Act 2021) and the revised Graded Response Action Plan (Direction No. 77).
            </p>
          </div>

          {/* 4 Stages of GRAP Cards */}
          <div className="space-y-2.5">
            <div className="p-3.5 bg-white rounded-2xl border border-amber-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 text-xs">Stage I · Poor (AQI 201–300)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Moderate Advisory
                </span>
              </div>
              <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5">
                <li>Strict dust suppression on building sites &gt; 500 m² with anti-smog guns.</li>
                <li>Mechanized sweeping and water sprinkling on high-density corridors.</li>
                <li>Intensified enforcement of PUC certification at fueling stations.</li>
              </ul>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-orange-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-orange-900 text-xs">Stage II · Very Poor (AQI 301–400)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                  Enhanced Restrictions
                </span>
              </div>
              <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5">
                <li>Heightened parking fees to discourage personal vehicle usage.</li>
                <li>Uninterrupted power supply to prevent reliance on diesel generator sets.</li>
                <li>Synchronized traffic signals at major congestion bottlenecks.</li>
              </ul>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-rose-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-900 text-xs">Stage III · Severe (AQI 401–450)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  Severe Curbs
                </span>
              </div>
              <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5">
                <li>Total prohibition of non-essential construction and demolition activities.</li>
                <li>Restrictions on BS-III Petrol and BS-IV Diesel private light motor vehicles.</li>
                <li>Discontinuation of physical classes for primary schools (Class 1–5).</li>
              </ul>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-red-300 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-950 text-xs">Stage IV · Severe+ (AQI &gt; 450)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-900">
                  Emergency Protocols
                </span>
              </div>
              <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5">
                <li>Ban on non-essential heavy diesel trucks entering Delhi NCR.</li>
                <li>Mandatory 50% work-from-home order for government and private offices.</li>
                <li>Emergency odd-even vehicle rotation and school closures.</li>
              </ul>
            </div>
          </div>

          {/* Statutory Policy Registry */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-2">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Official Legal Backing</h4>
            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div className="p-2 bg-slate-50 rounded-lg">
                <strong>Commission for Air Quality Management (CAQM) Act 2021:</strong> Central statute with binding authority over Punjab, Haryana, Rajasthan, and Delhi.
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <strong>Air (Prevention and Control of Pollution) Act 1981:</strong> Foundational national framework empowering State Pollution Control Boards.
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <strong>GNCTD Comprehensive Air Pollution Mitigation Plan:</strong> 14-point localized municipal operational plan.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: CITIZEN ACTION & SUSTAINABLE CHOICES                           */}
      {/* ========================================================================= */}
      {activeSubTab === 'citizens' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <Leaf className="w-4 h-4 text-emerald-700" />
              <span>Collective Civic Power: What You Can Do Today</span>
            </div>
            <p className="text-[11px] text-emerald-900/90 leading-relaxed">
              While regional policies enforce industrial compliance, individual and community actions prevent immediate hotspot spikes right in our neighborhoods.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex gap-3 items-start">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700 shrink-0">
                <Bus className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 text-xs">
                <div className="font-bold text-slate-900">1. Shift Trips to Metro & Electric Transit</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Every commuter using the Delhi Metro prevents approximately 2.5 kg of CO2 and 15 grams of direct PM2.5 tailpipe emissions per roundtrip.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex gap-3 items-start">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-700 shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 text-xs">
                <div className="font-bold text-slate-900">2. Zero Open Waste Burning</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Never burn dry leaves or municipal trash. Burning biomass releases carcinogenic dioxins and high black carbon. Report burning immediately on the <em>Green Delhi App</em>.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex gap-3 items-start">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700 shrink-0">
                <Car className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 text-xs">
                <div className="font-bold text-slate-900">3. Switch Off at Red Lights & Check PUC</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Idling engines for more than 20 seconds burns more fuel than restarting. Keep your vehicle tuned and maintain optimal tire pressure to reduce fuel consumption by 3–5%.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex gap-3 items-start">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                <Wind className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 text-xs">
                <div className="font-bold text-slate-900">4. Indoor Air Filtration & Window Management</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Keep windows sealed during early morning thermal inversion hours (7 AM–10 AM). Use True-HEPA air purifiers in sleeping rooms for clean respiratory recovery.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex gap-3 items-start">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700 shrink-0">
                <TreePine className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 text-xs">
                <div className="font-bold text-slate-900">5. Roadside Vegetation Buffers</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Plant native evergreen shrubs like Bougainvillea, Ficus, and Nerium along boundary walls. Their waxy, hairy leaves naturally capture roadside dust before it enters homes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
