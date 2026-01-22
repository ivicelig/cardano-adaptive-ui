/**
 * Test script for dynamic UI generation
 * Tests that the system can:
 * 1. Query dApps from database
 * 2. Parse interface schemas
 * 3. Generate UI schemas
 */

import { prisma } from '../lib/database/client';
import { parseInterfaceToUISchema } from '../lib/ui-generator/schema-parser';

async function testDynamicUI() {
  console.log('🧪 Testing Dynamic UI Generation System\n');

  try {
    // Test 1: Get a swap dApp with interface
    console.log('Test 1: Fetching DEX with swap interface');
    console.log('─'.repeat(60));

    const swapDApp = await prisma.dApp.findFirst({
      where: {
        type: 'dex',
        interfaces: {
          some: {
            actionType: 'swap',
          },
        },
      },
      include: {
        interfaces: {
          where: {
            actionType: 'swap',
          },
        },
      },
    });

    if (!swapDApp) {
      console.error('❌ No DEX found with swap interface');
      return;
    }

    console.log(`✅ Found: ${swapDApp.name}`);
    console.log(`   Type: ${swapDApp.type}`);
    console.log(`   Interfaces: ${swapDApp.interfaces.length}`);

    // Test 2: Parse interface to UI schema
    console.log('\nTest 2: Parsing interface schema to UI schema');
    console.log('─'.repeat(60));

    const swapInterface = swapDApp.interfaces[0];
    if (!swapInterface) {
      console.error('❌ No interface found');
      return;
    }

    const uiSchema = parseInterfaceToUISchema(swapInterface, swapDApp.name);

    console.log(`✅ UI Schema generated:`);
    console.log(`   Title: ${uiSchema.title}`);
    console.log(`   Fields: ${uiSchema.fields.length}`);
    console.log(`   Submit Button: ${uiSchema.submitButtonText}`);

    console.log('\n   Field Details:');
    uiSchema.fields.forEach((field, idx) => {
      console.log(`   ${idx + 1}. ${field.label} (${field.type})${field.required ? ' *' : ''}`);
      if (field.validation) {
        console.log(`      Validation: ${JSON.stringify(field.validation)}`);
      }
    });

    console.log('\n   Output Fields:');
    uiSchema.outputDisplay.fields.forEach((field, idx) => {
      console.log(`   ${idx + 1}. ${field.label}`);
    });

    // Test 3: Get all dApps with interfaces
    console.log('\nTest 3: Checking all dApps with interfaces');
    console.log('─'.repeat(60));

    const dappsWithInterfaces = await prisma.dApp.findMany({
      where: {
        interfaces: {
          some: {},
        },
      },
      include: {
        _count: {
          select: {
            interfaces: true,
          },
        },
      },
    });

    console.log(`✅ Found ${dappsWithInterfaces.length} dApps with interfaces:\n`);

    const dappsByType: Record<string, number> = {};
    dappsWithInterfaces.forEach((dapp) => {
      dappsByType[dapp.type] = (dappsByType[dapp.type] || 0) + 1;
      console.log(`   • ${dapp.name} (${dapp.type}) - ${dapp._count.interfaces} interface(s)`);
    });

    console.log('\nBreakdown by type:');
    Object.entries(dappsByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    // Test 4: Check interface action types
    console.log('\nTest 4: Available action types');
    console.log('─'.repeat(60));

    const allInterfaces = await prisma.dAppInterface.findMany({
      select: {
        actionType: true,
        dapp: {
          select: {
            name: true,
          },
        },
      },
    });

    const actionTypes: Record<string, string[]> = {};
    allInterfaces.forEach((iface) => {
      if (!actionTypes[iface.actionType]) {
        actionTypes[iface.actionType] = [];
      }
      actionTypes[iface.actionType].push(iface.dapp.name);
    });

    console.log('Available action types and dApps:\n');
    Object.entries(actionTypes).forEach(([actionType, dapps]) => {
      console.log(`   ${actionType}:`);
      dapps.forEach((dapp) => {
        console.log(`     - ${dapp}`);
      });
    });

    // Test 5: Sample UI schema for each action type
    console.log('\nTest 5: Generate UI schemas for different action types');
    console.log('─'.repeat(60));

    for (const actionType of Object.keys(actionTypes)) {
      const dappWithAction = await prisma.dApp.findFirst({
        where: {
          interfaces: {
            some: { actionType },
          },
        },
        include: {
          interfaces: {
            where: { actionType },
          },
        },
      });

      if (dappWithAction && dappWithAction.interfaces[0]) {
        const schema = parseInterfaceToUISchema(
          dappWithAction.interfaces[0],
          dappWithAction.name
        );
        console.log(`\n   ✅ ${actionType} (${dappWithAction.name}):`);
        console.log(`      Fields: ${schema.fields.map((f) => f.name).join(', ')}`);
      }
    }

    console.log('\n\n✅ All tests passed! Dynamic UI generation is working.\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDynamicUI();
