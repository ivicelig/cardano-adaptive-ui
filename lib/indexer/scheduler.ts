import { prisma } from '../database/client';
import { upsertPool } from '../database/queries';
import { IndexerFactory } from './indexer-factory';
import { IndexableDApp } from './types';

/**
 * Main indexer job
 * Runs periodically to update all active dApps
 */
export async function runIndexer() {
  console.log('🔄 Starting indexer job...');
  const startTime = Date.now();

  try {
    // 1. Get all active dApps from database
    const dapps = await prisma.dApp.findMany({
      where: { isActive: true },
    });

    console.log(`📊 Found ${dapps.length} active dApps to index`);

    // 2. Index each dApp
    let successCount = 0;
    let failureCount = 0;

    for (const dapp of dapps) {
      try {
        console.log(`\n🔍 Indexing ${dapp.name} (${dapp.type})...`);

        // Get the appropriate indexer for this dApp type
        const indexer = IndexerFactory.getIndexer(dapp.type);

        // Prepare dApp data for indexer
        const indexableDApp: IndexableDApp = {
          id: dapp.id,
          name: dapp.name,
          type: dapp.type,
          contractAddresses: JSON.parse(dapp.contractAddresses),
          apiEndpoint: dapp.apiEndpoint || undefined,
        };

        // Run the indexer
        const result = await indexer.index(indexableDApp);

        if (result.success) {
          // Update dApp metadata
          await prisma.dApp.update({
            where: { id: dapp.id },
            data: {
              tvl: result.tvl,
              volume24h: result.volume24h,
              lastIndexed: new Date(),
            },
          });

          // Update pools if any were returned
          if (result.pools && result.pools.length > 0) {
            console.log(`  💧 Found ${result.pools.length} pools`);

            for (const pool of result.pools) {
              await upsertPool({
                dappId: dapp.id,
                ...pool,
              });
            }
          }

          console.log(`  ✅ Successfully indexed ${dapp.name}`);
          successCount++;
        } else {
          console.error(`  ❌ Failed to index ${dapp.name}: ${result.error}`);
          failureCount++;
        }
      } catch (error) {
        console.error(`  ❌ Error indexing ${dapp.name}:`, error);
        failureCount++;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`\n✅ Indexer job complete in ${duration}ms`);
    console.log(`   Success: ${successCount}, Failures: ${failureCount}`);

    return {
      success: true,
      indexed: successCount,
      failed: failureCount,
      duration,
    };
  } catch (error) {
    console.error('❌ Indexer job failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get indexer status
 */
export async function getIndexerStatus() {
  const dapps = await prisma.dApp.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      type: true,
      lastIndexed: true,
      tvl: true,
      volume24h: true,
    },
    orderBy: { lastIndexed: 'desc' },
  });

  return {
    totalDApps: dapps.length,
    dapps: dapps.map((dapp) => ({
      ...dapp,
      lastIndexedMinutesAgo: dapp.lastIndexed
        ? Math.floor((Date.now() - dapp.lastIndexed.getTime()) / 60000)
        : null,
    })),
  };
}
