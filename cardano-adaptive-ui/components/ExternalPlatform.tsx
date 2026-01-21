'use client';

import { ParsedIntent } from '@/types/intent';
import { motion } from 'framer-motion';

interface ExternalPlatformProps {
  intent: ParsedIntent;
}

export default function ExternalPlatform({ intent }: ExternalPlatformProps) {
  if (!intent.externalPlatform) {
    return null;
  }

  const { name, url, reason } = intent.externalPlatform;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white space-y-4"
    >
      <div className="text-center space-y-3">
        <div className="text-4xl">🔗</div>
        <h2 className="text-2xl font-bold">External Platform</h2>
        <p className="text-purple-100">
          This feature is available through {name}
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
        <p className="text-sm text-purple-100 mb-1">Why {name}?</p>
        <p className="text-white">{reason}</p>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-white text-purple-600 hover:bg-purple-50 font-semibold py-4 rounded-xl text-center transition-colors"
      >
        Open {name} →
      </a>

      {intent.suggestion && (
        <div className="text-sm text-purple-100 bg-white/10 backdrop-blur-sm rounded-lg p-3">
          💡 {intent.suggestion}
        </div>
      )}
    </motion.div>
  );
}
