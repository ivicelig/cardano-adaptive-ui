/**
 * External Discovery Sources
 * Fetches dApps from various Cardano registries and directories
 *
 * Sources:
 * 1. Essential Cardano GitHub (official IOG list)
 * 2. Built on Cardano API
 * 3. CardanoCube.io (web scraping fallback)
 * 4. DeFi Llama API (for DeFi projects)
 */

export interface ExternalDApp {
  name: string;
  description: string;
  website: string;
  category?: string;
  tags?: string[];
  twitter?: string;
  github?: string;
  source: string; // Where it was discovered from
}

/**
 * Fetch from Essential Cardano GitHub repository
 * Official list maintained by IOG/Intersect
 */
export async function fetchFromEssentialCardano(): Promise<ExternalDApp[]> {
  console.log('[EssentialCardano] Fetching dApps from GitHub...');

  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/input-output-hk/essential-cardano/main/essential-cardano-list.md',
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const markdown = await response.text();
    const dapps = parseEssentialCardanoMarkdown(markdown);

    console.log(`[EssentialCardano] Found ${dapps.length} dApps`);
    return dapps;
  } catch (error) {
    console.error('[EssentialCardano] Failed to fetch:', error);
    return [];
  }
}

/**
 * Parse Essential Cardano markdown file
 */
function parseEssentialCardanoMarkdown(markdown: string): ExternalDApp[] {
  const dapps: ExternalDApp[] = [];

  // Parse markdown structure
  // Format is typically: - [Name](url) - description
  const lines = markdown.split('\n');

  for (const line of lines) {
    // Match pattern: - [ProjectName](https://url) - Description
    const match = line.match(/^-\s*\[([^\]]+)\]\(([^)]+)\)\s*-?\s*(.*)$/);

    if (match) {
      const [, name, url, description] = match;

      // Filter out non-dApp entries (documentation, social links, etc.)
      if (url.includes('github.com') ||
          url.includes('twitter.com') ||
          url.includes('discord') ||
          name.toLowerCase().includes('guide') ||
          name.toLowerCase().includes('tutorial')) {
        continue;
      }

      dapps.push({
        name: name.trim(),
        description: description.trim() || `${name} on Cardano`,
        website: url,
        source: 'essential-cardano',
      });
    }
  }

  return dapps;
}

/**
 * Fetch from Built on Cardano
 */
export async function fetchFromBuiltOnCardano(): Promise<ExternalDApp[]> {
  console.log('[BuiltOnCardano] Fetching dApps...');

  try {
    // Built on Cardano has a JSON endpoint
    const response = await fetch(
      'https://builtoncardano.com/api/projects',
      {
        signal: AbortSignal.timeout(10000),
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Map their format to ours
    const dapps: ExternalDApp[] = (data.projects || []).map((project: any) => ({
      name: project.name || project.title,
      description: project.description || project.summary || '',
      website: project.website || project.url,
      category: project.category,
      tags: project.tags || [],
      twitter: project.twitter,
      github: project.github,
      source: 'built-on-cardano',
    }));

    console.log(`[BuiltOnCardano] Found ${dapps.length} dApps`);
    return dapps;
  } catch (error) {
    console.error('[BuiltOnCardano] Failed to fetch:', error);
    return [];
  }
}

/**
 * Fetch from DeFi Llama API (for DeFi projects only)
 */
export async function fetchFromDefiLlama(): Promise<ExternalDApp[]> {
  console.log('[DefiLlama] Fetching Cardano DeFi protocols...');

  try {
    const response = await fetch(
      'https://api.llama.fi/protocols',
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const protocols = await response.json();

    // Filter for Cardano protocols
    const cardanoProtocols = protocols.filter((p: any) =>
      p.chain === 'Cardano' || p.chains?.includes('Cardano')
    );

    const dapps: ExternalDApp[] = cardanoProtocols.map((protocol: any) => ({
      name: protocol.name,
      description: protocol.description || `${protocol.name} - ${protocol.category}`,
      website: protocol.url,
      category: protocol.category,
      tags: [protocol.category, 'defi'],
      source: 'defillama',
    }));

    console.log(`[DefiLlama] Found ${dapps.length} Cardano DeFi protocols`);
    return dapps;
  } catch (error) {
    console.error('[DefiLlama] Failed to fetch:', error);
    return [];
  }
}

/**
 * Map external categories to our dApp types
 */
export function mapCategoryToType(category?: string, tags?: string[]): string {
  if (!category && !tags) return 'other';

  const categoryLower = category?.toLowerCase() || '';
  const allTags = [...(tags || []), category || ''].map(t => t.toLowerCase());

  // Check tags for matches
  if (allTags.some(t => t.includes('dex') || t.includes('swap') || t.includes('amm'))) {
    return 'dex';
  }
  if (allTags.some(t => t.includes('nft') || t.includes('marketplace'))) {
    return 'nft_marketplace';
  }
  if (allTags.some(t => t.includes('lend') || t.includes('borrow'))) {
    return 'lending';
  }
  if (allTags.some(t => t.includes('stak') || t.includes('pool'))) {
    return 'staking';
  }
  if (allTags.some(t => t.includes('bridge') || t.includes('cross-chain'))) {
    return 'bridge';
  }
  if (allTags.some(t => t.includes('launch') || t.includes('ido'))) {
    return 'launchpad';
  }
  if (allTags.some(t => t.includes('game') || t.includes('metaverse'))) {
    return 'gaming';
  }
  if (allTags.some(t => t.includes('wallet'))) {
    return 'wallet';
  }
  if (allTags.some(t => t.includes('explorer') || t.includes('scan'))) {
    return 'explorer';
  }
  if (allTags.some(t => t.includes('oracle'))) {
    return 'oracle';
  }
  if (allTags.some(t => t.includes('identity') || t.includes('did'))) {
    return 'identity';
  }

  // Category-based mapping
  const categoryMap: Record<string, string> = {
    'dex': 'dex',
    'defi': 'dex',
    'nft': 'nft_marketplace',
    'lending': 'lending',
    'staking': 'staking',
    'bridge': 'bridge',
    'gaming': 'gaming',
    'wallet': 'wallet',
    'explorer': 'explorer',
    'oracle': 'oracle',
  };

  return categoryMap[categoryLower] || 'other';
}

/**
 * Merge and deduplicate dApps from multiple sources
 */
export function mergeAndDeduplicate(sources: ExternalDApp[][]): ExternalDApp[] {
  const allDApps = sources.flat();
  const uniqueMap = new Map<string, ExternalDApp>();

  for (const dapp of allDApps) {
    const key = dapp.name.toLowerCase().trim();

    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, dapp);
    } else {
      // Merge data if already exists (prefer more complete records)
      const existing = uniqueMap.get(key)!;
      uniqueMap.set(key, {
        ...existing,
        description: dapp.description.length > existing.description.length
          ? dapp.description
          : existing.description,
        category: dapp.category || existing.category,
        tags: [...new Set([...(existing.tags || []), ...(dapp.tags || [])])],
        twitter: dapp.twitter || existing.twitter,
        github: dapp.github || existing.github,
      });
    }
  }

  return Array.from(uniqueMap.values());
}
