import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

/**
 * GET /api/dapps/stats
 * Get statistics about dApps in the database
 */
export async function GET(request: NextRequest) {
  try {
    // Total counts
    const total = await prisma.dApp.count();
    const active = await prisma.dApp.count({ where: { isActive: true } });

    // By type
    const byType = await prisma.dApp.groupBy({
      by: ['type'],
      _count: true,
      orderBy: { _count: { _all: 'desc' } },
    });

    // With interfaces
    const withInterfaces = await prisma.dApp.count({
      where: {
        interfaces: {
          some: {},
        },
      },
    });

    // By action type
    const dexCount = await prisma.dApp.count({
      where: {
        type: 'dex',
        isActive: true,
      },
    });

    const nftCount = await prisma.dApp.count({
      where: {
        type: 'nft_marketplace',
        isActive: true,
      },
    });

    const lendingCount = await prisma.dApp.count({
      where: {
        type: 'lending',
        isActive: true,
      },
    });

    // Get sample dApps from each category
    const sampleDApps = await prisma.dApp.findMany({
      take: 5,
      where: { isActive: true },
      orderBy: { lastIndexed: 'desc' },
      select: {
        name: true,
        type: true,
        description: true,
        websiteUrl: true,
      },
    });

    return NextResponse.json({
      success: true,
      stats: {
        total,
        active,
        withInterfaces,
        byType: byType.map(item => ({
          type: item.type,
          count: item._count,
        })),
        byCategory: {
          dex: dexCount,
          nft: nftCount,
          lending: lendingCount,
        },
      },
      samples: sampleDApps,
    });
  } catch (error) {
    console.error('Error fetching dApp stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dApp statistics' },
      { status: 500 }
    );
  }
}
