'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DynamicUI } from './DynamicUI';
import { UISchema } from '@/lib/ui-generator/schema-parser';

export interface EnrichedAction {
  order: number;
  type: string;
  dappId: string;
  dappName: string;
  parameters: Record<string, any>;
  dependsOn: number | null;
  outputUsedBy: number[] | null;
  uiSchema: UISchema;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

interface ActionChainUIProps {
  chainId: string;
  actions: EnrichedAction[];
  executionMode: 'sequential' | 'parallel' | 'mixed';
  onComplete: () => void;
}

export function ActionChainUI({
  chainId,
  actions: initialActions,
  executionMode,
  onComplete,
}: ActionChainUIProps) {
  const [actions, setActions] = useState<EnrichedAction[]>(
    initialActions.map((a) => ({ ...a, status: a.status || 'pending' }))
  );
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);

  const currentAction = actions[currentActionIndex];
  const completedCount = actions.filter((a) => a.status === 'completed').length;
  const failedCount = actions.filter((a) => a.status === 'failed').length;

  const executeAction = async (
    action: EnrichedAction,
    actionIndex: number,
    formData: any
  ) => {
    setIsExecuting(true);

    // Update action status to in_progress
    setActions((prev) =>
      prev.map((a) =>
        a.order === action.order ? { ...a, status: 'in_progress' } : a
      )
    );

    try {
      // Resolve parameters that reference other actions
      const resolvedParams = { ...formData };
      for (const [key, value] of Object.entries(resolvedParams)) {
        if (typeof value === 'string' && value.startsWith('from_action_')) {
          const dependencyOrder = parseInt(value.split('_')[2]);
          const dependencyAction = actions.find((a) => a.order === dependencyOrder);

          if (dependencyAction?.result) {
            // Use output from dependency action
            resolvedParams[key] =
              dependencyAction.result.outputAmount ||
              dependencyAction.result.amount ||
              dependencyAction.result;
          }
        }
      }

      // Call execution API
      const response = await fetch('/api/actions/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chainId,
          actionOrder: action.order,
          dappId: action.dappId,
          actionType: action.type,
          params: resolvedParams,
        }),
      });

      if (!response.ok) {
        throw new Error(`Action execution failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Update action with result
      setActions((prev) =>
        prev.map((a) =>
          a.order === action.order
            ? { ...a, status: 'completed', result }
            : a
        )
      );

      // Move to next action if sequential and not last
      if (executionMode === 'sequential' && actionIndex < actions.length - 1) {
        setCurrentActionIndex(actionIndex + 1);
      } else if (actionIndex === actions.length - 1) {
        // All actions complete
        onComplete();
      }

      return result;
    } catch (error) {
      console.error(`Action ${action.order} failed:`, error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Update action with error
      setActions((prev) =>
        prev.map((a) =>
          a.order === action.order
            ? { ...a, status: 'failed', error: errorMessage }
            : a
        )
      );

      throw error;
    } finally {
      setIsExecuting(false);
    }
  };

  const getStatusIcon = (status: EnrichedAction['status']) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in_progress':
        return '🔄';
      case 'failed':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusColor = (status: EnrichedAction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500 animate-pulse';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Action Chain Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Action Chain
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {actions.length} action{actions.length > 1 ? 's' : ''} •{' '}
              {executionMode === 'sequential' ? 'Sequential' : 'Parallel'} execution
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">Progress</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {completedCount}/{actions.length}
            </div>
            {failedCount > 0 && (
              <div className="text-xs text-red-500 mt-1">
                {failedCount} failed
              </div>
            )}
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex gap-2">
          {actions.map((action, idx) => (
            <div
              key={action.order}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <div
                className={`w-full h-2 rounded-full transition-all ${
                  getStatusColor(action.status)
                }`}
              />
              <div className="text-xs text-center text-gray-600 dark:text-gray-400">
                {idx + 1}. {action.type}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Cards */}
      <div className="space-y-4">
        {actions.map((action, idx) => {
          const isActive = idx === currentActionIndex && action.status !== 'completed';
          const isCompleted = action.status === 'completed';
          const isFailed = action.status === 'failed';
          const isPending = action.status === 'pending' && idx > currentActionIndex;

          return (
            <motion.div
              key={action.order}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`border rounded-xl transition-all ${
                isActive
                  ? 'border-blue-500 shadow-lg'
                  : isFailed
                  ? 'border-red-500'
                  : isCompleted
                  ? 'border-green-500'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="p-4 bg-white dark:bg-gray-900">
                {/* Action Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {getStatusIcon(action.status)} {idx + 1}. {action.type.toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      via {action.dappName}
                    </p>
                    {action.dependsOn && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        ⛓️ Depends on Action {action.dependsOn}
                      </p>
                    )}
                  </div>
                  <div className="text-sm font-medium">
                    {isCompleted && (
                      <span className="text-green-600 dark:text-green-400">Completed</span>
                    )}
                    {action.status === 'in_progress' && (
                      <span className="text-blue-600 dark:text-blue-400">In Progress</span>
                    )}
                    {isFailed && (
                      <span className="text-red-600 dark:text-red-400">Failed</span>
                    )}
                    {isPending && (
                      <span className="text-gray-600 dark:text-gray-400">Waiting</span>
                    )}
                  </div>
                </div>

                {/* Dynamic UI for active action */}
                <AnimatePresence>
                  {isActive && !isFailed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <DynamicUI
                        dappId={action.dappId}
                        dappName={action.dappName}
                        actionType={action.type}
                        uiSchema={action.uiSchema}
                        onExecute={(data) => executeAction(action, idx, data)}
                        isExecuting={isExecuting}
                        initialData={action.parameters}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Result for completed actions */}
                {isCompleted && action.result && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                      Result:
                    </p>
                    <pre className="text-xs text-green-900 dark:text-green-100 overflow-x-auto">
                      {JSON.stringify(action.result, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Error for failed actions */}
                {isFailed && action.error && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                      Error:
                    </p>
                    <p className="text-xs text-red-900 dark:text-red-100">
                      {action.error}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Completion Message */}
      {completedCount === actions.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center"
        >
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
            All Actions Completed!
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300">
            Your {actions.length}-step action chain has been successfully executed.
          </p>
        </motion.div>
      )}
    </div>
  );
}
