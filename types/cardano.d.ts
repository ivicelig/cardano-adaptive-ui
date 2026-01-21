// Cardano Wallet CIP-30 API Type Definitions

interface CardanoWalletApi {
  getNetworkId: () => Promise<number>;
  getUtxos: () => Promise<string[]>;
  getBalance: () => Promise<string>;
  getUsedAddresses: () => Promise<string[]>;
  getUnusedAddresses: () => Promise<string[]>;
  getChangeAddress: () => Promise<string>;
  getRewardAddresses: () => Promise<string[]>;
  signTx: (tx: string, partialSign: boolean) => Promise<string>;
  signData: (address: string, payload: string) => Promise<{ signature: string; key: string }>;
  submitTx: (tx: string) => Promise<string>;
}

interface CardanoWalletExtension {
  enable: () => Promise<CardanoWalletApi>;
  isEnabled: () => Promise<boolean>;
  apiVersion: string;
  name: string;
  icon: string;
}

declare global {
  interface Window {
    cardano?: {
      [walletName: string]: CardanoWalletExtension;
    };
  }
}

export {};
