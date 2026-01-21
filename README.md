# Cardano Adaptive UI

An intelligent, adaptive user interface for Cardano that transforms based on natural language input. Powered by Claude AI and built with Next.js and Lucid Evolution.

## Features

- **Natural Language Intent Parsing**: Describe what you want to do in plain English
- **Dynamic UI Transformation**: The interface morphs to show the relevant functionality
- **Built-in Features**:
  - Token swaps (DEX integration ready)
  - ADA staking/delegation
  - Wallet balance checking
- **External Platform Integration**: Seamlessly suggests external platforms like JPG Store for NFTs or Strike for payments when features aren't available natively
- **Wallet Connection**: CIP-30 compatible (Eternl, Nami, Flint, etc.)
- **Smooth Animations**: Powered by Framer Motion

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Blockchain**: Lucid Evolution (Cardano)
- **AI**: Claude API (Anthropic)
- **Animations**: Framer Motion

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- A Cardano wallet browser extension (Eternl, Nami, Flint, etc.)
- Anthropic API key ([get one here](https://console.anthropic.com/))
- Blockfrost API key ([get one here](https://blockfrost.io/))

### 2. Installation

```bash
cd cardano-adaptive-ui
npm install
```

### 3. Environment Configuration

Update the `.env.local` file with your API keys:

```env
# Anthropic API Key for intent parsing
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Cardano Network (mainnet or preprod)
NEXT_PUBLIC_CARDANO_NETWORK=preprod

# Blockfrost API Key
NEXT_PUBLIC_BLOCKFROST_API_KEY=preprod_your_key_here
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Connect Your Wallet**: Click "Connect Wallet" in the top right
2. **Describe Your Intent**: Type what you want to do in the input field
   - Examples:
     - "Swap 100 ADA for DJED"
     - "Stake my ADA"
     - "Check my balance"
     - "Buy an NFT"
     - "Send payment via Strike"
3. **Watch the UI Transform**: The interface will automatically adapt to your request
4. **Complete Your Action**: Follow the transformed interface to complete your task

## How It Works

1. **User Input**: You type a natural language request
2. **Intent Parsing**: Claude AI analyzes your input and determines:
   - What action you want to perform
   - What parameters are involved (tokens, amounts, etc.)
   - Whether it's a built-in feature or requires an external platform
3. **UI Transformation**: The interface dynamically renders the appropriate component:
   - Swap interface for token exchanges
   - Staking interface for delegation
   - External platform redirects for NFTs, payments, etc.
4. **Action Execution**: You can then complete the action through the adapted interface

## Project Structure

```
cardano-adaptive-ui/
├── app/
│   ├── api/
│   │   └── parse-intent/
│   │       └── route.ts          # API endpoint for intent parsing
│   ├── page.tsx                   # Main page
│   └── layout.tsx
├── components/
│   ├── AdaptiveUI.tsx             # Main adaptive UI orchestrator
│   ├── SwapInterface.tsx          # Token swap component
│   ├── StakeInterface.tsx         # Staking component
│   └── ExternalPlatform.tsx       # External platform redirects
├── hooks/
│   └── useWallet.ts               # Wallet connection hook
├── lib/
│   └── intent-parser.ts           # Claude AI integration
├── types/
│   └── intent.ts                  # TypeScript types
└── .env.local                     # Environment variables
```

## Extending the Application

### Adding New Built-in Features

1. Create a new component in `components/` (e.g., `NFTMarketplace.tsx`)
2. Add the intent type to `types/intent.ts`
3. Update the system prompt in `lib/intent-parser.ts`
4. Add the component to the switch statement in `components/AdaptiveUI.tsx`

### Adding DEX Integration

The swap interface is ready for DEX integration. To connect to a DEX like Minswap:

1. Install the DEX SDK: `npm install @minswap/sdk`
2. Update `components/SwapInterface.tsx` with actual swap logic
3. Use the `lucid` instance from the wallet hook to build and submit transactions

### Adding More External Platforms

Update the system prompt in `lib/intent-parser.ts` to include new external platforms and their use cases.

## Security Considerations

- Never commit `.env.local` with real API keys
- Always verify transaction details before signing
- Test on preprod/testnet before using on mainnet
- The DEX swap functionality is a placeholder - implement proper slippage protection and price checking

## Roadmap

- [ ] Implement actual DEX swap logic (Minswap, SundaeSwap integration)
- [ ] Add real-time price feeds
- [ ] Implement actual staking delegation transactions
- [ ] Add transaction history
- [ ] Multi-wallet support (let users choose their wallet)
- [ ] Mobile responsive improvements
- [ ] Voice input support
- [ ] More built-in features (governance, NFT minting, etc.)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
