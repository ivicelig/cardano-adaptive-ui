import { NextRequest, NextResponse } from 'next/server';
import { runDiscoveryJob } from '@/lib/indexer/discovery/discovery-scheduler';

/**
 * GET /api/cron/discovery
 * Automated cron job for discovering new dApps
 * Runs weekly to find new Cardano dApps from external sources
 *
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/discovery",
 *     "schedule": "0 0 * * 0"  // Weekly on Sunday at midnight
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    console.log('⏰ Automated discovery cron job triggered');

    // Run discovery with default settings
    // Only use working sources (free, public APIs)
    const result = await runDiscoveryJob({
      maxDApps: 100, // Keep top 100
      updateExisting: true,
      sources: ['essential', 'defillama', 'manual'],
    });

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron discovery job failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Cron job failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
