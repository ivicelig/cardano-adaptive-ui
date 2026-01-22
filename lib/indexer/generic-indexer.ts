import { DAppIndexer, IndexableDApp, IndexResult } from './types';

/**
 * Generic/Fallback Indexer
 * Used for dApps that don't require complex on-chain indexing
 * Examples: NFT marketplaces with APIs, simple staking platforms, lending protocols with APIs
 */
export class GenericIndexer implements DAppIndexer {
  type = 'generic';

  async index(dapp: IndexableDApp): Promise<IndexResult> {
    console.log(`[GenericIndexer] Indexing ${dapp.name}...`);

    try {
      // 1. Check if dApp is still active (basic health check)
      const isHealthy = await this.healthCheck(dapp);
      if (!isHealthy) {
        return {
          success: false,
          error: `${dapp.name} appears to be down or unreachable`,
        };
      }

      // 2. If dApp has an API endpoint, fetch metadata
      let tvl: number | undefined;
      let volume24h: number | undefined;

      if (dapp.apiEndpoint) {
        const apiData = await this.fetchFromAPI(dapp);
        tvl = apiData?.tvl;
        volume24h = apiData?.volume24h;
      }

      // 3. Return success with optional metadata
      return {
        success: true,
        tvl,
        volume24h,
        pools: [], // Generic indexer doesn't track pools
      };
    } catch (error) {
      console.error(`[GenericIndexer] Error indexing ${dapp.name}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Basic health check - verify the dApp website is accessible
   */
  private async healthCheck(dapp: IndexableDApp): Promise<boolean> {
    try {
      const response = await fetch(dapp.websiteUrl || '', {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      return response.ok;
    } catch (error) {
      console.warn(`[GenericIndexer] Health check failed for ${dapp.name}`);
      return false;
    }
  }

  /**
   * Fetch data from dApp's API if available
   * This is a generic implementation - specific dApps may need custom parsing
   */
  private async fetchFromAPI(dapp: IndexableDApp): Promise<{
    tvl?: number;
    volume24h?: number;
  } | null> {
    if (!dapp.apiEndpoint) return null;

    try {
      // Try common API patterns
      const endpoints = [
        `${dapp.apiEndpoint}/stats`,
        `${dapp.apiEndpoint}/v1/stats`,
        `${dapp.apiEndpoint}/api/stats`,
        dapp.apiEndpoint, // Sometimes the endpoint itself returns stats
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            signal: AbortSignal.timeout(5000),
          });

          if (response.ok) {
            const data = await response.json();

            // Try to extract TVL and volume from common field names
            return {
              tvl: data.tvl || data.totalValueLocked || data.total_value_locked,
              volume24h: data.volume24h || data.volume_24h || data.dailyVolume,
            };
          }
        } catch {
          // Try next endpoint
          continue;
        }
      }

      return null;
    } catch (error) {
      console.warn(`[GenericIndexer] API fetch failed for ${dapp.name}`);
      return null;
    }
  }
}
