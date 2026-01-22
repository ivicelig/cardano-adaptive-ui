import { NextRequest, NextResponse } from 'next/server';
import { getLastDiscoveryRun } from '@/lib/indexer/discovery/discovery-scheduler';
import { prisma } from '@/lib/database/client';

/**
 * GET /api/discovery/status
 * Get status of the discovery system
 */
export async function GET(request: NextRequest) {
  try {
    const lastRun = await getLastDiscoveryRun();

    // Get counts by source (if we track this)
    const byType = await prisma.dApp.groupBy({
      by: ['type'],
      _count: true,
      orderBy: { _count: { _all: 'desc' } },
    });

    // Get recently added dApps
    const recentlyAdded = await prisma.dApp.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        name: true,
        type: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      discovery: {
        lastRun: lastRun.lastRun,
        totalDApps: lastRun.totalDApps,
        lastDApp: lastRun.lastDApp,
      },
      distribution: byType.map(item => ({
        type: item.type,
        count: item._count,
      })),
      recentlyAdded: recentlyAdded.map(dapp => ({
        name: dapp.name,
        type: dapp.type,
        addedAt: dapp.createdAt,
        minutesAgo: Math.floor((Date.now() - dapp.createdAt.getTime()) / 60000),
      })),
    });
  } catch (error) {
    console.error('Error getting discovery status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get discovery status',
      },
      { status: 500 }
    );
  }
}
