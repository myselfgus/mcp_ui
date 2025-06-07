import { MCPToolSchema, UISchema } from '@mcp-ui/schemas'; // Assuming schemas are published/linked

/**
 * Represents a single option for a form field, typically used for 'select' type fields.
 */
export interface FormFieldOption {
  /** The human-readable text displayed for this option. */
  label: string;
  /** The actual value submitted if this option is selected. */
  value: string | number | boolean;
}

/**
 * Describes the structure and properties of a single field within a generated form.
 * This is an intermediate representation derived from an `MCPToolSchema`.
 */
export interface FormField {
  /** The name of the field, corresponding to a property name in the tool's JSONSchema parameters. */
  name: string;
  /** The human-readable label for the form field. */
  label: string;
  /** The type of form input to render (e.g., 'text', 'number', 'select'). */
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'array'; // Add more as supported
  /** The default value for this field. */
  defaultValue?: any;
  /** Placeholder text for the input field. */
  placeholder?: string;
  /** An array of options, if the field type is 'select'. */
  options?: FormFieldOption[];
  /** Whether this field is required. */
  required: boolean;
  /** Basic validation rules derived from the JSONSchema for this field. */
  validation?: {
    /** A regex pattern string for validation. */
    pattern?: string;
    /** Minimum length for string types. */
    minLength?: number;
    /** Maximum length for string types. */
    maxLength?: number;
    /** Minimum value for number types. */
    minimum?: number;
    /** Maximum value for number types. */
    maximum?: number;
  };
  /** For 'object' type fields, this would contain a nested array of `FormField` definitions. (Currently not fully implemented in `generateUIFromSchema`) */
  fields?: FormField[];
  /** For 'array' type fields, this describes the schema of items within the array. (Currently supports simple types) */
  itemSchema?: FormField;
}

/**
 * Represents the complete definition of a form to be rendered for an MCP tool.
 * It includes metadata about the tool and an array of `FormField` objects.
 */
export interface FormDefinition {
  /** The name of the tool for which this form is generated. */
  toolName: string;
  /** An optional description of the tool. */
  description?: string;
  /** An array of `FormField` objects defining the inputs for the tool. */
  fields: FormField[];
  // TODO: Consider adding global layout hints derived from the root uiSchema here.
}

/**
 * Generates a human-readable label for a form field based on its property name and optional UI hints.
 * If a label is provided in `uiHint`, it's used directly. Otherwise, the property name
 * (camelCase or snake_case) is converted to Title Case (e.g., "userId" becomes "User Id").
 * @param propertyName - The machine-readable name of the property (e.g., "userId", "full_name").
 * @param uiHint - Optional UI schema hint that might contain a pre-defined label.
 * @returns A human-readable string label for the field.
 */
function getFieldLabel(propertyName: string, uiHint?: UISchema): string {
  if (uiHint?.label) return uiHint.label;
  // Convert propertyName from camelCase or snake_case to Title Case
  const spaced = propertyName.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Transforms an `MCPToolSchema` into a `FormDefinition` which is an intermediate
 * representation used to render a dynamic UI.
 *
 * It iterates through the `toolSchema.parameters.properties` and maps each JSON schema
 * property to a `FormField` definition. It considers `uiSchema` hints for determining
 * labels, widget types (e.g., 'textarea' vs 'text'), and select options.
 *
 * @param toolSchema - The full schema description of the MCP tool, including its parameters and UI hints.
 * @returns A `FormDefinition` object that describes the form to be rendered, including
 *          metadata about the tool and an array of `FormField` objects.
 */
export function generateUIFromSchema(toolSchema: MCPToolSchema): FormDefinition {
  const fields: FormField[] = [];
  const parametersSchema = toolSchema.parameters;
  const toolUISchema = toolSchema.uiSchema; // Overall UI schema for the tool

  if (parametersSchema && parametersSchema.properties) {
    for (const paramName in parametersSchema.properties) {
      const propSchema = parametersSchema.properties[paramName] as any; // Zod any type for now
      const paramUISchema = toolUISchema?.[paramName] as UISchema || toolUISchema?.properties?.[paramName] as UISchema || {}; // More robust lookup needed

      let fieldType: FormField['type'] = 'text'; // Default
      if (propSchema.type === 'string') {
        fieldType = paramUISchema?.widget === 'textarea' ? 'textarea' : 'text';
        if (propSchema.enum) {
          fieldType = 'select';
        }
      } else if (propSchema.type === 'number' || propSchema.type === 'integer') {
        fieldType = 'number';
      } else if (propSchema.type === 'boolean') {
        fieldType = 'boolean';
      } else if (propSchema.type === 'array') {
        fieldType = 'array'; // Further processing needed for array items
      }
      // Add more type mappings (object, etc.)

      const field: FormField = {
        name: paramName,
        label: getFieldLabel(paramName, paramUISchema),
        type: fieldType,
        required: parametersSchema.required?.includes(paramName) || false,
        defaultValue: propSchema.default,
        placeholder: paramUISchema?.placeholder,
        validation: {
          pattern: propSchema.pattern,
          minLength: propSchema.minLength,
          maxLength: propSchema.maxLength,
          minimum: propSchema.minimum || propSchema.exclusiveMinimum,
          maximum: propSchema.maximum || propSchema.exclusiveMaximum,
        },
      };

      if (fieldType === 'select' && propSchema.enum) {
        field.options = propSchema.enum.map((val: string | number | boolean) => ({
          label: val.toString(), // Consider uiSchema for labels if available
          value: val,
        }));
        // Check uiSchema for more descriptive options
        if (paramUISchema?.options) {
           field.options = paramUISchema.options;
        }
      }

      // Basic handling for array of simple types
      if (fieldType === 'array' && propSchema.items && propSchema.items.type && !propSchema.items.properties) {
        let itemType: FormField['type'] = 'text';
        if (propSchema.items.type === 'string') itemType = 'text';
        else if (propSchema.items.type === 'number' || propSchema.items.type === 'integer') itemType = 'number';
        else if (propSchema.items.type === 'boolean') itemType = 'boolean';
        // Note: Does not handle arrays of objects or complex item schemas yet
        field.itemSchema = { name: 'item', label: 'Item', type: itemType, required: false };
      }


      fields.push(field);
    }
  }

  return {
    toolName: toolSchema.tool,
    description: toolSchema.description,
    fields: fields,
  };
}
