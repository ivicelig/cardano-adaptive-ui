import { NextRequest, NextResponse } from 'next/server';
import { runIndexer } from '@/lib/indexer/scheduler';

/**
 * POST /api/indexer/run
 * Manually trigger the indexer to run
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📡 Manual indexer run triggered');

    const result = await runIndexer();

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? `Indexed ${result.indexed} dApps successfully (${result.failed} failures)`
        : 'Indexer job failed',
      ...result,
    });
  } catch (error) {
    console.error('Error running indexer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to run indexer',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
