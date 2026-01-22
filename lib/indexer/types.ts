// Generic indexer interface that all dApp-specific indexers implement
export interface DAppIndexer {
  // Unique identifier for this indexer
  type: string;

  // Index the dApp and return updated data
  index(dapp: IndexableDApp): Promise<IndexResult>;
}

export interface IndexableDApp {
  id: string;
  name: string;
  type: string;
  contractAddresses: string[];
  apiEndpoint?: string;
}

export interface IndexResult {
  success: boolean;
  tvl?: number;
  volume24h?: number;
  pools?: PoolData[];
  error?: string;
}

export interface PoolData {
  poolAddress: string;
  token0: string;
  token1: string;
  reserve0: string;
  reserve1: string;
  fee: number;
  liquidity: string;
}

// Discovery source configuration
export interface DAppDiscoverySource {
  type: 'registry' | 'blockchain_scan' | 'api';
  url?: string;
  contractAddresses?: string[];
}

export interface IndexerConfig {
  sources: DAppDiscoverySource[];
  indexInterval: number; // milliseconds
  maxRetries: number;
}
