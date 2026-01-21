import { useState } from 'react';
import { decode } from 'cbor-web';

export interface WalletState {
  address: string | null;
  balance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  walletApi: any;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    balance: null,
    isConnected: false,
    isConnecting: false,
    error: null,
    walletApi: null,
  });

  const connectWallet = async (walletName: string = 'eternl') => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Check if wallet extension is available
      if (!window.cardano?.[walletName]) {
        throw new Error(`${walletName} wallet not found. Please install the wallet extension.`);
      }

      // Enable the wallet (user must approve)
      const walletApi = await window.cardano[walletName].enable();

      // Get addresses from the wallet
      const usedAddresses = await walletApi.getUsedAddresses();
      const unusedAddresses = await walletApi.getUnusedAddresses();

      // Use the first available address
      const addressHex = usedAddresses[0] || unusedAddresses[0];

      if (!addressHex) {
        throw new Error('No addresses found in wallet');
      }

      // Get balance
      const balanceHex = await walletApi.getBalance();
      console.log('🔍 Balance hex:', balanceHex);

      const lovelace = decodeBalance(balanceHex);
      console.log('💰 Decoded lovelace:', lovelace);


      // Convert hex address to bech32 (this is simplified - in production you'd use a proper converter)
      const address = addressHex; // Store hex for now, convert in server-side API calls

      setState({
        address,
        balance: lovelace,
        isConnected: true,
        isConnecting: false,
        error: null,
        walletApi,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
        walletApi: null,
      }));
    }
  };

  const disconnectWallet = () => {
    setState({
      address: null,
      balance: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      walletApi: null,
    });
  };



  return {
    ...state,
    connectWallet,
    disconnectWallet,
  };
}

function decodeBalance(balanceHex: string): string{
  try{
    const bytes = Buffer.from(balanceHex, 'hex');
    const decoded: any = decode(bytes);
    console.log('🔍 Decoded balance:', decoded);


     if (typeof decoded === 'number' || typeof decoded === 'bigint') {
      return decoded.toString();
    }
 if (Array.isArray(decoded) && decoded.length > 0) {
      return decoded[0].toString();
    }
      return '0';

  }catch(error){
    console.error('❌ Balance decode error:', error);
    return '0';
  }

}
