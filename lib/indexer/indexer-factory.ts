import { DAppIndexer } from './types';
import { GenericIndexer } from './generic-indexer';
import { DEXIndexer } from './dex-indexer';

/**
 * IndexerFactory
 * Determines which indexer to use for a given dApp type
 */
export class IndexerFactory {
  private static indexers: Map<string, DAppIndexer> = new Map();

  /**
   * Get the appropriate indexer for a dApp type
   */
  static getIndexer(dappType: string): DAppIndexer {
    // Check if we already have an indexer instance for this type
    if (this.indexers.has(dappType)) {
      return this.indexers.get(dappType)!;
    }

    // Create new indexer based on type
    let indexer: DAppIndexer;

    switch (dappType) {
      case 'dex':
        indexer = new DEXIndexer();
        break;

      // Add more specific indexers as needed
      // case 'lending':
      //   indexer = new LendingIndexer();
      //   break;

      // case 'nft_marketplace':
      //   indexer = new NFTMarketplaceIndexer();
      //   break;

      // Default: use generic indexer for everything else
      default:
        indexer = new GenericIndexer();
        break;
    }

    // Cache the indexer instance
    this.indexers.set(dappType, indexer);
    return indexer;
  }

  /**
   * Register a custom indexer for a specific dApp type
   * Useful for adding new indexers without modifying this file
   */
  static registerIndexer(dappType: string, indexer: DAppIndexer): void {
    this.indexers.set(dappType, indexer);
  }
}
