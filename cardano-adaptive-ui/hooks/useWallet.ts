import { useState, useEffect } from 'react';
import { Lucid, Blockfrost, Network } from '@lucid-evolution/lucid';

export interface WalletState {
  lucid: Lucid | null;
  address: string | null;
  balance: bigint | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    lucid: null,
    address: null,
    balance: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  const connectWallet = async (walletName: string = 'eternl') => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const network = (process.env.NEXT_PUBLIC_CARDANO_NETWORK || 'Preprod') as Network;
      const blockfrostApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY;

      if (!blockfrostApiKey) {
        throw new Error('Blockfrost API key not configured');
      }

      const lucid = await Lucid(
        new Blockfrost(
          network === 'Mainnet'
            ? 'https://cardano-mainnet.blockfrost.io/api/v0'
            : 'https://cardano-preprod.blockfrost.io/api/v0',
          blockfrostApiKey
        ),
        network
      );

      // @ts-ignore - CIP-30 wallet API
      const api = await window.cardano?.[walletName]?.enable();

      if (!api) {
        throw new Error(`${walletName} wallet not found or not enabled`);
      }

      lucid.selectWallet.fromAPI(api);

      const address = await lucid.wallet().address();
      const utxos = await lucid.wallet().getUtxos();
      const balance = utxos.reduce((acc, utxo) => acc + utxo.assets.lovelace, 0n);

      setState({
        lucid,
        address,
        balance,
        isConnected: true,
        isConnecting: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
      }));
    }
  };

  const disconnectWallet = () => {
    setState({
      lucid: null,
      address: null,
      balance: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  };

  return {
    ...state,
    connectWallet,
    disconnectWallet,
  };
}
