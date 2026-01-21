'use client';

import { useState } from 'react';
import { ParsedIntent } from '@/types/intent';
import SwapInterface from './SwapInterface';
import StakeInterface from './StakeInterface';
import ExternalPlatform from './ExternalPlatform';
import { motion, AnimatePresence } from 'framer-motion';

interface AdaptiveUIProps {
  walletAddress: string | null;
}

export default function AdaptiveUI({ walletAddress }: AdaptiveUIProps) {
  const [input, setInput] = useState('');
  const [intent, setIntent] = useState<ParsedIntent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/parse-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse intent');
      }

      const data = await response.json();
      setIntent(data.intent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInput('');
    setIntent(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <motion.div
        layout
        className="w-full max-w-2xl mx-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What would you like to do? (e.g., swap 100 ADA for DJED)"
              className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
              disabled={isLoading}
            />
            {intent && (
              <button
                type="button"
                onClick={handleReset}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {!intent && (
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Go'
              )}
            </button>
          )}
        </form>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600"
          >
            {error}
          </motion.div>
        )}
      </motion.div>

      {/* Dynamic Interface Section */}
      <AnimatePresence mode="wait">
        {intent && (
          <motion.div
            key={intent.type}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {intent.type === 'swap' && (
              <SwapInterface intent={intent} walletAddress={walletAddress} />
            )}

            {(intent.type === 'stake' || intent.type === 'unstake') && (
              <StakeInterface intent={intent} walletAddress={walletAddress} />
            )}

            {(intent.type === 'nft-browse' ||
              intent.type === 'nft-buy' ||
              intent.type === 'payment') && (
              <ExternalPlatform intent={intent} />
            )}

            {intent.type === 'balance' && walletAddress && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Wallet Balance</h2>
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="text-sm opacity-80 mb-2">Available Balance</div>
                  <div className="text-3xl font-bold">Loading...</div>
                  <div className="text-xs opacity-60 mt-2">{walletAddress}</div>
                </div>
              </motion.div>
            )}

            {intent.type === 'unknown' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md mx-auto bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 text-center"
              >
                <div className="text-4xl mb-3">🤔</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Not Sure What You Mean
                </h3>
                <p className="text-gray-600">
                  {intent.suggestion || 'Try asking something like "swap 100 ADA for DJED" or "stake my ADA"'}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions */}
      {!intent && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-2xl mx-auto"
        >
          <p className="text-sm text-gray-500 mb-3 text-center">Try these:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              'Swap 100 ADA for DJED',
              'Stake my ADA',
              'Check my balance',
              'Buy an NFT',
              'Send payment via Strike',
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
