'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UISchema, validateFormData, generateDefaultFormData } from '@/lib/ui-generator/schema-parser';

interface DynamicUIProps {
  dappId: string;
  dappName: string;
  actionType: string;
  uiSchema: UISchema;
  onExecute: (data: any) => Promise<any>;
  isExecuting?: boolean;
  initialData?: Record<string, any>;
}

export function DynamicUI({
  dappId,
  dappName,
  actionType,
  uiSchema,
  onExecute,
  isExecuting = false,
  initialData,
}: DynamicUIProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Initialize form data
  useEffect(() => {
    setFormData(generateDefaultFormData(uiSchema, initialData));
  }, [uiSchema, initialData]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear error for this field when user changes it
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const validation = validateFormData(formData, uiSchema);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const res = await onExecute(formData);
      setResult(res);
    } catch (error) {
      console.error('Execution error:', error);
      setErrors({ _form: error instanceof Error ? error.message : 'Execution failed' });
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: UISchema['fields'][0]) => {
    const value = formData[field.name];
    const hasError = errors[field.name];

    const fieldClasses = `w-full px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
    }`;

    switch (field.type) {
      case 'token-selector':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className={fieldClasses}
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            <option value="ADA">ADA</option>
            <option value="DJED">DJED</option>
            <option value="SHEN">SHEN</option>
            <option value="MIN">MIN (Minswap)</option>
            <option value="SUNDAE">SUNDAE (SundaeSwap)</option>
            <option value="WMT">WMT (World Mobile Token)</option>
            <option value="AGIX">AGIX (SingularityNET)</option>
            <option value="COPI">COPI (Cornucopias)</option>
          </select>
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className={fieldClasses}
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            step="any"
            className={fieldClasses}
            required={field.required}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {field.helpText || field.label}
            </label>
          </div>
        );

      case 'address':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder || 'addr1...'}
            className={fieldClasses}
            required={field.required}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={fieldClasses}
            required={field.required}
          />
        );
    }
  };

  const formatOutputValue = (value: any, format?: string): string => {
    if (value === undefined || value === null) return '-';

    switch (format) {
      case 'currency':
        return Number(value).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        });
      case 'percentage':
        return `${(Number(value) * 100).toFixed(2)}%`;
      case 'date':
        return new Date(value).toLocaleString();
      default:
        return String(value);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {uiSchema.title}
          </h2>
          {uiSchema.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {uiSchema.description}
            </p>
          )}
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            via {dappName}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {uiSchema.fields.map((field) => (
            <div key={field.name}>
              {field.type !== 'checkbox' && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              )}

              {renderField(field)}

              {field.helpText && field.type !== 'checkbox' && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {field.helpText}
                </p>
              )}

              {errors[field.name] && (
                <p className="mt-1 text-xs text-red-500">{errors[field.name]}</p>
              )}
            </div>
          ))}

          {errors._form && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{errors._form}</p>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={loading || isExecuting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
              loading || isExecuting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading || isExecuting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              uiSchema.submitButtonText
            )}
          </motion.button>
        </form>

        {/* Result Display */}
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
              ✅ Success
            </h3>
            <div className="space-y-2">
              {uiSchema.outputDisplay.fields.map((field) => (
                <div
                  key={field.name}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {field.label}:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 font-mono">
                    {formatOutputValue(result[field.name], field.format)}
                  </span>
                </div>
              ))}
            </div>

            {result.transactionHash && (
              <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                <a
                  href={`https://cardanoscan.io/transaction/${result.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View on CardanoScan →
                </a>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
