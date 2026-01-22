import { NextRequest, NextResponse } from 'next/server';
import { runDiscoveryJob } from '@/lib/indexer/discovery/discovery-scheduler';

/**
 * POST /api/discovery/run
 * Manually trigger the discovery job to find and import new dApps
 *
 * Query params:
 * - maxDApps: number (default: 100) - Maximum dApps to import
 * - updateExisting: boolean (default: true) - Update existing dApps
 * - sources: comma-separated list (default: all) - Sources to fetch from
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const maxDApps = parseInt(searchParams.get('maxDApps') || '100');
    const updateExisting = searchParams.get('updateExisting') !== 'false';
    const sourcesParam = searchParams.get('sources');

    const sources = sourcesParam
      ? sourcesParam.split(',').map(s => s.trim() as any)
      : ['essential', 'built', 'defillama', 'manual'];

    console.log('📡 Manual discovery job triggered');
    console.log(`   Max dApps: ${maxDApps}`);
    console.log(`   Update existing: ${updateExisting}`);
    console.log(`   Sources: ${sources.join(', ')}`);

    const result = await runDiscoveryJob({
      maxDApps,
      updateExisting,
      sources,
    });

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? `Discovery complete: ${result.imported} imported, ${result.updated} updated`
        : 'Discovery job failed',
      ...result,
    });
  } catch (error) {
    console.error('Error running discovery job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to run discovery job',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
