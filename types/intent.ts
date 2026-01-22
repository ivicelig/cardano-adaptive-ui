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

export interface ParsedAction {
  order: number;
  type: IntentType;
  confidence: number;
  parameters?: Record<string, any>;
  dependsOn?: number | null;
  outputUsedBy?: number[] | null;
}

export interface MultiActionIntent {
  actions: ParsedAction[];
  executionMode: 'sequential' | 'parallel' | 'mixed';
  totalActions: number;
}

export interface IntentParserResponse {
  intent: ParsedIntent;
  rawResponse: string;
  // Multi-action support
  actions?: ParsedAction[];
  executionMode?: 'sequential' | 'parallel' | 'mixed';
}
