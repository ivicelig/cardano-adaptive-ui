/**
 * Test intent parsing for different prompts
 */

import { parseIntent } from '../lib/intent-parser';

async function testIntents() {
  const testCases = [
    'stake my ada',
    'Stake 100 ADA',
    'swap 100 ADA for DJED',
    'Swap ADA for DJED',
  ];

  console.log('🧪 Testing Intent Parsing\n');

  for (const input of testCases) {
    console.log(`\nInput: "${input}"`);
    console.log('─'.repeat(60));

    try {
      const result = await parseIntent(input);
      console.log('Parsed Intent:');
      console.log('  Type:', result.intent.type);
      console.log('  Confidence:', result.intent.confidence);
      console.log('  Parameters:', JSON.stringify(result.intent.parameters, null, 2));

      if (result.actions) {
        console.log('  Multi-Action:', result.actions.length, 'actions');
      }
    } catch (error) {
      console.error('  ❌ Error:', error instanceof Error ? error.message : error);
    }
  }
}

testIntents();
