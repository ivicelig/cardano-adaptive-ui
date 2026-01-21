'use client';

import { useWallet } from '@/hooks/useWallet';
import AdaptiveUI from '@/components/AdaptiveUI';

export default function Home() {
  const { address, balance, isConnected, isConnecting, error, connectWallet, disconnectWallet } = useWallet();

  const formatBalance = (lovelace: bigint | null) => {
    if (lovelace === null) return '0';
    return (Number(lovelace) / 1_000_000).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Cardano Adaptive UI
              </h1>
              <p className="text-sm text-gray-600">Ask for what you need, get the right interface</p>
            </div>

            <div className="flex items-center gap-4">
              {isConnected && address ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-800">
                      {formatBalance(balance)} ADA
                    </div>
                    <div className="text-xs text-gray-500">
                      {address.slice(0, 8)}...{address.slice(-8)}
                    </div>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => connectWallet('eternl')}
                  disabled={isConnecting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            What would you like to do?
          </h2>
          <p className="text-lg text-gray-600">
            Describe your intent in natural language, and the UI will adapt to help you
          </p>
        </div>

        <AdaptiveUI walletAddress={address} />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Powered by Claude AI • Built on Cardano
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-600 hover:text-gray-800">About</a>
              <a href="#" className="text-gray-600 hover:text-gray-800">Docs</a>
              <a href="#" className="text-gray-600 hover:text-gray-800">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
