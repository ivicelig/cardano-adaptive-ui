/**
 * Manual Registry of Known Cardano dApps
 *
 * This is the primary discovery method. We maintain a curated list of
 * verified, popular Cardano dApps. This is how major platforms like
 * DeFi Llama and CoinGecko work - they don't scan blockchains.
 *
 * To add a new dApp:
 * 1. Add it to the KNOWN_DAPPS array below
 * 2. Run `npm run db:seed` to update the database
 */

export interface DAppRegistryEntry {
  name: string;
  type: 'dex' | 'nft_marketplace' | 'lending' | 'staking' | 'bridge' | 'launchpad';
  description: string;
  website: string;
  contractAddresses: string[];
  apiEndpoint?: string;
  logoUrl?: string;
}

export const KNOWN_DAPPS: DAppRegistryEntry[] = [
  // ===== DEXes (Decentralized Exchanges) =====
  {
    name: 'Minswap',
    type: 'dex',
    description: 'The first multi-pool decentralized exchange on Cardano',
    website: 'https://minswap.org',
    contractAddresses: [
      'addr1z8snz7c4974vzdpxu65ruphl3zjdvtxw8strf2c2tmqnxz2j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq0xmsha'
    ],
    apiEndpoint: 'https://api-mainnet-prod.minswap.org',
    logoUrl: 'https://minswap.org/logo.png',
  },
  {
    name: 'SundaeSwap',
    type: 'dex',
    description: 'A decentralized exchange built on Cardano',
    website: 'https://sundaeswap.finance',
    contractAddresses: [
      'addr1w9qzpelu9hn45pefc0xr4ac4kdxeswq7pndul2vuj59u8tqaxdznu'
    ],
    apiEndpoint: 'https://stats.sundaeswap.finance',
    logoUrl: 'https://sundaeswap.finance/logo.png',
  },
  {
    name: 'MuesliSwap',
    type: 'dex',
    description: 'Hybrid DEX with both orderbook and AMM on Cardano',
    website: 'https://muesliswap.com',
    contractAddresses: [
      'addr1w9qzpelu9hn45pefc0xr4ac4kdxeswq7pndul2vuj59u8tqaxdznu'
    ],
    apiEndpoint: 'https://api.muesliswap.com',
    logoUrl: 'https://muesliswap.com/logo.png',
  },
  {
    name: 'WingRiders',
    type: 'dex',
    description: 'Automated market maker DEX on Cardano',
    website: 'https://www.wingriders.com',
    contractAddresses: [],
    apiEndpoint: 'https://api.wingriders.com',
    logoUrl: 'https://www.wingriders.com/logo.png',
  },
  {
    name: 'Spectrum Finance',
    type: 'dex',
    description: 'Cross-chain DEX protocol on Cardano',
    website: 'https://spectrum.fi',
    contractAddresses: [],
    apiEndpoint: 'https://api.spectrum.fi',
    logoUrl: 'https://spectrum.fi/logo.png',
  },

  // ===== NFT Marketplaces =====
  {
    name: 'JPG Store',
    type: 'nft_marketplace',
    description: 'The largest NFT marketplace on Cardano',
    website: 'https://jpg.store',
    contractAddresses: [],
    apiEndpoint: 'https://server.jpgstoreapis.com',
    logoUrl: 'https://jpg.store/logo.png',
  },
  {
    name: 'CNFT.io',
    type: 'nft_marketplace',
    description: 'Community-driven NFT marketplace on Cardano',
    website: 'https://cnft.io',
    contractAddresses: [],
    logoUrl: 'https://cnft.io/logo.png',
  },

  // ===== Lending & Borrowing =====
  {
    name: 'Liqwid',
    type: 'lending',
    description: 'Algorithmic and autonomous interest rate protocol on Cardano',
    website: 'https://liqwid.finance',
    contractAddresses: [],
    logoUrl: 'https://liqwid.finance/logo.png',
  },
  {
    name: 'Aada Finance',
    type: 'lending',
    description: 'Decentralized lending protocol on Cardano',
    website: 'https://aada.finance',
    contractAddresses: [],
    apiEndpoint: 'https://api.aada.finance',
    logoUrl: 'https://aada.finance/logo.png',
  },

  // ===== Liquid Staking =====
  {
    name: 'Lido on Cardano',
    type: 'staking',
    description: 'Liquid staking protocol for Cardano',
    website: 'https://lido.fi',
    contractAddresses: [],
    logoUrl: 'https://lido.fi/logo.png',
  },

  // ===== Bridges =====
  {
    name: 'Milkomeda',
    type: 'bridge',
    description: 'EVM sidechain and bridge for Cardano',
    website: 'https://milkomeda.com',
    contractAddresses: [],
    apiEndpoint: 'https://api.milkomeda.com',
    logoUrl: 'https://milkomeda.com/logo.png',
  },

  // ===== Launchpads =====
  {
    name: 'Genius Yield',
    type: 'launchpad',
    description: 'Smart order routing and yield optimization on Cardano',
    website: 'https://www.geniusyield.co',
    contractAddresses: [],
    logoUrl: 'https://www.geniusyield.co/logo.png',
  },
];

/**
 * Get all known dApps from the manual registry
 */
export function getKnownDApps(): DAppRegistryEntry[] {
  return KNOWN_DAPPS;
}

/**
 * Get known dApps by type
 */
export function getKnownDAppsByType(type: DAppRegistryEntry['type']): DAppRegistryEntry[] {
  return KNOWN_DAPPS.filter(dapp => dapp.type === type);
}

/**
 * Find a known dApp by name
 */
export function findKnownDApp(name: string): DAppRegistryEntry | undefined {
  return KNOWN_DAPPS.find(dapp =>
    dapp.name.toLowerCase() === name.toLowerCase()
  );
}
