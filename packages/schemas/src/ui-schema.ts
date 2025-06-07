import { z } from 'zod';

/**
 * @experimental
 * Represents validation rules that can be applied to a form field.
 * Placeholder definition, to be expanded with specific validation rule types.
 */
const ValidationRulesSchema = z.record(z.any()).optional(); // Replace with more specific rules later

/**
 * Defines UI hints and layout preferences for rendering a corresponding JSON Schema or a part of it.
 * It can be applied to an entire tool's parameters or to individual parameters within the schema.
 */
export const UISchema = z.object({
  /** Specifies a custom widget or component to use for rendering this field.
   *  e.g., "textarea", "datepicker", "custom-slider"
   */
  widget: z.string().optional(),
  /** Defines the layout orientation for child elements if this schema part represents an object or array. */
  layout: z.enum(['vertical', 'horizontal', 'grid']).optional(),
  /** Identifier for a completely custom React component to render this part of the schema. */
  customComponent: z.string().optional(),
  /** Validation rules specific to the UI, potentially more detailed or UI-focused than JSON schema validation. */
  validation: ValidationRulesSchema,
  /** A custom label for the form field. If not provided, a label might be generated from the property name. */
  label: z.string().optional(),
  /** Placeholder text for input fields. */
  placeholder: z.string().optional(),
  /**
   * Provides a list of predefined options for fields that should be rendered as a select,
   * radio group, or similar selection component. This is particularly useful for `enum` types
   * in JSON Schema, allowing for more descriptive labels than just the enum values.
   */
  options: z.array(z.object({
    /** The human-readable label for the option. */
    label: z.string(),
    /** The actual value to be submitted for this option. */
    value: z.union([z.string(), z.number(), z.boolean()])
  })).optional(),
});

/**
 * TypeScript type inferred from the `UISchema` Zod schema.
 * Provides UI hints and layout preferences for rendering a corresponding JSON Schema.
 * @see UISchema
 */
export type UISchema = z.infer<typeof UISchema>;
