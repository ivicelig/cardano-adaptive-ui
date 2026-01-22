/**
 * Cardano Cube API Integration
 * Fetches dApps from the community-maintained Cardano Cube registry
 * https://www.cardanocube.io
 */

export interface CardanoCubeDApp {
  id: string;
  name: string;
  description: string;
  website: string;
  category: string;
  subcategory?: string;
  logo?: string;
  twitter?: string;
  discord?: string;
}

/**
 * Fetch dApps from Cardano Cube
 * Note: This is a placeholder - Cardano Cube doesn't have a public API yet.
 * In practice, we'll scrape their website or use their data export.
 */
export async function fetchFromCardanoCube(): Promise<CardanoCubeDApp[]> {
  try {
    // Placeholder: Cardano Cube doesn't have a public API
    // We'll manually curate based on their website
    console.log('[CardanoCube] Note: Using manual curation based on CardanoCube.io');

    return [
      // This would normally come from an API call
      // For now, we'll return empty and use manual registry
    ];
  } catch (error) {
    console.error('[CardanoCube] Failed to fetch:', error);
    return [];
  }
}

/**
 * Map Cardano Cube category to our dApp type
 */
export function mapCategoryToType(category: string): string {
  const mapping: Record<string, string> = {
    'DeFi': 'dex',
    'DEX': 'dex',
    'Decentralized Exchange': 'dex',
    'NFT': 'nft_marketplace',
    'NFT Marketplace': 'nft_marketplace',
    'Lending': 'lending',
    'Borrowing': 'lending',
    'Staking': 'staking',
    'Liquid Staking': 'staking',
    'Bridge': 'bridge',
    'Launchpad': 'launchpad',
    'Gaming': 'gaming',
    'Wallet': 'wallet',
    'Explorer': 'explorer',
    'Identity': 'identity',
    'Oracle': 'oracle',
  };

  return mapping[category] || 'other';
}
