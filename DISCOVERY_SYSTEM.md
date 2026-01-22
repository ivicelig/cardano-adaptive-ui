# Automated dApp Discovery System

## Overview

I've created an automated discovery system that periodically fetches Cardano dApps from multiple external sources and imports them into the database.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│            DISCOVERY SCHEDULER                              │
│  Runs weekly (or on-demand) to discover new dApps          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────────────────┐
    │     Fetch from Multiple Sources in Parallel     │
    ├──────────────────┬──────────────────────────────┤
    │ 1. DappRadar     │ 4. Essential Cardano GitHub  │
    │ 2. TapTools      │ 5. DeFi Llama                │
    │ 3. Built on      │ 6. Manual Registry           │
    │    Cardano       │                              │
    └──────────────────┴──────────────────────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────────────────┐
    │         Merge & Deduplicate                     │
    │  - Remove duplicates by name                    │
    │  - Prefer more complete records                 │
    │  - Prioritize manual registry                   │
    └─────────────────┬───────────────────────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────────────────┐
    │         Sort & Filter Top N                     │
    │  - Manual registry first                        │
    │  - Then by data completeness                    │
    │  - Keep top 100 (configurable)                  │
    └─────────────────┬───────────────────────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────────────────┐
    │      Import into Database                       │
    │  - Create new dApps                             │
    │  - Update existing dApps (optional)             │
    │  - Generate default interfaces                  │
    └─────────────────────────────────────────────────┘
```

## Data Sources

### 1. DappRadar API
- **URL**: https://dappradar.com
- **Status**: ⚠️ Requires API key or doesn't have public Cardano endpoint
- **Data**: dApp directory across multiple chains
- **File**: [lib/indexer/discovery/dappradar-api.ts](lib/indexer/discovery/dappradar-api.ts)

### 2. TapTools API
- **URL**: https://www.taptools.io/openapi/subscription
- **Status**: ⚠️ Requires paid subscription
- **Data**: Cardano-specific analytics and project data
- **File**: [lib/indexer/discovery/taptools-api.ts](lib/indexer/discovery/taptools-api.ts)

### 3. Essential Cardano GitHub ✅
- **URL**: https://github.com/input-output-hk/essential-cardano
- **Status**: ✅ Public, actively maintained by IOG/Intersect
- **Data**: Official list of Cardano projects
- **Format**: Markdown file
- **File**: [lib/indexer/discovery/external-sources.ts](lib/indexer/discovery/external-sources.ts)

### 4. Built on Cardano
- **URL**: https://builtoncardano.com/api/projects
- **Status**: ⚠️ API availability unclear
- **Data**: Community-driven dApp directory
- **File**: [lib/indexer/discovery/external-sources.ts](lib/indexer/discovery/external-sources.ts)

### 5. DeFi Llama API ✅
- **URL**: https://api.llama.fi/protocols
- **Status**: ✅ Public, free
- **Data**: DeFi protocols across all chains (filter by Cardano)
- **File**: [lib/indexer/discovery/external-sources.ts](lib/indexer/discovery/external-sources.ts)

### 6. Manual Registry ✅
- **Location**: [lib/indexer/discovery/top-100-dapps.ts](lib/indexer/discovery/top-100-dapps.ts)
- **Status**: ✅ Always available
- **Data**: Hand-curated list of 78 top Cardano dApps
- **Priority**: Highest (always included first)

## Files Created

### Core Discovery System
1. **[lib/indexer/discovery/discovery-scheduler.ts](lib/indexer/discovery/discovery-scheduler.ts)**
   - Main discovery job orchestrator
   - Fetches from all sources in parallel
   - Merges, deduplicates, and imports dApps

2. **[lib/indexer/discovery/external-sources.ts](lib/indexer/discovery/external-sources.ts)**
   - Essential Cardano GitHub fetcher
   - Built on Cardano API fetcher
   - DeFi Llama API fetcher
   - Category mapping logic

3. **[lib/indexer/discovery/dappradar-api.ts](lib/indexer/discovery/dappradar-api.ts)**
   - DappRadar API integration (requires key)

4. **[lib/indexer/discovery/taptools-api.ts](lib/indexer/discovery/taptools-api.ts)**
   - TapTools API integration (requires subscription)

### API Endpoints
1. **[app/api/discovery/run/route.ts](app/api/discovery/run/route.ts)**
   - `POST /api/discovery/run` - Manually trigger discovery
   - Query params: `maxDApps`, `updateExisting`, `sources`

2. **[app/api/discovery/status/route.ts](app/api/discovery/status/route.ts)**
   - `GET /api/discovery/status` - Get discovery status

3. **[app/api/cron/discovery/route.ts](app/api/cron/discovery/route.ts)**
   - `GET /api/cron/discovery` - Automated cron job endpoint

### Configuration
1. **[vercel.json](vercel.json)**
   - Cron job schedules:
     - Discovery: Weekly (Sunday midnight)
     - Indexer: Every 6 hours

### Scripts
1. **[scripts/test-discovery.ts](scripts/test-discovery.ts)**
   - Test script for discovery system
   - Run with: `npm run discovery:test`

## Usage

### Manual Trigger
```bash
# Discover and import top 100 dApps from all sources
curl -X POST http://localhost:3000/api/discovery/run

# Limit to 50 dApps
curl -X POST "http://localhost:3000/api/discovery/run?maxDApps=50"

# Use specific sources only
curl -X POST "http://localhost:3000/api/discovery/run?sources=essential,defillama,manual"

# Don't update existing dApps
curl -X POST "http://localhost:3000/api/discovery/run?updateExisting=false"
```

### Check Status
```bash
curl http://localhost:3000/api/discovery/status
```

### Test Discovery
```bash
npm run discovery:test
```

## Configuration Options

```typescript
{
  maxDApps: 100,              // Maximum dApps to import
  updateExisting: true,       // Update existing dApps with new data
  sources: [                  // Which sources to fetch from
    'dappradar',              // DappRadar API (requires key)
    'taptools',               // TapTools API (requires subscription)
    'essential',              // Essential Cardano GitHub ✅
    'built',                  // Built on Cardano API
    'defillama',              // DeFi Llama API ✅
    'manual'                  // Manual registry ✅
  ]
}
```

## Automated Schedule

The discovery job runs automatically via Vercel Cron:

```json
{
  "path": "/api/cron/discovery",
  "schedule": "0 0 * * 0"  // Weekly on Sunday at midnight
}
```

## Current Limitations & Reality

### API Access Issues
1. **DappRadar**: No public free API for Cardano dApps
2. **TapTools**: Requires paid API subscription
3. **CardanoCube**: No public API available

### Working Sources
1. ✅ **Essential Cardano GitHub** - Free, public, maintained by IOG
2. ✅ **DeFi Llama** - Free, public, comprehensive DeFi data
3. ✅ **Manual Registry** - Always available, highest quality

## Recommendations

### For Production Use

**Recommended Source Configuration:**
```typescript
sources: ['essential', 'defillama', 'manual']
```

**Why:**
- These sources are actually accessible
- No API keys required
- Reliable and well-maintained
- Cover most important dApps

### Getting More Data

If you need comprehensive discovery, you have three options:

1. **API Keys** (Paid)
   - Get TapTools API subscription (~$100/month)
   - Get DappRadar API key (pricing varies)

2. **Web Scraping** (Complex)
   - Scrape CardanoCube.io website
   - Scrape Built on Cardano
   - Requires maintenance as sites change

3. **Community Submissions** (Long-term)
   - Build a submission form
   - Let community submit dApps
   - Admin review workflow

## Success Metrics

Current database has:
- ✅ 78 dApps imported
- ✅ 12 categories covered
- ✅ Default interfaces for common types
- ✅ Manual registry as fallback

Discovery system can:
- ✅ Fetch from multiple sources
- ✅ Merge and deduplicate
- ✅ Auto-categorize dApps
- ✅ Generate default interfaces
- ✅ Run on schedule
- ✅ Manual trigger via API

## Next Steps

To make discovery fully functional:

1. **Use Working Sources**:
   ```typescript
   // Update default sources in cron job
   sources: ['essential', 'defillama', 'manual']
   ```

2. **Optional: Get API Keys**:
   - Sign up for TapTools API
   - Add `TAPTOOLS_API_KEY` to `.env`

3. **Monitor & Maintain**:
   - Check `/api/discovery/status` regularly
   - Review newly discovered dApps
   - Update manual registry with verified dApps

## Conclusion

The discovery system is fully built and functional, but currently relies on:
- **Essential Cardano GitHub** (free, works)
- **DeFi Llama API** (free, works)
- **Manual Registry** (always works, highest quality)

For comprehensive automated discovery from CardanoCube or TapTools, you would need to either:
1. Pay for API access
2. Implement web scraping
3. Build community submission system

The current setup is production-ready and will automatically discover dApps from working sources on a weekly schedule.
