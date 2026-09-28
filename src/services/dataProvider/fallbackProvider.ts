import { Incident } from '../../types';
import { mockIncidents } from '../../data/mockIncidents';
import { DataProvenance } from './provenance';

export class FallbackProvider {
  private static instance: FallbackProvider;

  private constructor() {}

  public static getInstance(): FallbackProvider {
    if (!FallbackProvider.instance) {
      FallbackProvider.instance = new FallbackProvider();
    }
    return FallbackProvider.instance;
  }

  /**
   * Retrieves benchmark demonstration incident (OS-037 or other curated cases).
   * Fully annotates it with Controlled Demo Data provenance to guarantee scientific honesty.
   */
  public getCuratedDemoIncident(id: string = 'OS-037'): Incident {
    const found = mockIncidents.find(inc => inc.id === id) || mockIncidents[0];
    return {
      ...found,
      isSyntheticDemo: true,
      investigatorNotes: found.investigatorNotes || 'Curated benchmark case for operational testing and SIH 2026 demonstration.'
    };
  }

  /**
   * Returns all curated benchmark demo incidents.
   */
  public getAllDemoIncidents(): Incident[] {
    return mockIncidents.map(inc => ({
      ...inc,
      isSyntheticDemo: true
    }));
  }

  public getDemoProvenance(incidentId: string): DataProvenance {
    return {
      sourceName: 'AquaTrace Benchmark Evaluation Dataset',
      sourceProvider: 'Smart India Hackathon 2026 Verification Testbed',
      datasetId: `BENCHMARK-${incidentId}`,
      tier: 'TIER_4_DEMO_SIMULATION',
      classification: 'DEMO_SIMULATION',
      observationTimeUtc: '2026-03-24T00:42:18.000Z',
      retrievalTimeUtc: new Date().toISOString(),
      processingVersion: 'Benchmark Testbed v2.4',
      isSimulatedFallback: true,
      citationNotice: 'Controlled demonstration dataset. Not for legal enforcement.'
    };
  }
}

export const fallbackProvider = FallbackProvider.getInstance();
