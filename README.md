# Cardano Adaptive UI

A dynamic, intent-driven interface for Cardano dApps that automatically discovers applications and generates UI on-the-fly. No hardcoded components needed!

## 🎯 What Makes This Different?

Instead of building separate interfaces for each Cardano dApp, this system:

1. **Automatically discovers** Cardano dApps from multiple sources (946+ found)
2. **Stores them in a database** with interface schemas (78 imported, 24 with schemas)
3. **Parses user intent** using Claude AI
4. **Generates UI dynamically** from database schemas
5. **Handles multi-action chains** (e.g., "Swap 100 ADA for DJED, then stake the DJED")

**Example:**
```
User: "Swap 100 ADA for DJED, then stake the DJED on Liqwid"

System:
1. Parses intent → 2 actions (swap, stake) with dependency
2. Queries DB → Finds Minswap (best DEX) and Liqwid (DJED staking)
3. Generates UI → Shows 2-step action chain
4. Executes → Swaps on Minswap (76 DJED), stakes on Liqwid
```

## ✨ Key Features

- 🤖 **AI-Powered Intent Parsing** - Natural language understanding via Claude Sonnet 4.5
- 🔄 **Automated Discovery** - Weekly discovery of new Cardano dApps (946+ found)
- 🎨 **Dynamic UI Generation** - Zero hardcoded components per dApp
- ⛓️ **Multi-Action Chains** - Handle complex workflows with dependencies
- 📊 **Database-Driven** - 78 dApps indexed with 24 having UI schemas
- 🔍 **Smart Matching** - Finds best dApp for each action
- 💾 **SQLite/PostgreSQL** - Prisma ORM with flexible database support

## 🚀 Quick Start

### Prerequisites

- Node.js 20.18+
- npm or pnpm
- Anthropic API key ([get one here](https://console.anthropic.com/))

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# Set up database
npx prisma generate
npx prisma db push

# Seed database with 78 curated dApps
npm run db:seed:100

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Try It Out

Enter natural language prompts:
- `"Swap 100 ADA for DJED"` → Shows dynamic swap form
- `"Stake 50 ADA"` → Shows stake form
- `"Buy an NFT from JPG Store"` → Shows NFT browse form
- `"Swap 50 ADA for DJED, then stake the DJED"` → Shows 2-step action chain

## 📚 Documentation

- **[Discovery System](DISCOVERY_COMPLETE.md)** - Automated dApp discovery (946+ dApps found)
- **[Dynamic UI System](DYNAMIC_UI_COMPLETE.md)** - UI generation from database schemas
- **[Architecture Overview](DISCOVERY_SYSTEM.md)** - System design and implementation

## 🗂️ Project Structure

```
cardano-adaptive-ui/
├── app/
│   ├── api/
│   │   ├── parse-intent/         # ✅ Enhanced - Queries DB, returns schemas
│   │   ├── actions/execute/      # ✅ NEW - Action execution (mock)
│   │   ├── discovery/            # ✅ Discovery triggers
│   │   └── cron/discovery/       # ✅ Weekly automated job
│   └── page.tsx
│
├── components/
│   ├── AdaptiveUI.tsx            # ✅ Updated - Uses dynamic components
│   ├── DynamicUI.tsx             # ✅ NEW - Dynamic form generator
│   ├── ActionChainUI.tsx         # ✅ NEW - Multi-action UI
│   ├── SwapInterface.tsx         # Legacy (fallback)
│   └── WalletConnect.tsx
│
├── lib/
│   ├── database/
│   │   ├── client.ts             # Prisma client
│   │   └── queries.ts            # Common queries
│   ├── indexer/discovery/
│   │   ├── discovery-scheduler.ts    # ✅ Main orchestrator
│   │   ├── external-sources.ts       # ✅ Essential Cardano, DeFi Llama
│   │   └── top-100-dapps.ts          # ✅ 78 curated dApps
│   ├── ui-generator/
│   │   └── schema-parser.ts      # ✅ NEW - DB schema → UI schema
│   └── intent-parser.ts          # Claude AI parsing
│
├── prisma/
│   └── schema.prisma             # 4 tables: DApp, DAppInterface, Pool, ActionChain
│
└── scripts/
    ├── test-discovery.ts         # Test discovery system
    ├── test-dynamic-ui.ts        # ✅ Test UI generation
    └── seed-100-dapps.ts         # Seed database
```

## 🧪 Testing

### Test Discovery System
```bash
npm run discovery:test
```
**Output:** Discovers 946+ dApps from 3 sources (Essential Cardano, DeFi Llama, Manual)

### Test Dynamic UI
```bash
npm run ui:test
```
**Output:** Verifies 24 dApps with UI schemas across 5 action types

### View Database
```bash
npm run db:studio
```
Opens Prisma Studio to explore the database.

## 📊 Current Status

### What Works ✅

**Discovery System:**
- ✅ 946+ dApps discovered from 3 sources
- ✅ Weekly automated discovery via Vercel Cron
- ✅ 78 dApps in database (curated)
- ✅ Smart deduplication and prioritization

**Dynamic UI Generation:**
- ✅ 24 dApps with interface schemas
- ✅ 5 action types: swap (9 DEXes), buy_nft (1), nft-browse (9), stake (4), unstake (1)
- ✅ Multi-action chain UI with dependencies
- ✅ Form validation and result display

**Intent Parsing:**
- ✅ Natural language understanding
- ✅ Multi-action detection
- ✅ Parameter extraction
- ✅ dApp matching from database

### What's Next 🚧

- **Transaction Building** - Implement actual Cardano transactions with Lucid Evolution
- **Best DEX Finder** - Real-time pool queries and quote comparison
- **More Action Types** - Borrow, lend, provide liquidity
- **Parallel Execution** - Execute independent actions simultaneously

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion
- **Backend:** Next.js API Routes, Prisma ORM 5.22, SQLite (dev) / PostgreSQL (prod)
- **AI:** Claude Sonnet 4.5 (Anthropic API)
- **Blockchain:** Cardano, Lucid Evolution 0.4.29
- **Discovery:** Essential Cardano GitHub, DeFi Llama API, Manual Registry
- **Deployment:** Vercel with Cron Jobs

## 📝 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

npm run db:seed          # Seed basic data
npm run db:seed:100      # Seed 78 curated dApps
npm run db:studio        # Open Prisma Studio

npm run discovery:test   # Test discovery system (946+ dApps)
npm run ui:test          # Test UI generation (24 dApps)
```

## 🌐 Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL="file:./dev.db"

# AI Intent Parsing
ANTHROPIC_API_KEY="sk-ant-..."

# Cron Job Security (production only)
CRON_SECRET="your-random-secret"

# Optional: Cardano Network
NEXT_PUBLIC_CARDANO_NETWORK="preprod"
```

## 🔄 Discovery Sources

The system discovers dApps from:

1. **Essential Cardano GitHub** - 893 dApps (free, public)
2. **DeFi Llama API** - 78 Cardano protocols (free, public)
3. **Manual Registry** - 78 curated dApps (highest priority)

**Schedule:** Weekly on Sunday at midnight (configurable in `vercel.json`)

## 🤝 Contributing

Contributions welcome! Areas needing help:

1. **Transaction Building** - Implement real Cardano transaction construction
2. **New Action Types** - Add support for more dApp actions
3. **UI Improvements** - Enhance dynamic UI components
4. **Discovery Sources** - Add more dApp discovery APIs
5. **Documentation** - Improve docs and examples

## 📄 License

MIT

## 🙏 Acknowledgments

- **IOG/Intersect** - Essential Cardano list
- **DeFi Llama** - DeFi protocol data
- **Anthropic** - Claude AI
- **Cardano Community** - For building amazing dApps

---

**Status:** 🟢 Active Development | **Latest:** Dynamic UI Generation Complete

For questions, open an issue on GitHub.
