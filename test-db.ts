import { getActiveDApps, getDAppsByActionType } from './lib/database/queries';

async function testDatabase() {
  console.log('🧪 Testing database connection...\n');

  try {
    // Test 1: Get all active dApps
    console.log('Test 1: Fetching all active dApps...');
    const allDApps = await getActiveDApps();
    console.log(`✅ Found ${allDApps.length} active dApps`);
    allDApps.forEach(dapp => {
      console.log(`  - ${dapp.name} (${dapp.type})`);
      console.log(`    Interfaces: ${dapp.interfaces.length}`);
      console.log(`    Pools: ${dapp.pools.length}`);
    });

    // Test 2: Get dApps by action type
    console.log('\nTest 2: Fetching dApps that support "swap" action...');
    const swapDApps = await getDAppsByActionType('swap');
    console.log(`✅ Found ${swapDApps.length} dApps with swap capability`);
    swapDApps.forEach(dapp => {
      console.log(`  - ${dapp.name}`);
    });

    // Test 3: Get dApps by action type - stake
    console.log('\nTest 3: Fetching dApps that support "stake" action...');
    const stakeDApps = await getDAppsByActionType('stake');
    console.log(`✅ Found ${stakeDApps.length} dApps with stake capability`);
    stakeDApps.forEach(dapp => {
      console.log(`  - ${dapp.name}`);
    });

    // Test 4: Get dApps by action type - NFT browse
    console.log('\nTest 4: Fetching dApps that support "nft-browse" action...');
    const nftDApps = await getDAppsByActionType('nft-browse');
    console.log(`✅ Found ${nftDApps.length} dApps with NFT browse capability`);
    nftDApps.forEach(dapp => {
      console.log(`  - ${dapp.name}`);
    });

    console.log('\n✅ All database tests passed!');
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

testDatabase();
