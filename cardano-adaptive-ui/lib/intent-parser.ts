import Anthropic from '@anthropic-ai/sdk';
import { ParsedIntent, IntentParserResponse } from '@/types/intent';

const SYSTEM_PROMPT = `You are an intent parser for a Cardano blockchain application. Your job is to analyze user input and determine what action they want to perform.

Available built-in actions:
- swap: Exchange one token for another (e.g., "swap ADA for DJED")
- stake: Delegate ADA to a stake pool
- unstake: Undelegate ADA from a stake pool
- balance: Check wallet balance

External integrations (suggest these when appropriate):
- nft-browse/nft-buy: For NFT operations, suggest JPG Store or CNFT.io
- payment: For fiat on/off ramps, suggest Strike or other payment platforms

Respond in JSON format:
{
  "type": "swap" | "stake" | "unstake" | "nft-browse" | "nft-buy" | "payment" | "balance" | "unknown",
  "confidence": 0.0-1.0,
  "parameters": {
    "fromToken": "ADA",
    "toToken": "DJED",
    "amount": "100"
  },
  "suggestion": "Optional clarification or suggestion",
  "externalPlatform": {
    "name": "JPG Store",
    "url": "https://www.jpg.store",
    "reason": "For NFT purchases"
  }
}`;

export async function parseIntent(userInput: string): Promise<IntentParserResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Parse this user intent: "${userInput}"\n\nRespond with JSON only, no additional text.`,
      },
    ],
    system: SYSTEM_PROMPT,
  });

  const rawResponse = message.content[0].type === 'text'
    ? message.content[0].text
    : '';

  // Extract JSON from response (handle potential markdown code blocks)
  let jsonText = rawResponse.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
  }

  const intent: ParsedIntent = JSON.parse(jsonText);

  return {
    intent,
    rawResponse,
  };
}
