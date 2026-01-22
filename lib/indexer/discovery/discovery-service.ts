import { prisma } from '@/lib/database/client';
import { TOP_100_DAPPS } from './top-100-dapps';

/**
 * Discovery Service
 * Handles importing dApps from various sources into the database
 */

export interface DiscoveryResult {
  success: boolean;
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
}

/**
 * Import dApps from the manual registry into the database
 */
export async function importFromManualRegistry(): Promise<DiscoveryResult> {
  console.log('📡 Starting dApp discovery from manual registry...');

  const result: DiscoveryResult = {
    success: true,
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  for (const dapp of TOP_100_DAPPS) {
    try {
      // Check if dApp already exists
      const existing = await prisma.dApp.findFirst({
        where: { name: dapp.name },
      });

      if (existing) {
        // Update existing dApp
        await prisma.dApp.update({
          where: { id: existing.id },
          data: {
            description: dapp.description,
            websiteUrl: dapp.website,
            contractAddresses: JSON.stringify(dapp.contractAddresses),
            apiEndpoint: dapp.apiEndpoint,
            logoUrl: dapp.logoUrl,
          },
        });
        result.updated++;
        console.log(`  ✏️  Updated: ${dapp.name}`);
      } else {
        // Create new dApp with proper interface
        const created = await prisma.dApp.create({
          data: {
            name: dapp.name,
            type: dapp.type,
            description: dapp.description,
            websiteUrl: dapp.website,
            contractAddresses: JSON.stringify(dapp.contractAddresses),
            apiEndpoint: dapp.apiEndpoint,
            logoUrl: dapp.logoUrl,
            isActive: true,
          },
        });

        // Create default interface based on type
        await createDefaultInterface(created.id, dapp.type);

        result.imported++;
        console.log(`  ✅ Imported: ${dapp.name} (${dapp.type})`);
      }
    } catch (error) {
      const errorMsg = `Failed to import ${dapp.name}: ${error}`;
      result.errors.push(errorMsg);
      console.error(`  ❌ ${errorMsg}`);
    }
  }

  console.log(`\n📊 Discovery complete:`);
  console.log(`   Imported: ${result.imported}`);
  console.log(`   Updated: ${result.updated}`);
  console.log(`   Errors: ${result.errors.length}`);

  return result;
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
        priceImpact: 'number',
      }),
      contractInterface: JSON.stringify({ action: 'swap' }),
      exampleUsage: 'Swap tokens with optimal routing',
    },
    nft_marketplace: {
      actionType: 'nft-browse',
      inputSchema: JSON.stringify({
        collectionName: { type: 'text', label: 'Collection', required: false },
        minPrice: { type: 'number', label: 'Min Price (ADA)', required: false },
        maxPrice: { type: 'number', label: 'Max Price (ADA)', required: false },
      }),
      outputSchema: JSON.stringify({
        nfts: 'array',
        totalCount: 'number',
      }),
      contractInterface: JSON.stringify({ action: 'browse' }),
      exampleUsage: 'Browse and purchase NFTs',
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
      exampleUsage: 'Supply assets to earn yield',
    },
    staking: {
      actionType: 'stake',
      inputSchema: JSON.stringify({
        amount: { type: 'number', label: 'Amount (ADA)', required: true, min: 0 },
      }),
      outputSchema: JSON.stringify({
        stakedAmount: 'number',
        rewards: 'number',
      }),
      contractInterface: JSON.stringify({ action: 'stake' }),
      exampleUsage: 'Stake ADA to earn rewards',
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
 * Get discovery statistics
 */
export async function getDiscoveryStats() {
  const totalInRegistry = TOP_100_DAPPS.length;
  const totalInDatabase = await prisma.dApp.count();

  const byType = await prisma.dApp.groupBy({
    by: ['type'],
    _count: true,
  });

  return {
    registryTotal: totalInRegistry,
    databaseTotal: totalInDatabase,
    byType: byType.map(item => ({
      type: item.type,
      count: item._count,
    })),
  };
}
