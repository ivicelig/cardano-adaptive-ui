# dApp Discovery on Cardano

## The Problem
**You cannot realistically scan the entire Cardano blockchain to discover all dApps.**

Why?
- Cardano has millions of transactions
- No standard "dApp registration" on-chain
- Contract addresses don't have metadata identifying them as "dApps"
- Would require scanning every script address and trying to determine what it does

## Realistic Discovery Methods

### 1. **Manual Registry (Initial Approach)** ⭐ RECOMMENDED
Start with a curated list of known, popular dApps.

**How it works:**
```typescript
// lib/indexer/known-dapps.ts
export const KNOWN_DAPPS = [
  {
    name: 'Minswap',
    type: 'dex',
    contractAddresses: ['addr1z8snz7c4974vzdpxu65ruphl3zjdvtxw8strf2c2tmqnxz2j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq0xmsha'],
    website: 'https://minswap.org',
    apiEndpoint: 'https://api-mainnet-prod.minswap.org'
  },
  {
    name: 'SundaeSwap',
    type: 'dex',
    contractAddresses: ['addr1w9qzpelu9hn45pefc0xr4ac4kdxeswq7pndul2vuj59u8tqaxdznu'],
    website: 'https://sundaeswap.finance',
  },
  {
    name: 'JPG Store',
    type: 'nft_marketplace',
    contractAddresses: [],
    website: 'https://jpg.store',
    apiEndpoint: 'https://server.jpgstoreapis.com'
  },
  // Add more as you discover them
];
```

**Pros:**
- ✅ Simple and reliable
- ✅ Only includes vetted/audited dApps
- ✅ Can verify each dApp before adding
- ✅ Works immediately

**Cons:**
- ❌ Requires manual maintenance
- ❌ Won't discover new dApps automatically

**This is how most aggregators start** (DeFi Llama, CoinGecko, etc.)

---

### 2. **Use Existing Registries/APIs** ⭐ RECOMMENDED

Leverage existing community-maintained lists.

#### Option A: Cardano Cube API
```typescript
// Fetch from Cardano Cube (community registry)
const response = await fetch('https://api.cardanocube.com/api/v1/dapps');
const dapps = await response.json();
```

**Cardano Cube** (https://www.cardanocube.io) maintains a registry of Cardano dApps.

#### Option B: Built on Cardano
```typescript
// Fetch from Built on Cardano directory
const response = await fetch('https://builtoncardano.com/api/projects');
const projects = await response.json();
```

#### Option C: Essential Cardano
GitHub repo with curated list: https://github.com/input-output-hk/essential-cardano

**Pros:**
- ✅ Community-maintained
- ✅ Relatively up-to-date
- ✅ Includes metadata (descriptions, links)
- ✅ Automated updates

**Cons:**
- ❌ Depends on third-party service
- ❌ May include inactive projects
- ❌ Need to verify contract addresses

---

### 3. **Community Submissions** (Future Enhancement)

Allow users to submit new dApps for review.

```typescript
// app/api/dapps/submit/route.ts
export async function POST(request: NextRequest) {
  const { name, type, website, contractAddresses } = await request.json();

  // 1. Validate submission
  // 2. Mark as "pending review"
  // 3. Admin reviews and approves
  // 4. Add to database if approved

  await prisma.dApp.create({
    data: {
      name,
      type,
      website,
      contractAddresses: JSON.stringify(contractAddresses),
      isActive: false, // Pending review
      status: 'pending_review',
    }
  });
}
```

**Pros:**
- ✅ Community-driven
- ✅ Discovers new dApps faster
- ✅ Scales with community growth

**Cons:**
- ❌ Requires moderation
- ❌ Risk of spam/malicious submissions
- ❌ Need approval workflow

---

### 4. **Monitor Popular Script Addresses** (Advanced)

Track addresses with high transaction volume.

```typescript
// Query Blockfrost for most active script addresses
const response = await fetch(
  'https://cardano-mainnet.blockfrost.io/api/v0/scripts',
  {
    headers: { project_id: BLOCKFROST_KEY }
  }
);

// Filter by transaction count
const activeScripts = scripts.filter(s => s.tx_count > 1000);

// Manually investigate what these scripts do
```

**Pros:**
- ✅ Can discover new dApps
- ✅ Finds actually used contracts

**Cons:**
- ❌ Still requires manual investigation
- ❌ Can't automatically determine what a script does
- ❌ High transaction count doesn't mean it's a "dApp"
- ❌ Expensive (many API calls)

---

### 5. **On-Chain dApp Registry** (Future/Ideal)

A decentralized registry smart contract where dApps register themselves.

```plutus
-- Plutus contract concept
data DAppRegistration = DAppRegistration
  { name :: BuiltinByteString
  , dappType :: BuiltinByteString
  , contractAddresses :: [Address]
  , metadata :: BuiltinByteString -- JSON metadata
  }

-- dApps would submit transactions to register themselves
```

**Pros:**
- ✅ Fully decentralized
- ✅ On-chain source of truth
- ✅ Can be queried by anyone

**Cons:**
- ❌ Doesn't exist yet
- ❌ Requires community adoption
- ❌ dApps must actively register
- ❌ Still need to verify legitimacy

---

## Recommended Implementation Strategy

### Phase 1: Manual Registry (Start Here)
```typescript
// lib/indexer/discovery/manual-registry.ts
export async function discoverFromManualRegistry() {
  const dapps = [
    // Top DEXes
    { name: 'Minswap', type: 'dex', ... },
    { name: 'SundaeSwap', type: 'dex', ... },
    { name: 'MuesliSwap', type: 'dex', ... },
    { name: 'WingRiders', type: 'dex', ... },
    { name: 'Spectrum', type: 'dex', ... },

    // Top NFT Marketplaces
    { name: 'JPG Store', type: 'nft_marketplace', ... },
    { name: 'CNFT.io', type: 'nft_marketplace', ... },

    // Lending/Borrowing
    { name: 'Liqwid', type: 'lending', ... },
    { name: 'Aada Finance', type: 'lending', ... },

    // Liquid Staking
    { name: 'Lido', type: 'staking', ... },
  ];

  return dapps;
}
```

**Start with 10-20 popular dApps**, then expand.

### Phase 2: Import from External Registry
```typescript
// lib/indexer/discovery/external-registry.ts
export async function discoverFromCardanoCube() {
  try {
    const response = await fetch('https://api.cardanocube.com/api/v1/dapps');
    const dapps = await response.json();

    // Map to our format
    return dapps.map(dapp => ({
      name: dapp.name,
      type: inferType(dapp.category), // Map their categories to our types
      website: dapp.website,
      contractAddresses: dapp.contracts || [],
      apiEndpoint: dapp.api,
    }));
  } catch (error) {
    console.error('Failed to fetch from Cardano Cube:', error);
    return [];
  }
}

function inferType(category: string): string {
  const mapping: Record<string, string> = {
    'DeFi': 'dex',
    'DEX': 'dex',
    'NFT': 'nft_marketplace',
    'Lending': 'lending',
    'Staking': 'staking',
  };
  return mapping[category] || 'unknown';
}
```

### Phase 3: Periodic Sync
```typescript
// Run this weekly to discover new dApps
export async function syncDAppRegistry() {
  // 1. Get dApps from manual registry
  const manualDApps = await discoverFromManualRegistry();

  // 2. Get dApps from external registries
  const externalDApps = await discoverFromCardanoCube();

  // 3. Merge and deduplicate
  const allDApps = mergeAndDeduplicate(manualDApps, externalDApps);

  // 4. Add new dApps to database
  for (const dapp of allDApps) {
    await prisma.dApp.upsert({
      where: { name: dapp.name },
      create: dapp,
      update: {}, // Don't overwrite existing data
    });
  }
}
```

---

## The Truth About dApp Discovery

### What Major Platforms Do

**DeFi Llama** (DeFi analytics):
- Manual registry of protocols
- Community submissions
- Team reviews each protocol

**CoinGecko** (token/dApp listings):
- Application form for projects
- Manual verification process
- Doesn't "scan blockchain"

**DexScreener** (DEX aggregator):
- Hardcoded list of DEX contracts
- Monitors those specific contracts
- Manual addition of new DEXes

### Why Full Blockchain Scanning Doesn't Work

1. **Scale**: Cardano has 90M+ transactions, thousands of smart contracts
2. **Ambiguity**: A script address could be:
   - A DEX pool
   - An NFT minting contract
   - A multi-sig wallet
   - A game contract
   - A payment contract
   - Anything else
3. **No Metadata**: Contracts don't self-describe what they do
4. **Cost**: Querying every script on-chain is expensive (API costs)
5. **Maintenance**: Even if you found contracts, you'd need to figure out what they do

---

## Recommended Architecture

```
┌─────────────────────────────────────────────────────┐
│           DISCOVERY (Weekly/Manual)                 │
│                                                     │
│  1. Manual Registry (hardcoded list)               │
│  2. Cardano Cube API (fetch weekly)                │
│  3. Community Submissions (with review)            │
│                                                     │
│  ↓ Add new dApps to database                       │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│         INDEXING (Every 6 hours)                    │
│                                                     │
│  For each known dApp in database:                  │
│  - Run appropriate indexer                         │
│  - Update pool states                              │
│  - Update TVL/volume                               │
│  - Update metadata                                 │
└─────────────────────────────────────────────────────┘
```

**Discovery** = Finding new dApps (infrequent, manual)
**Indexing** = Updating known dApps (frequent, automatic)

---

## Summary

**Question:** "How are you gonna scan all dApps on Cardano?"

**Answer:** **You don't.**

Instead:
1. ✅ **Start with a curated list** of 10-20 popular dApps
2. ✅ **Import from existing registries** (Cardano Cube, Built on Cardano)
3. ✅ **Allow community submissions** with review process
4. ✅ **Focus on indexing** the dApps you know about
5. ❌ **Don't try to scan the entire blockchain** - it's not practical

This is how **all major platforms work** (DeFi Llama, CoinGecko, DexScreener, etc.). They maintain curated lists, not blockchain scanners.
