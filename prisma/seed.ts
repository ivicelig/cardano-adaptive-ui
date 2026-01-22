import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Seed DEXes
  const minswap = await prisma.dApp.upsert({
    where: { id: 'minswap-mainnet' },
    update: {},
    create: {
      id: 'minswap-mainnet',
      name: 'Minswap',
      type: 'dex',
      description: 'The first multi-pool decentralized exchange on Cardano',
      contractAddresses: JSON.stringify([
        'addr1z8snz7c4974vzdpxu65ruphl3zjdvtxw8strf2c2tmqnxz2j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq0xmsha',
      ]),
      logoUrl: 'https://minswap.org/logo.png',
      websiteUrl: 'https://minswap.org',
      apiEndpoint: 'https://api-mainnet-prod.minswap.org',
      isActive: true,
      interfaces: {
        create: [
          {
            actionType: 'swap',
            inputSchema: JSON.stringify({
              fromToken: { type: 'token-selector', label: 'From', required: true },
              toToken: { type: 'token-selector', label: 'To', required: true },
              amount: { type: 'number', label: 'Amount', required: true, min: 0 },
            }),
            outputSchema: JSON.stringify({
              rate: 'number',
              outputAmount: 'number',
              fee: 'number',
              slippage: 'number',
              priceImpact: 'number',
            }),
            contractInterface: JSON.stringify({
              batcherAddress: 'addr1z8snz7c4974vzdpxu65ruphl3zjdvtxw8strf2c2tmqnxz2j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq0xmsha',
              action: 'swap',
            }),
            exampleUsage: 'Swap ADA for MIN tokens with 0.3% fee',
          },
        ],
      },
    },
  });

  const sundaeswap = await prisma.dApp.upsert({
    where: { id: 'sundaeswap-mainnet' },
    update: {},
    create: {
      id: 'sundaeswap-mainnet',
      name: 'SundaeSwap',
      type: 'dex',
      description: 'A decentralized exchange built on Cardano',
      contractAddresses: JSON.stringify([
        'addr1w9qzpelu9hn45pefc0xr4ac4kdxeswq7pndul2vuj59u8tqaxdznu',
      ]),
      logoUrl: 'https://sundaeswap.finance/logo.png',
      websiteUrl: 'https://sundaeswap.finance',
      isActive: true,
      interfaces: {
        create: [
          {
            actionType: 'swap',
            inputSchema: JSON.stringify({
              fromToken: { type: 'token-selector', label: 'From', required: true },
              toToken: { type: 'token-selector', label: 'To', required: true },
              amount: { type: 'number', label: 'Amount', required: true, min: 0 },
            }),
            outputSchema: JSON.stringify({
              rate: 'number',
              outputAmount: 'number',
              fee: 'number',
              slippage: 'number',
              priceImpact: 'number',
            }),
            contractInterface: JSON.stringify({
              scooперAddress: 'addr1w9qzpelu9hn45pefc0xr4ac4kdxeswq7pndul2vuj59u8tqaxdznu',
              action: 'swap',
            }),
            exampleUsage: 'Swap ADA for SUNDAE tokens with 0.3% fee',
          },
        ],
      },
    },
  });

  const muesliswap = await prisma.dApp.upsert({
    where: { id: 'muesliswap-mainnet' },
    update: {},
    create: {
      id: 'muesliswap-mainnet',
      name: 'MuesliSwap',
      type: 'dex',
      description: 'Hybrid DEX with both orderbook and AMM on Cardano',
      contractAddresses: JSON.stringify([
        'addr1w9qzpelu9hn45pefc0xr4ac4kdxeswq7pndul2vuj59u8tqaxdznu',
      ]),
      logoUrl: 'https://muesliswap.com/logo.png',
      websiteUrl: 'https://muesliswap.com',
      apiEndpoint: 'https://api.muesliswap.com',
      isActive: true,
      interfaces: {
        create: [
          {
            actionType: 'swap',
            inputSchema: JSON.stringify({
              fromToken: { type: 'token-selector', label: 'From', required: true },
              toToken: { type: 'token-selector', label: 'To', required: true },
              amount: { type: 'number', label: 'Amount', required: true, min: 0 },
            }),
            outputSchema: JSON.stringify({
              rate: 'number',
              outputAmount: 'number',
              fee: 'number',
              slippage: 'number',
              priceImpact: 'number',
            }),
            contractInterface: JSON.stringify({
              matcherAddress: 'addr1w9qzpelu9hn45pefc0xr4ac4kdxeswq7pndul2vuj59u8tqaxdznu',
              action: 'swap',
            }),
            exampleUsage: 'Swap ADA for MILK tokens',
          },
        ],
      },
    },
  });

  // Seed NFT Marketplaces
  const jpgStore = await prisma.dApp.upsert({
    where: { id: 'jpgstore-mainnet' },
    update: {},
    create: {
      id: 'jpgstore-mainnet',
      name: 'JPG Store',
      type: 'nft_marketplace',
      description: 'The largest NFT marketplace on Cardano',
      contractAddresses: JSON.stringify([]),
      logoUrl: 'https://jpg.store/logo.png',
      websiteUrl: 'https://jpg.store',
      apiEndpoint: 'https://api.jpg.store',
      isActive: true,
      interfaces: {
        create: [
          {
            actionType: 'buy_nft',
            inputSchema: JSON.stringify({
              collectionId: { type: 'text', label: 'Collection ID', required: true },
              nftId: { type: 'text', label: 'NFT ID', required: true },
              maxPrice: { type: 'number', label: 'Max Price (ADA)', required: true, min: 0 },
            }),
            outputSchema: JSON.stringify({
              nftName: 'string',
              price: 'number',
              seller: 'string',
              transactionHash: 'string',
            }),
            contractInterface: JSON.stringify({
              marketplace: 'jpg.store',
              action: 'buy',
            }),
            exampleUsage: 'Buy NFT from a specific collection',
          },
          {
            actionType: 'nft-browse',
            inputSchema: JSON.stringify({
              collectionName: { type: 'text', label: 'Collection Name', required: false },
              minPrice: { type: 'number', label: 'Min Price (ADA)', required: false, min: 0 },
              maxPrice: { type: 'number', label: 'Max Price (ADA)', required: false, min: 0 },
            }),
            outputSchema: JSON.stringify({
              nfts: 'array',
              totalCount: 'number',
            }),
            contractInterface: JSON.stringify({
              marketplace: 'jpg.store',
              action: 'browse',
            }),
            exampleUsage: 'Browse NFTs by collection and price range',
          },
        ],
      },
    },
  });

  // Seed Lending Protocols
  const liqwid = await prisma.dApp.upsert({
    where: { id: 'liqwid-mainnet' },
    update: {},
    create: {
      id: 'liqwid-mainnet',
      name: 'Liqwid',
      type: 'lending',
      description: 'Algorithmic and autonomous interest rate protocol on Cardano',
      contractAddresses: JSON.stringify([]),
      logoUrl: 'https://liqwid.finance/logo.png',
      websiteUrl: 'https://liqwid.finance',
      isActive: true,
      interfaces: {
        create: [
          {
            actionType: 'stake',
            inputSchema: JSON.stringify({
              token: { type: 'token-selector', label: 'Token', required: true },
              amount: { type: 'number', label: 'Amount', required: true, min: 0 },
            }),
            outputSchema: JSON.stringify({
              apy: 'number',
              qTokensReceived: 'number',
              transactionHash: 'string',
            }),
            contractInterface: JSON.stringify({
              protocol: 'liqwid',
              action: 'supply',
            }),
            exampleUsage: 'Supply tokens to earn interest',
          },
          {
            actionType: 'unstake',
            inputSchema: JSON.stringify({
              token: { type: 'token-selector', label: 'Token', required: true },
              amount: { type: 'number', label: 'Amount', required: true, min: 0 },
            }),
            outputSchema: JSON.stringify({
              tokensReturned: 'number',
              interestEarned: 'number',
              transactionHash: 'string',
            }),
            contractInterface: JSON.stringify({
              protocol: 'liqwid',
              action: 'withdraw',
            }),
            exampleUsage: 'Withdraw supplied tokens plus interest',
          },
        ],
      },
    },
  });

  console.log('✅ Seed completed successfully');
  console.log('📊 Created dApps:', {
    DEXes: [minswap.name, sundaeswap.name, muesliswap.name],
    'NFT Marketplaces': [jpgStore.name],
    'Lending Protocols': [liqwid.name],
  });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
