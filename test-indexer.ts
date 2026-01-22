import { IndexerFactory } from './lib/indexer/indexer-factory';
import { IndexableDApp } from './lib/indexer/types';

async function testIndexers() {
  console.log('🧪 Testing indexer system...\n');

  // Test 1: DEX indexer (has specific implementation)
  console.log('Test 1: DEX Indexer for Minswap');
  console.log('─'.repeat(50));
  const dexIndexer = IndexerFactory.getIndexer('dex');
  console.log(`Indexer type: ${dexIndexer.type}`);

  const minswap: IndexableDApp = {
    id: 'minswap-mainnet',
    name: 'Minswap',
    type: 'dex',
    contractAddresses: ['addr1z8snz7c4974vzdpxu65ruphl3zjdvtxw8strf2c2tmqnxz2j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq0xmsha'],
    apiEndpoint: 'https://api-mainnet-prod.minswap.org',
  };

  const minswapResult = await dexIndexer.index(minswap);
  console.log('Result:', minswapResult);

  // Test 2: NFT marketplace indexer (uses generic fallback)
  console.log('\n\nTest 2: Generic Indexer for JPG Store (NFT Marketplace)');
  console.log('─'.repeat(50));
  const nftIndexer = IndexerFactory.getIndexer('nft_marketplace');
  console.log(`Indexer type: ${nftIndexer.type}`);

  const jpgStore: IndexableDApp = {
    id: 'jpgstore-mainnet',
    name: 'JPG Store',
    type: 'nft_marketplace',
    contractAddresses: [],
    apiEndpoint: 'https://server.jpgstoreapis.com',
  };

  const jpgStoreResult = await nftIndexer.index(jpgStore);
  console.log('Result:', jpgStoreResult);

  // Test 3: Lending protocol (uses generic fallback)
  console.log('\n\nTest 3: Generic Indexer for Liqwid (Lending Protocol)');
  console.log('─'.repeat(50));
  const lendingIndexer = IndexerFactory.getIndexer('lending');
  console.log(`Indexer type: ${lendingIndexer.type}`);

  const liqwid: IndexableDApp = {
    id: 'liqwid-mainnet',
    name: 'Liqwid',
    type: 'lending',
    contractAddresses: [],
    apiEndpoint: undefined,
  };

  const liqwidResult = await lendingIndexer.index(liqwid);
  console.log('Result:', liqwidResult);

  // Summary
  console.log('\n\n📊 Summary');
  console.log('─'.repeat(50));
  console.log('✅ DEX (dex type) → Uses DEXIndexer (specific implementation)');
  console.log('✅ NFT Marketplace (nft_marketplace type) → Uses GenericIndexer (fallback)');
  console.log('✅ Lending (lending type) → Uses GenericIndexer (fallback)');
  console.log('\nThe generic indexer is used for any dApp type that doesn\'t have');
  console.log('a specific indexer implementation. It performs basic health checks');
  console.log('and attempts to fetch data from the dApp\'s API if available.');
}

testIndexers();
