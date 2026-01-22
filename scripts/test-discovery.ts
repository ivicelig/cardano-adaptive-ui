import { runDiscoveryJob } from '../lib/indexer/discovery/discovery-scheduler';

/**
 * Test script for automated discovery system
 */
async function testDiscovery() {
  console.log('🧪 Testing automated discovery system...\n');

  try {
    console.log('Test 1: Fetching from working sources (Essential Cardano, DeFi Llama, Manual)');
    console.log('─'.repeat(60));

    const result = await runDiscoveryJob({
      maxDApps: 20, // Limit to 20 for testing
      updateExisting: false, // Don't update existing to see only new discoveries
      sources: ['essential', 'defillama', 'manual'],
    });

    console.log('\n✅ Discovery test completed!');
    console.log('\nResults:');
    console.log(`  Discovered: ${result.discovered}`);
    console.log(`  Imported: ${result.imported}`);
    console.log(`  Updated: ${result.updated}`);
    console.log(`  Skipped: ${result.skipped}`);
    console.log(`  Errors: ${result.errors.length}`);

    console.log('\nSources:');
    console.log(`  Essential Cardano: ${result.sources.essentialCardano}`);
    console.log(`  DeFi Llama: ${result.sources.defiLlama}`);
    console.log(`  Manual Registry: ${result.sources.manual}`);

    if (result.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      result.errors.forEach(err => console.log(`  - ${err}`));
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testDiscovery();
