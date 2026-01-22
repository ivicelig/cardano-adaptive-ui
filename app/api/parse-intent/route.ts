import { NextRequest, NextResponse } from 'next/server';
import { parseIntent } from '@/lib/intent-parser';
import { prisma } from '@/lib/database/client';
import { parseInterfaceToUISchema } from '@/lib/ui-generator/schema-parser';

/**
 * Enhanced Parse Intent API
 * - Parses user intent using Claude AI
 * - Queries database for matching dApps
 * - Returns enriched actions with UI schemas for dynamic rendering
 */
export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    // 1. Parse intent with Claude AI
    const intent = await parseIntent(input);
    console.log('[Parse-Intent API] Claude parsed intent:', {
      type: intent.intent?.type,
      parameters: intent.intent?.parameters,
      actions: intent.actions?.map(a => a.type),
      isSingleAction: !intent.actions
    });

    // 2. Check if single action or multi-action
    const isSingleAction = !intent.actions;
    const actions = isSingleAction ? [intent.intent] : intent.actions || [];
    console.log('[Parse-Intent API] Processing', actions.length, 'action(s):', actions.map((a: any) => a.type));

    // 3. For each action, find matching dApps and enrich with schemas
    const enrichedActions = await Promise.all(
      actions.map(async (action: any, index: number) => {
        console.log(`[Parse-Intent API] Finding dApps for action type: "${action.type}"`);

        // Find dApps that support this action type
        const matchingDApps = await prisma.dApp.findMany({
          where: {
            isActive: true,
            interfaces: {
              some: {
                actionType: action.type,
              },
            },
          },
          include: {
            interfaces: {
              where: {
                actionType: action.type,
              },
            },
            pools: action.type === 'swap' ? {
              where: {
                OR: [
                  { token0: action.parameters?.fromToken },
                  { token1: action.parameters?.toToken },
                ].filter(Boolean),
              },
            } : false,
          },
          take: 5, // Limit to top 5 matches
        });

        console.log(`[Parse-Intent API] Found ${matchingDApps.length} matching dApps for "${action.type}"`);

        if (matchingDApps.length === 0) {
          console.error(`[Parse-Intent API] ❌ No dApps found for action type: ${action.type}`);
          throw new Error(`No dApps found that support action type: ${action.type}`);
        }

        // For swap actions, find best DEX by comparing pools
        let selectedDApp = matchingDApps[0];
        let quote = null;

        if (action.type === 'swap' && action.parameters?.fromToken && action.parameters?.toToken) {
          // TODO: Implement best DEX finder logic
          // For now, just use first match with a pool
          const dappWithPool = matchingDApps.find((d) => d.pools && d.pools.length > 0);
          if (dappWithPool) {
            selectedDApp = dappWithPool;
            // Calculate quote from pool reserves (simplified)
            const pool = dappWithPool.pools![0];
            quote = {
              dex: selectedDApp.name,
              pool: pool.poolAddress,
              estimatedOutput: 'TBD', // TODO: Calculate from pool reserves
              fee: pool.fee,
            };
          }
        } else {
          // For non-swap actions, use first match
          selectedDApp = matchingDApps[0];
        }

        // Get interface schema
        const dappInterface = selectedDApp.interfaces[0];
        if (!dappInterface) {
          throw new Error(`No interface found for ${selectedDApp.name} - ${action.type}`);
        }

        // Parse to UI schema
        const uiSchema = parseInterfaceToUISchema(dappInterface, selectedDApp.name);

        return {
          order: index + 1,
          type: action.type,
          dappId: selectedDApp.id,
          dappName: selectedDApp.name,
          parameters: action.parameters || {},
          confidence: action.confidence || 0.9,
          dependsOn: action.dependsOn || null,
          outputUsedBy: action.outputUsedBy || null,
          uiSchema,
          quote,
          alternatives: matchingDApps.map((d) => ({
            id: d.id,
            name: d.name,
            type: d.type,
          })),
        };
      })
    );

    // 4. Create action chain in database if multi-action
    let chainId = null;
    if (!isSingleAction && enrichedActions.length > 1) {
      const actionChain = await prisma.actionChain.create({
        data: {
          intentText: input,
          actions: JSON.stringify(enrichedActions),
          status: 'pending',
        },
      });
      chainId = actionChain.id;
    }

    // 5. Return enriched response
    return NextResponse.json({
      success: true,
      isSingleAction,
      chainId,
      executionMode: intent.executionMode || 'sequential',
      totalActions: enrichedActions.length,
      actions: enrichedActions,
      originalIntent: intent,
    });
  } catch (error) {
    console.error('Error parsing intent:', error);
    return NextResponse.json(
      {
        error: 'Failed to parse intent',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
