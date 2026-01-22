/**
 * DappRadar API Integration
 * Public API for discovering dApps across multiple chains including Cardano
 * API Docs: https://dappradar.com/api
 */

export interface DappRadarDApp {
  dappId: number;
  name: string;
  description: string;
  logo: string;
  link: string;
  website: string;
  chains: string[];
  category: string;
  metrics?: {
    transactions?: number;
    uaw?: number; // Unique Active Wallets
    volume?: number;
    balance?: number;
  };
}

/**
 * Fetch Cardano dApps from DappRadar
 */
export async function fetchFromDappRadar(): Promise<DappRadarDApp[]> {
  console.log('[DappRadar] Fetching Cardano dApps...');

  try {
    // DappRadar public API endpoint
    const response = await fetch(
      'https://api.dappradar.com/4tsxo4vuhotaojtl/dapps?chain=cardano&resultsPerPage=100',
      {
        signal: AbortSignal.timeout(15000),
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const dapps: DappRadarDApp[] = data.results || [];

    console.log(`[DappRadar] Found ${dapps.length} Cardano dApps`);
    return dapps;
  } catch (error) {
    console.error('[DappRadar] Failed to fetch:', error);
    // Return empty array on error, don't fail the entire job
    return [];
  }
}

/**
 * Map DappRadar category to our dApp type
 */
export function mapDappRadarCategory(category: string): string {
  const categoryLower = category.toLowerCase();

  const mapping: Record<string, string> = {
    'defi': 'dex',
    'exchanges': 'dex',
    'marketplaces': 'nft_marketplace',
    'nft': 'nft_marketplace',
    'collectibles': 'nft_marketplace',
    'games': 'gaming',
    'gambling': 'gaming',
    'social': 'other',
    'high-risk': 'other',
    'other': 'other',
  };

  return mapping[categoryLower] || 'other';
}
