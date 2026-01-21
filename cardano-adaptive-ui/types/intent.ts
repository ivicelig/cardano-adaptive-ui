export type IntentType =
  | 'swap'
  | 'stake'
  | 'unstake'
  | 'nft-browse'
  | 'nft-buy'
  | 'payment'
  | 'balance'
  | 'unknown';

export interface ParsedIntent {
  type: IntentType;
  confidence: number;
  parameters?: {
    fromToken?: string;
    toToken?: string;
    amount?: string;
    poolId?: string;
    nftCollection?: string;
    recipient?: string;
    [key: string]: any;
  };
  suggestion?: string;
  externalPlatform?: {
    name: string;
    url: string;
    reason: string;
  };
}

export interface IntentParserResponse {
  intent: ParsedIntent;
  rawResponse: string;
}
