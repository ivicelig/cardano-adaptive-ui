'use client';

import { useState } from 'react';
import { ParsedIntent } from '@/types/intent';
import { motion } from 'framer-motion';

interface StakeInterfaceProps {
  intent: ParsedIntent;
  walletAddress: string | null;
}

export default function StakeInterface({ intent, walletAddress }: StakeInterfaceProps) {
  const [amount, setAmount] = useState(intent.parameters?.amount || '');
  const [selectedPool, setSelectedPool] = useState(intent.parameters?.poolId || '');

  const popularPools = [
    { id: 'pool1', name: 'STAKE1', ticker: 'STK1', fee: '2%', apy: '4.5%' },
    { id: 'pool2', name: 'CARDANO PRO', ticker: 'CPRO', fee: '1.5%', apy: '4.8%' },
    { id: 'pool3', name: 'ADA POOL', ticker: 'ADAP', fee: '2.5%', apy: '4.2%' },
  ];

  const handleStake = async () => {
    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    // TODO: Implement actual staking logic using Lucid Evolution
    console.log('Delegating to pool:', { selectedPool, amount });
    alert('Staking functionality will be implemented with Lucid Evolution');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 space-y-4"
    >
      <h2 className="text-2xl font-bold text-gray-800">Stake ADA</h2>

      <div className="space-y-4">
        {/* Amount Input */}
        <div className="bg-gray-50 rounded-xl p-4">
          <label className="text-sm text-gray-600 mb-2 block">Amount to Stake</label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-semibold outline-none"
            />
            <span className="text-2xl font-semibold text-gray-800">ADA</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Minimum: 10 ADA</p>
        </div>

        {/* Pool Selection */}
        <div>
          <label className="text-sm text-gray-600 mb-3 block">Select Stake Pool</label>
          <div className="space-y-2">
            {popularPools.map((pool) => (
              <button
                key={pool.id}
                onClick={() => setSelectedPool(pool.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedPool === pool.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-800">{pool.name}</div>
                    <div className="text-sm text-gray-500">{pool.ticker}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 font-semibold">{pool.apy} APY</div>
                    <div className="text-xs text-gray-500">{pool.fee} fee</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Staking Info */}
        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-gray-800">Staking Info</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Rewards are distributed every 5 days (epoch)</li>
            <li>• First rewards arrive after ~15-20 days</li>
            <li>• Your ADA remains liquid and can be unstaked anytime</li>
            <li>• No lock-up period</li>
          </ul>
        </div>

        {/* Stake Button */}
        <button
          onClick={handleStake}
          disabled={!amount || !selectedPool || !walletAddress}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors"
        >
          {walletAddress ? 'Delegate to Pool' : 'Connect Wallet First'}
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
