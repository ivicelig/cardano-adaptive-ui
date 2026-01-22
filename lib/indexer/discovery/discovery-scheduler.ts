import { prisma } from '@/lib/database/client';
import {
  fetchFromEssentialCardano,
  fetchFromBuiltOnCardano,
  fetchFromDefiLlama,
  mergeAndDeduplicate,
  mapCategoryToType,
  type ExternalDApp,
} from './external-sources';
import { fetchFromDappRadar, mapDappRadarCategory } from './dappradar-api';
import { fetchFromTapTools } from './taptools-api';
import { TOP_100_DAPPS } from './top-100-dapps';

export interface DiscoveryJobResult {
  success: boolean;
  discovered: number;
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
  sources: {
    dappRadar: number;
    tapTools: number;
    essentialCardano: number;
    builtOnCardano: number;
    defiLlama: number;
    manual: number;
  };
}

/**
 * Main discovery job - fetches dApps from all external sources
 */
export async function runDiscoveryJob(options: {
  maxDApps?: number; // Limit number of dApps to import (e.g., top 100)
  updateExisting?: boolean; // Update existing dApps with new data
  sources?: ('dappradar' | 'taptools' | 'essential' | 'built' | 'defillama' | 'manual')[];
} = {}): Promise<DiscoveryJobResult> {
  const {
    maxDApps = 100,
    updateExisting = true,
    // Default to only working sources (free, public APIs)
    sources = ['essential', 'defillama', 'manual'],
  } = options;

  console.log('🔍 Starting automated dApp discovery job...');
  console.log(`   Max dApps: ${maxDApps}`);
  console.log(`   Sources: ${sources.join(', ')}`);

  const result: DiscoveryJobResult = {
    success: true,
    discovered: 0,
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    sources: {
      dappRadar: 0,
      tapTools: 0,
      essentialCardano: 0,
      builtOnCardano: 0,
      defiLlama: 0,
      manual: 0,
    },
  };

  try {
    // 1. Fetch from all sources in parallel
    const fetchPromises: Promise<ExternalDApp[]>[] = [];

    // Priority 1: Public APIs with real data
    if (sources.includes('dappradar')) {
      fetchPromises.push(
        fetchFromDappRadar().then(dapps => {
          const mapped = dapps.map(d => ({
            name: d.name,
            description: d.description,
            website: d.website || d.link,
            category: mapDappRadarCategory(d.category),
            source: 'dappradar',
          }));
          result.sources.dappRadar = mapped.length;
          return mapped;
        })
      );
    }

    if (sources.includes('taptools')) {
      fetchPromises.push(
        fetchFromTapTools().then(dapps => {
          const mapped = dapps.map(d => ({
            name: d.name,
            description: d.description || '',
            website: d.website || '',
            category: d.type,
            source: 'taptools',
          }));
          result.sources.tapTools = mapped.length;
          return mapped;
        })
      );
    }

    if (sources.includes('essential')) {
      fetchPromises.push(
        fetchFromEssentialCardano().then(dapps => {
          result.sources.essentialCardano = dapps.length;
          return dapps;
        })
      );
    }

    if (sources.includes('built')) {
      fetchPromises.push(
        fetchFromBuiltOnCardano().then(dapps => {
          result.sources.builtOnCardano = dapps.length;
          return dapps;
        })
      );
    }

    if (sources.includes('defillama')) {
      fetchPromises.push(
        fetchFromDefiLlama().then(dapps => {
          result.sources.defiLlama = dapps.length;
          return dapps;
        })
      );
    }

    // Add manual registry as a source
    if (sources.includes('manual')) {
      fetchPromises.push(
        Promise.resolve(
          TOP_100_DAPPS.map(dapp => ({
            name: dapp.name,
            description: dapp.description,
            website: dapp.website,
            category: dapp.type,
            source: 'manual',
          }))
        ).then(dapps => {
          result.sources.manual = dapps.length;
          return dapps;
        })
      );
    }

    const allSources = await Promise.all(fetchPromises);

    // 2. Merge and deduplicate
    const uniqueDApps = mergeAndDeduplicate(allSources);
    result.discovered = uniqueDApps.length;

    console.log(`\n📊 Discovery results:`);
    console.log(`   DappRadar: ${result.sources.dappRadar}`);
    console.log(`   TapTools: ${result.sources.tapTools}`);
    console.log(`   Essential Cardano: ${result.sources.essentialCardano}`);
    console.log(`   Built on Cardano: ${result.sources.builtOnCardano}`);
    console.log(`   DeFi Llama: ${result.sources.defiLlama}`);
    console.log(`   Manual Registry: ${result.sources.manual}`);
    console.log(`   Total unique: ${result.discovered}`);

    // 3. Sort by priority (prefer manual registry, then by completeness)
    const sortedDApps = uniqueDApps.sort((a, b) => {
      // Manual registry first
      if (a.source === 'manual' && b.source !== 'manual') return -1;
      if (b.source === 'manual' && a.source !== 'manual') return 1;

      // Then by data completeness
      const scoreA = (a.description?.length || 0) + (a.category ? 10 : 0);
      const scoreB = (b.description?.length || 0) + (b.category ? 10 : 0);
      return scoreB - scoreA;
    });

    // 4. Take top N
    const topDApps = sortedDApps.slice(0, maxDApps);

    console.log(`\n💾 Importing top ${topDApps.length} dApps...`);

    // 5. Import into database
    for (const dapp of topDApps) {
      try {
        await importDApp(dapp, updateExisting, result);
      } catch (error) {
        const errorMsg = `Failed to import ${dapp.name}: ${error}`;
        result.errors.push(errorMsg);
        console.error(`  ❌ ${errorMsg}`);
      }
    }

    console.log(`\n✅ Discovery job complete:`);
    console.log(`   Discovered: ${result.discovered}`);
    console.log(`   Imported: ${result.imported}`);
    console.log(`   Updated: ${result.updated}`);
    console.log(`   Skipped: ${result.skipped}`);
    console.log(`   Errors: ${result.errors.length}`);

    return result;
  } catch (error) {
    console.error('❌ Discovery job failed:', error);
    result.success = false;
    result.errors.push(`Job failed: ${error}`);
    return result;
  }
}

/**
 * Import a single dApp into the database
 */
async function importDApp(
  dapp: ExternalDApp,
  updateExisting: boolean,
  result: DiscoveryJobResult
): Promise<void> {
  // Check if dApp already exists
  const existing = await prisma.dApp.findFirst({
    where: {
      OR: [
        { name: dapp.name },
        { websiteUrl: dapp.website },
      ],
    },
  });

  if (existing) {
    if (updateExisting) {
      // Update existing dApp
      await prisma.dApp.update({
        where: { id: existing.id },
        data: {
          description: dapp.description || existing.description,
          websiteUrl: dapp.website || existing.websiteUrl,
        },
      });
      result.updated++;
      console.log(`  ✏️  Updated: ${dapp.name}`);
    } else {
      result.skipped++;
      console.log(`  ⏭️  Skipped: ${dapp.name} (already exists)`);
    }
  } else {
    // Create new dApp
    const type = mapCategoryToType(dapp.category, dapp.tags);

    const created = await prisma.dApp.create({
      data: {
        name: dapp.name,
        type,
        description: dapp.description || `${dapp.name} on Cardano`,
        websiteUrl: dapp.website,
        contractAddresses: JSON.stringify([]),
        isActive: true,
      },
    });

    // Create default interface based on type
    await createDefaultInterface(created.id, type);

    result.imported++;
    console.log(`  ✅ Imported: ${dapp.name} (${type})`);
  }
}

/**
 * Create default interface schema for a dApp based on its type
 */
async function createDefaultInterface(dappId: string, type: string) {
  const interfaceConfigs: Record<string, any> = {
    dex: {
      actionType: 'swap',
      inputSchema: JSON.stringify({
        fromToken: { type: 'token-selector', label: 'From', required: true },
        toToken: { type: 'token-selector', label: 'To', required: true },
        amount: { type: 'number', label: 'Amount', required: true, min: 0 },
      }),
      outputSchema: JSON.stringify({
        rate: 'number',
        outputAmount: 'number',
        fee: 'number',
        slippage: 'number',
      }),
      contractInterface: JSON.stringify({ action: 'swap' }),
      exampleUsage: 'Swap tokens',
    },
    nft_marketplace: {
      actionType: 'nft-browse',
      inputSchema: JSON.stringify({
        collectionName: { type: 'text', label: 'Collection', required: false },
        minPrice: { type: 'number', label: 'Min Price', required: false },
        maxPrice: { type: 'number', label: 'Max Price', required: false },
      }),
      outputSchema: JSON.stringify({
        nfts: 'array',
        totalCount: 'number',
      }),
      contractInterface: JSON.stringify({ action: 'browse' }),
      exampleUsage: 'Browse NFTs',
    },
    lending: {
      actionType: 'stake',
      inputSchema: JSON.stringify({
        token: { type: 'token-selector', label: 'Token', required: true },
        amount: { type: 'number', label: 'Amount', required: true, min: 0 },
      }),
      outputSchema: JSON.stringify({
        apy: 'number',
        rewardTokens: 'number',
      }),
      contractInterface: JSON.stringify({ action: 'supply' }),
      exampleUsage: 'Supply assets',
    },
  };

  const config = interfaceConfigs[type];
  if (config) {
    await prisma.dAppInterface.create({
      data: {
        dappId,
        ...config,
      },
    });
  }
}

/**
 * Get last discovery run information
 */
export async function getLastDiscoveryRun() {
  // Get most recently indexed dApp
  const lastIndexed = await prisma.dApp.findFirst({
    orderBy: { createdAt: 'desc' },
    select: {
      name: true,
      createdAt: true,
      lastIndexed: true,
    },
  });

  const total = await prisma.dApp.count();

  return {
    lastRun: lastIndexed?.createdAt,
    totalDApps: total,
    lastDApp: lastIndexed?.name,
  };
}
