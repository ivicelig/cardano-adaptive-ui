import { NextRequest, NextResponse } from 'next/server';
import { getActiveDApps } from '@/lib/database/queries';

export async function GET(request: NextRequest) {
  try {
    const dapps = await getActiveDApps();

    // Parse JSON strings back to objects for response
    const parsedDApps = dapps.map(dapp => ({
      ...dapp,
      contractAddresses: JSON.parse(dapp.contractAddresses),
      interfaces: dapp.interfaces.map(iface => ({
        ...iface,
        inputSchema: JSON.parse(iface.inputSchema),
        outputSchema: JSON.parse(iface.outputSchema),
        contractInterface: JSON.parse(iface.contractInterface),
      })),
    }));

    return NextResponse.json({
      success: true,
      count: parsedDApps.length,
      dapps: parsedDApps,
    });
  } catch (error) {
    console.error('Error fetching dApps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dApps' },
      { status: 500 }
    );
  }
}
