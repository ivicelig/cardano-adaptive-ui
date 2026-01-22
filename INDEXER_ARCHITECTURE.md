# Indexer Architecture

## How the Generic Interface Works

### Overview
The indexer system uses a **generic interface** that all indexers implement, with **specific implementations** for complex dApp types (like DEXes) and a **generic fallback** for simpler dApp types.

```
┌─────────────────────────────────────────────────────────┐
│                   DAppIndexer Interface                 │
│  (Generic contract all indexers must follow)           │
│                                                         │
│  - type: string                                         │
│  - index(dapp): Promise<IndexResult>                    │
└─────────────────────────────────────────────────────────┘
                            │
                            │ implements
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────────┐                  ┌──────────────────┐
│   DEXIndexer     │                  │ GenericIndexer   │
│   (Specific)     │                  │   (Fallback)     │
├──────────────────┤                  ├──────────────────┤
│ - Query pools    │                  │ - Health check   │
│ - Parse datums   │                  │ - Fetch from API │
│ - Calculate TVL  │                  │ - Basic metadata │
│ - Track reserves │                  │                  │
└──────────────────┘                  └──────────────────┘
        │                                       │
        │ Used for:                            │ Used for:
        │ - DEXes (Minswap,                   │ - NFT marketplaces
        │   SundaeSwap, etc.)                 │ - Lending protocols
        │                                      │ - Staking platforms
        │                                      │ - Any unknown type
        └───────────────────────────────────────┘
```

## Decision Flow

```
User triggers indexer
        │
        ▼
Get all active dApps from database
        │
        ▼
For each dApp:
        │
        ├─────────────────────────────────────┐
        │                                     │
        ▼                                     ▼
  dApp type = "dex"?              dApp type = "nft_marketplace"?
        │                                     │
        YES                                   YES
        │                                     │
        ▼                                     ▼
  Use DEXIndexer ────────┐       Use GenericIndexer ────────┐
        │                │                   │                │
        │                │                   │                │
        ▼                │                   ▼                │
  - Query blockchain     │       - Check if website is up    │
  - Get pool UTXOs       │       - Try to fetch from API     │
  - Parse pool datums    │       - Update basic metadata     │
  - Calculate reserves   │                                    │
  - Update pool table    │                                    │
        │                │                   │                │
        └────────────────┴───────────────────┴────────────────┘
                                     │
                                     ▼
                         Update dApp in database
                         (TVL, volume, lastIndexed)
```

## When to Use Each Indexer Type

### DEXIndexer (Specific Implementation)
**Used for:** DEXes with on-chain liquidity pools

**What it does:**
1. Queries blockchain for pool UTXOs at contract addresses
2. Parses pool datums to extract:
   - Token pair (token0, token1)
   - Reserves (reserve0, reserve1)
   - Fee structure
   - Liquidity
3. Saves each pool to the `Pool` table
4. Calculates total TVL across all pools

**Example dApps:**
- Minswap
- SundaeSwap
- MuesliSwap
- WingRiders

### GenericIndexer (Fallback)
**Used for:** All other dApp types

**What it does:**
1. **Health Check**: Verifies the dApp website is accessible (HEAD request)
2. **API Fetch**: If the dApp has an API, tries to fetch:
   - TVL (total value locked)
   - 24h volume
   - Other metadata
3. **Minimal State**: Doesn't track complex on-chain state
4. Updates only basic dApp metadata

**Example dApps:**
- JPG Store (NFT marketplace)
- Liqwid (lending protocol)
- CNFT.io (NFT marketplace)
- Genius Yield (aggregator)

## Adding New Specific Indexers

If you need to add a new specific indexer (e.g., for lending protocols), follow this pattern:

### 1. Create the indexer class

```typescript
// lib/indexer/lending-indexer.ts
import { DAppIndexer, IndexableDApp, IndexResult } from './types';

export class LendingIndexer implements DAppIndexer {
  type = 'lending';

  async index(dapp: IndexableDApp): Promise<IndexResult> {
    // 1. Query lending pool contracts
    const pools = await this.queryLendingPools(dapp);

    // 2. Extract APY, borrow rates, collateral ratios
    const tvl = this.calculateTVL(pools);

    return {
      success: true,
      tvl,
      pools: [], // Or custom lending pool data
    };
  }

  private async queryLendingPools(dapp: IndexableDApp) {
    // Implementation here
  }
}
```

### 2. Register it in the factory

```typescript
// lib/indexer/indexer-factory.ts
import { LendingIndexer } from './lending-indexer';

switch (dappType) {
  case 'dex':
    indexer = new DEXIndexer();
    break;

  case 'lending':
    indexer = new LendingIndexer(); // Add this
    break;

  default:
    indexer = new GenericIndexer();
    break;
}
```

## Benefits of This Approach

### ✅ Flexibility
- Can add specific indexers for complex dApp types
- Generic fallback for simple dApps
- Easy to extend with new indexer types

### ✅ Consistency
- All indexers follow the same interface
- Scheduler doesn't need to know implementation details
- Easy to test and maintain

### ✅ Scalability
- Don't need to write complex indexers for every dApp
- Generic indexer handles 80% of cases
- Only write specific indexers when needed

### ✅ Future-Proof
- New dApp types automatically use generic indexer
- Can promote dApp types from generic → specific when needed
- No code changes required to add new dApps

## Example Usage

```typescript
// In the scheduler:
for (const dapp of dapps) {
  // Factory automatically chooses the right indexer
  const indexer = IndexerFactory.getIndexer(dapp.type);

  // All indexers have the same interface
  const result = await indexer.index(dapp);

  // Process result the same way regardless of indexer type
  if (result.success) {
    await updateDApp(dapp, result);
  }
}
```

## Summary

**Question:** "Why do you have multiple indexer types? Should there be one generic one?"

**Answer:**
- **One generic interface** (`DAppIndexer`) that all indexers implement
- **Multiple implementations:**
  - **Specific indexers** (like `DEXIndexer`) for complex dApp types that need on-chain data
  - **Generic fallback** (`GenericIndexer`) for simple dApps that just need API data
- **Factory pattern** automatically chooses the right indexer
- **No need to write custom code** for every dApp - generic indexer handles most cases
- **Easy to extend** - add specific indexers only when needed

This gives us the best of both worlds: simplicity for most dApps, with power for complex ones.
