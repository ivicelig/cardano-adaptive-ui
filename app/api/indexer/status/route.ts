import { NextRequest, NextResponse } from 'next/server';
import { getIndexerStatus } from '@/lib/indexer/scheduler';

/**
 * GET /api/indexer/status
 * Get current status of all indexed dApps
 */
export async function GET(request: NextRequest) {
  try {
    const status = await getIndexerStatus();

    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error('Error getting indexer status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get indexer status',
      },
      { status: 500 }
    );
  }
}
