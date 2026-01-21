import { NextRequest, NextResponse } from 'next/server';
import { parseIntent } from '@/lib/intent-parser';

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    const result = await parseIntent(input);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error parsing intent:', error);
    return NextResponse.json(
      { error: 'Failed to parse intent' },
      { status: 500 }
    );
  }
}
