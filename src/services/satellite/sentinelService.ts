import { copernicusService } from './copernicusService';
import { SatelliteProduct, SatelliteSearchParams } from './satelliteTypes';

export class SentinelService {
  private static instance: SentinelService;

  private constructor() {}

  public static getInstance(): SentinelService {
    if (!SentinelService.instance) {
      SentinelService.instance = new SentinelService();
    }
    return SentinelService.instance;
  }

  /**
   * Search real Sentinel-1 SAR products for a given AOI or region.
   */
  public async searchRegionalScenes(regionName: string, maxResults: number = 5): Promise<SatelliteProduct[]> {
    // Coordinate centers for Indian maritime zones
    const regionalCenters: Record<string, { lat: number; lng: number }> = {
      'Gulf of Mannar': { lat: 8.70, lng: 78.50 },
      'Arabian Sea (Mumbai)': { lat: 18.90, lng: 72.50 },
      'Bay of Bengal (Chennai)': { lat: 13.10, lng: 80.35 },
      'Bay of Bengal (Paradip)': { lat: 20.20, lng: 86.80 },
      'Gulf of Kachchh': { lat: 22.45, lng: 69.30 },
      'Goa Offshore': { lat: 15.35, lng: 73.65 },
      'Andaman Sea': { lat: 11.60, lng: 92.70 },
      'Strait of Malacca': { lat: 2.80, lng: 101.40 }
    };

    const target = regionalCenters[regionName] || { lat: 8.70, lng: 78.50 };
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);

    const searchParams: SatelliteSearchParams = {
      mission: 'SENTINEL-1A',
      productType: 'GRD',
      point: target,
      startDateUtc: sevenDaysAgo.toISOString().split('T')[0],
      endDateUtc: now.toISOString().split('T')[0],
      maxResults
    };

    const response = await copernicusService.searchSentinel1(searchParams);
    return response.products;
  }
}

export const sentinelService = SentinelService.getInstance();
