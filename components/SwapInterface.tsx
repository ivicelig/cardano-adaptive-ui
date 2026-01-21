'use client';

import { useState } from 'react';
import { ParsedIntent } from '@/types/intent';
import { motion } from 'framer-motion';

interface SwapInterfaceProps {
  intent: ParsedIntent;
  walletAddress: string | null;
}

export default function SwapInterface({ intent, walletAddress }: SwapInterfaceProps) {
  const [fromToken, setFromToken] = useState(intent.parameters?.fromToken || 'ADA');
  const [toToken, setToToken] = useState(intent.parameters?.toToken || 'DJED');
  const [amount, setAmount] = useState(intent.parameters?.amount || '');
  const [estimatedOutput, setEstimatedOutput] = useState('0');

  const handleSwap = async () => {
    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    // TODO: Implement actual DEX swap logic using Lucid Evolution
    // This would integrate with Minswap, SundaeSwap, or other DEXs
    console.log('Executing swap:', { fromToken, toToken, amount });
    alert('Swap functionality will be implemented with DEX integration');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 space-y-4"
    >
      <h2 className="text-2xl font-bold text-gray-800">Swap Tokens</h2>

      <div className="space-y-4">
        {/* From Token */}
        <div className="bg-gray-50 rounded-xl p-4">
          <label className="text-sm text-gray-600 mb-2 block">From</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-semibold outline-none"
            />
            <select
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              className="bg-white rounded-lg px-3 py-2 font-semibold"
            >
              <option>ADA</option>
              <option>DJED</option>
              <option>SHEN</option>
              <option>MIN</option>
            </select>
          </div>
        </div>

        {/* Swap Direction */}
        <div className="flex justify-center">
          <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition-colors">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
        </div>

        {/* To Token */}
        <div className="bg-gray-50 rounded-xl p-4">
          <label className="text-sm text-gray-600 mb-2 block">To</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={estimatedOutput}
              readOnly
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-semibold outline-none"
            />
            <select
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              className="bg-white rounded-lg px-3 py-2 font-semibold"
            >
              <option>DJED</option>
              <option>ADA</option>
              <option>SHEN</option>
              <option>MIN</option>
            </select>
          </div>
        </div>

        {/* Swap Info */}
        <div className="bg-blue-50 rounded-lg p-3 text-sm space-y-1">
          <div className="flex justify-between text-gray-600">
            <span>Rate</span>
            <span className="font-semibold">1 ADA ≈ 1.5 DJED</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Fee</span>
            <span className="font-semibold">0.3%</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Slippage</span>
            <span className="font-semibold">1%</span>
          </div>
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={!amount || !walletAddress}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors"
        >
          {walletAddress ? 'Swap Tokens' : 'Connect Wallet First'}
        </button>

        {intent.suggestion && (
          <div className="text-sm text-gray-600 bg-yellow-50 rounded-lg p-3">
            💡 {intent.suggestion}
          </div>
        )}
      </div>
    </motion.div>
  );
}
