/**
 * Schema Parser - Converts database interface schemas to UI component definitions
 */

export interface UIFieldSchema {
  name: string;
  type: 'text' | 'number' | 'select' | 'token-selector' | 'address' | 'checkbox';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  helpText?: string;
}

export interface UISchema {
  title: string;
  description?: string;
  fields: UIFieldSchema[];
  submitButtonText: string;
  outputDisplay: {
    fields: { name: string; label: string; format?: string }[];
  };
}

export interface DAppInterfaceSchema {
  id: string;
  dappId: string;
  actionType: string;
  inputSchema: any;
  outputSchema: any;
  contractInterface: any;
  exampleUsage?: string | null;
}

/**
 * Parse a DApp interface schema from the database into a UI schema
 */
export function parseInterfaceToUISchema(
  dappInterface: DAppInterfaceSchema,
  dappName?: string
): UISchema {
  const inputSchema = typeof dappInterface.inputSchema === 'string'
    ? JSON.parse(dappInterface.inputSchema)
    : dappInterface.inputSchema;

  const outputSchema = typeof dappInterface.outputSchema === 'string'
    ? JSON.parse(dappInterface.outputSchema)
    : dappInterface.outputSchema;

  // Generate fields from input schema
  const fields: UIFieldSchema[] = Object.entries(inputSchema).map(([key, config]: [string, any]) => {
    // Infer field type from config
    let fieldType: UIFieldSchema['type'] = 'text';

    if (config.type === 'number' || config.type === 'amount') {
      fieldType = 'number';
    } else if (config.type === 'select' && config.options) {
      fieldType = 'select';
    } else if (config.type === 'token' || key.toLowerCase().includes('token')) {
      fieldType = 'token-selector';
    } else if (config.type === 'address' || key.toLowerCase().includes('address')) {
      fieldType = 'address';
    } else if (config.type === 'boolean' || config.type === 'checkbox') {
      fieldType = 'checkbox';
    }

    return {
      name: key,
      type: fieldType,
      label: config.label || formatLabel(key),
      required: config.required ?? true,
      placeholder: config.placeholder,
      options: config.options,
      validation: config.validation || inferValidation(config, fieldType),
      helpText: config.helpText || config.description,
    };
  });

  // Generate output display fields
  const outputFields = Object.entries(outputSchema).map(([key, config]: [string, any]) => ({
    name: key,
    label: config.label || formatLabel(key),
    format: config.format, // e.g., 'currency', 'percentage', 'date'
  }));

  return {
    title: `${formatActionType(dappInterface.actionType)}${dappName ? ` on ${dappName}` : ''}`,
    description: dappInterface.exampleUsage || undefined,
    fields,
    submitButtonText: formatActionType(dappInterface.actionType),
    outputDisplay: {
      fields: outputFields,
    },
  };
}

/**
 * Format a field key into a human-readable label
 */
function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/_/g, ' ')
    .trim();
}

/**
 * Format action type for display
 */
function formatActionType(actionType: string): string {
  const formatted = actionType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return formatted;
}

/**
 * Infer validation rules from config and field type
 */
function inferValidation(
  config: any,
  fieldType: UIFieldSchema['type']
): UIFieldSchema['validation'] | undefined {
  const validation: UIFieldSchema['validation'] = {};

  if (fieldType === 'number') {
    if (config.min !== undefined) validation.min = config.min;
    if (config.max !== undefined) validation.max = config.max;
    // Default to positive numbers for amounts
    if (config.type === 'amount' && validation.min === undefined) {
      validation.min = 0;
    }
  }

  if (fieldType === 'text' || fieldType === 'address') {
    if (config.minLength !== undefined) validation.minLength = config.minLength;
    if (config.maxLength !== undefined) validation.maxLength = config.maxLength;
    if (config.pattern !== undefined) validation.pattern = config.pattern;
  }

  return Object.keys(validation).length > 0 ? validation : undefined;
}

/**
 * Validate form data against UI schema
 */
export function validateFormData(
  data: Record<string, any>,
  schema: UISchema
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const field of schema.fields) {
    const value = data[field.name];

    // Required field validation
    if (field.required && (value === undefined || value === null || value === '')) {
      errors[field.name] = `${field.label} is required`;
      continue;
    }

    // Skip validation if field is not required and empty
    if (!field.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Type-specific validation
    if (field.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors[field.name] = `${field.label} must be a valid number`;
        continue;
      }

      if (field.validation?.min !== undefined && numValue < field.validation.min) {
        errors[field.name] = `${field.label} must be at least ${field.validation.min}`;
      }
      if (field.validation?.max !== undefined && numValue > field.validation.max) {
        errors[field.name] = `${field.label} must be at most ${field.validation.max}`;
      }
    }

    if (field.type === 'text' || field.type === 'address') {
      const strValue = String(value);
      if (field.validation?.minLength && strValue.length < field.validation.minLength) {
        errors[field.name] = `${field.label} must be at least ${field.validation.minLength} characters`;
      }
      if (field.validation?.maxLength && strValue.length > field.validation.maxLength) {
        errors[field.name] = `${field.label} must be at most ${field.validation.maxLength} characters`;
      }
      if (field.validation?.pattern) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(strValue)) {
          errors[field.name] = `${field.label} format is invalid`;
        }
      }
    }

    if (field.type === 'select' && field.options) {
      if (!field.options.includes(value)) {
        errors[field.name] = `${field.label} must be one of: ${field.options.join(', ')}`;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Generate default form data from UI schema
 */
export function generateDefaultFormData(
  schema: UISchema,
  initialValues?: Record<string, any>
): Record<string, any> {
  const data: Record<string, any> = {};

  for (const field of schema.fields) {
    if (initialValues && initialValues[field.name] !== undefined) {
      data[field.name] = initialValues[field.name];
    } else if (field.type === 'checkbox') {
      data[field.name] = false;
    } else if (field.type === 'number') {
      data[field.name] = field.validation?.min || 0;
    } else if (field.type === 'select' && field.options && field.options.length > 0) {
      data[field.name] = field.options[0];
    } else {
      data[field.name] = '';
    }
  }

  return data;
}
