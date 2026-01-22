/**
 * TapTools API Integration
 * Cardano-specific analytics and dApp data
 * Website: https://www.taptools.io/openapi/subscription
 *
 * Note: TapTools API requires a subscription key for full access.
 * For now, we'll use their public endpoints where available.
 */

export interface TapToolsDApp {
  name: string;
  description?: string;
  website?: string;
  type?: string;
  policyId?: string;
  verified?: boolean;
}

/**
 * Fetch popular tokens/projects from TapTools
 * This gives us insight into active Cardano projects
 */
export async function fetchFromTapTools(): Promise<TapToolsDApp[]> {
  console.log('[TapTools] Fetching Cardano project data...');

  try {
    // TapTools public endpoints (limited data without API key)
    // We can get popular token data which often correlates with dApps
    const response = await fetch(
      'https://openapi.taptools.io/api/v1/token/trending',
      {
        signal: AbortSignal.timeout(10000),
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn(`[TapTools] API returned ${response.status}, using fallback`);
      return [];
    }

    const data = await response.json();

    // Map token data to dApp format
    const dapps: TapToolsDApp[] = (data.tokens || [])
      .filter((token: any) => token.project || token.website)
      .map((token: any) => ({
        name: token.name || token.ticker,
        description: token.description,
        website: token.website,
        type: inferTypeFromToken(token),
        policyId: token.policyId,
        verified: token.verified,
      }));

    console.log(`[TapTools] Found ${dapps.length} projects`);
    return dapps;
  } catch (error) {
    console.error('[TapTools] Failed to fetch:', error);
    return [];
  }
}

/**
 * Infer dApp type from token metadata
 */
function inferTypeFromToken(token: any): string {
  const name = (token.name || '').toLowerCase();
  const description = (token.description || '').toLowerCase();

  if (name.includes('dex') || description.includes('exchange')) {
    return 'dex';
  }
  if (name.includes('nft') || description.includes('marketplace')) {
    return 'nft_marketplace';
  }
  if (name.includes('game') || description.includes('gaming')) {
    return 'gaming';
  }
  if (name.includes('lend') || description.includes('lending')) {
    return 'lending';
  }

  return 'other';
}

/**
 * Get DeFi statistics from TapTools (if available)
 */
export async function getTapToolsStats() {
  try {
    const response = await fetch(
      'https://openapi.taptools.io/api/v1/defi/overview',
      {
        signal: AbortSignal.timeout(5000),
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[TapTools] Stats not available');
  }

  return null;
}
