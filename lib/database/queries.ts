import { prisma } from './client';

// Get all active dApps
export async function getActiveDApps() {
  return prisma.dApp.findMany({
    where: { isActive: true },
    include: {
      interfaces: true,
      pools: true,
    },
    orderBy: { lastIndexed: 'desc' },
  });
}

// Get dApps by type
export async function getDAppsByType(type: string) {
  return prisma.dApp.findMany({
    where: {
      type,
      isActive: true,
    },
    include: {
      interfaces: true,
      pools: true,
    },
  });
}

// Get dApps that support a specific action type
export async function getDAppsByActionType(actionType: string) {
  return prisma.dApp.findMany({
    where: {
      isActive: true,
      interfaces: {
        some: {
          actionType,
        },
      },
    },
    include: {
      interfaces: {
        where: {
          actionType,
        },
      },
      pools: true,
    },
  });
}

// Get pools for a specific token pair
export async function getPoolsForTokenPair(token0: string, token1: string) {
  return prisma.pool.findMany({
    where: {
      OR: [
        { token0, token1 },
        { token0: token1, token1: token0 },
      ],
    },
    include: {
      dapp: true,
    },
    orderBy: { lastUpdated: 'desc' },
  });
}

// Create or update a dApp
export async function upsertDApp(data: {
  id?: string;
  name: string;
  type: string;
  description: string;
  contractAddresses: string[];
  logoUrl?: string;
  websiteUrl: string;
  apiEndpoint?: string;
  tvl?: number;
  volume24h?: number;
}) {
  return prisma.dApp.upsert({
    where: { id: data.id || '' },
    create: {
      name: data.name,
      type: data.type,
      description: data.description,
      contractAddresses: JSON.stringify(data.contractAddresses),
      logoUrl: data.logoUrl,
      websiteUrl: data.websiteUrl,
      apiEndpoint: data.apiEndpoint,
      tvl: data.tvl,
      volume24h: data.volume24h,
    },
    update: {
      name: data.name,
      type: data.type,
      description: data.description,
      contractAddresses: JSON.stringify(data.contractAddresses),
      logoUrl: data.logoUrl,
      websiteUrl: data.websiteUrl,
      apiEndpoint: data.apiEndpoint,
      tvl: data.tvl,
      volume24h: data.volume24h,
      lastIndexed: new Date(),
    },
  });
}

// Create or update a pool
export async function upsertPool(data: {
  dappId: string;
  poolAddress: string;
  token0: string;
  token1: string;
  reserve0: string;
  reserve1: string;
  fee: number;
  liquidity: string;
}) {
  return prisma.pool.upsert({
    where: { poolAddress: data.poolAddress },
    create: data,
    update: {
      reserve0: data.reserve0,
      reserve1: data.reserve1,
      liquidity: data.liquidity,
      lastUpdated: new Date(),
    },
  });
}

// Create an action chain
export async function createActionChain(data: {
  userId?: string;
  intentText: string;
  actions: any[];
}) {
  return prisma.actionChain.create({
    data: {
      userId: data.userId,
      intentText: data.intentText,
      actions: JSON.stringify(data.actions),
      status: 'pending',
    },
  });
}

// Update action chain status
export async function updateActionChainStatus(
  id: string,
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
) {
  return prisma.actionChain.update({
    where: { id },
    data: {
      status,
      completedAt: status === 'completed' ? new Date() : null,
    },
  });
}
