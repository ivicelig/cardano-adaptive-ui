import { importFromManualRegistry, getDiscoveryStats } from '../lib/indexer/discovery/discovery-service';

/**
 * Seed script to populate database with top 100 Cardano dApps
 */
async function main() {
  console.log('🌱 Starting database seed with top 100 dApps...\n');

  try {
    // Import dApps from manual registry
    const result = await importFromManualRegistry();

    if (!result.success) {
      console.error('\n❌ Seed failed');
      process.exit(1);
    }

    // Show statistics
    console.log('\n📊 Discovery Statistics:');
    const stats = await getDiscoveryStats();
    console.log(`   Total in registry: ${stats.registryTotal}`);
    console.log(`   Total in database: ${stats.databaseTotal}`);
    console.log('\n   By type:');
    stats.byType.forEach(({ type, count }) => {
      console.log(`     ${type}: ${count}`);
    });

    if (result.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      result.errors.forEach(error => console.log(`   - ${error}`));
    }

    console.log('\n✅ Seed completed successfully!');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }
}

main();
