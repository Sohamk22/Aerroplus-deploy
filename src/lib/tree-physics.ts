import { TreeSimulationParams, TreeSimulationResult } from './types';

export const DEFAULT_TREE_PARAMS: TreeSimulationParams = {
  numUnits: 5,
  airflowPerUnitM3h: 15000,
  operatingHoursPerDay: 18,
  inletPm25Ugm3: 160,
  inletPm10Ugm3: 280,
  efficiencyPm25: 0.85,
  powerKwPerUnit: 1.8,
};

export function calculateTreePhysics(params: Partial<TreeSimulationParams> = {}): TreeSimulationResult {
  const p: TreeSimulationParams = { ...DEFAULT_TREE_PARAMS, ...params };

  const uptimeFraction = 0.90;
  const electricityTariffInr = 8.5; // Commercial tariff INR/kWh

  // Daily Air Volume processed (m³)
  const dailyAirVolumeM3 = p.numUnits * p.airflowPerUnitM3h * p.operatingHoursPerDay * uptimeFraction;
  const annualAirVolumeMillionM3 = (dailyAirVolumeM3 * 365) / 1_000_000;

  // Mass Removed: Volume (m³) * Concentration (µg/m³) * Efficiency / 10^9 (kg)
  const dailyPm25RemovedKg = (dailyAirVolumeM3 * p.inletPm25Ugm3 * p.efficiencyPm25) / 1_000_000_000;
  const annualPm25RemovedKg = dailyPm25RemovedKg * 365;

  const efficiencyPm10 = Math.min(0.95, p.efficiencyPm25 + 0.07);
  const dailyPm10RemovedKg = (dailyAirVolumeM3 * p.inletPm10Ugm3 * efficiencyPm10) / 1_000_000_000;
  const annualPm10RemovedKg = dailyPm10RemovedKg * 365;

  // Energy & Economics
  const dailyEnergyKwh = p.numUnits * p.powerKwPerUnit * p.operatingHoursPerDay * uptimeFraction;
  const annualEnergyKwh = dailyEnergyKwh * 365;

  const dailyCostInr = dailyEnergyKwh * electricityTariffInr;
  const annualOpexMaintenanceInr = p.numUnits * 120_000; // Filter replacements & upkeep
  const annualCostInr = (annualEnergyKwh * electricityTariffInr) + annualOpexMaintenanceInr;

  // Effective micro-zone clean bubble radius (meters)
  // Physical boundary: depends on cubic root of volume flow against ambient wind
  const microZoneRadiusMeters = Math.round(25 + Math.sqrt(p.numUnits) * 6);

  const scientificDisclaimer =
    'Scientific Boundary Notice: Active filtration systems cleanse air strictly passing directly through their filter chambers. In open urban airsheds, ambient wind and continuous cross-ventilation dilute the clean air plume. Active filtration is highly beneficial for localized pedestrian micro-zones (bus stands, school grounds, market plazas), but cannot replace regional source-level emission reductions.';

  return {
    params: p,
    dailyAirVolumeM3: Math.round(dailyAirVolumeM3),
    annualAirVolumeMillionM3: Number(annualAirVolumeMillionM3.toFixed(2)),
    dailyPm25RemovedKg: Number(dailyPm25RemovedKg.toFixed(2)),
    annualPm25RemovedKg: Number(annualPm25RemovedKg.toFixed(1)),
    annualPm10RemovedKg: Number(annualPm10RemovedKg.toFixed(1)),
    dailyEnergyKwh: Math.round(dailyEnergyKwh),
    annualEnergyKwh: Math.round(annualEnergyKwh),
    dailyCostInr: Math.round(dailyCostInr),
    annualCostInr: Math.round(annualCostInr),
    microZoneRadiusMeters,
    scientificDisclaimer,
  };
}
