import { NextRequest, NextResponse } from 'next/server';
import { Lucid, Blockfrost, Network } from '@lucid-evolution/lucid';

export async function POST(request: NextRequest) {
  try {
    const network = (process.env.NEXT_PUBLIC_CARDANO_NETWORK || 'Preprod') as Network;
    const blockfrostApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY;

    if (!blockfrostApiKey) {
      return NextResponse.json(
        { error: 'Blockfrost API key not configured' },
        { status: 500 }
      );
    }

    const lucid = await Lucid(
      new Blockfrost(
        network === 'Mainnet'
          ? 'https://cardano-mainnet.blockfrost.io/api/v0'
          : 'https://cardano-preprod.blockfrost.io/api/v0',
        blockfrostApiKey
      ),
      network
    );

    return NextResponse.json({
      success: true,
      network
    });
  } catch (error) {
    console.error('Failed to initialize Lucid:', error);
    return NextResponse.json(
      { error: 'Failed to initialize Cardano connection' },
      { status: 500 }
    );
  }
}
