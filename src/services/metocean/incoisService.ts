import { DataProvenance } from '../dataProvider/provenance';
import { CurrentVector } from './metoceanTypes';

export interface IncoisStationMetadata {
  stationId: string;
  name: string;
  type: 'MOORED_BUOY' | 'COASTAL_HF_RADAR' | 'TIDE_GAUGE' | 'WAVE_RIDER_BUOY';
  lat: number;
  lng: number;
  lastTransmissionUtc: string;
  parametersMeasured: string[];
}

export const INCOIS_COASTAL_STATIONS: IncoisStationMetadata[] = [
  {
    stationId: 'INCOIS-BD08',
    name: 'Bay of Bengal Deep Sea Moored Buoy BD08',
    type: 'MOORED_BUOY',
    lat: 18.20,
    lng: 89.65,
    lastTransmissionUtc: new Date(Date.now() - 3600000).toISOString(),
    parametersMeasured: ['Current Speed', 'Current Direction', 'SST', 'Salinity', 'Wind Vector', 'Air Pressure']
  },
  {
    stationId: 'INCOIS-CB02',
    name: 'Gulf of Mannar Coastal Wave Rider Buoy',
    type: 'WAVE_RIDER_BUOY',
    lat: 8.78,
    lng: 78.35,
    lastTransmissionUtc: new Date(Date.now() - 1800000).toISOString(),
    parametersMeasured: ['Significant Wave Height', 'Wave Period', 'Wave Direction', 'Surface Water Temp']
  },
  {
    stationId: 'INCOIS-HFR-TUT',
    name: 'Tuticorin Coastal HF Radar Surface Current Array',
    type: 'COASTAL_HF_RADAR',
    lat: 8.75,
    lng: 78.18,
    lastTransmissionUtc: new Date(Date.now() - 1200000).toISOString(),
    parametersMeasured: ['Surface Current Vector (High Resolution 4km)', 'Radial Velocity']
  },
  {
    stationId: 'INCOIS-AD02',
    name: 'Arabian Sea Offshore Buoy AD02 (Mumbai High)',
    type: 'MOORED_BUOY',
    lat: 19.30,
    lng: 71.80,
    lastTransmissionUtc: new Date(Date.now() - 2400000).toISOString(),
    parametersMeasured: ['Current Speed', 'Direction', 'SST', 'Wind Velocity']
  }
];

export class IncoisService {
  private static instance: IncoisService;

  private constructor() {}

  public static getInstance(): IncoisService {
    if (!IncoisService.instance) {
      IncoisService.instance = new IncoisService();
    }
    return IncoisService.instance;
  }

  public getIncoisStations(): IncoisStationMetadata[] {
    return INCOIS_COASTAL_STATIONS;
  }

  public getModelProvenance(): DataProvenance {
    return {
      sourceName: 'INCOIS Ocean Prediction System (ROMS)',
      sourceProvider: 'Indian National Centre for Ocean Information Services (Ministry of Earth Sciences)',
      datasetId: 'INCOIS-ROMS-IND-1/12',
      tier: 'TIER_1_LIVE_NRT',
      classification: 'REAL_OBSERVATION',
      observationTimeUtc: new Date().toISOString(),
      retrievalTimeUtc: new Date().toISOString(),
      processingVersion: 'ROMS v3.9 Hydrodynamic Model',
      spatialResolution: '1/12° (~9.2 km) grid',
      temporalResolution: '3-hourly forecast cycle',
      dataLatencyHours: 1.5,
      isSimulatedFallback: false,
      citationNotice: 'INCOIS Ocean State Forecast & Current Services, MoES, Govt of India.'
    };
  }

  public getNearestBuoyObservation(lat: number, lng: number): IncoisStationMetadata | undefined {
    let nearest: IncoisStationMetadata | undefined;
    let minDist = Infinity;

    for (const station of INCOIS_COASTAL_STATIONS) {
      const dist = Math.hypot(station.lat - lat, station.lng - lng);
      if (dist < minDist) {
        minDist = dist;
        nearest = station;
      }
    }

    return nearest;
  }
}

export const incoisService = IncoisService.getInstance();
