import { z } from 'zod';
import { UISchema } from './ui-schema'; // Import from the local file

/**
 * @experimental
 * Represents a basic, permissive Zod schema for a JSON Schema object.
 * JSON Schema is a vocabulary that allows you to annotate and validate JSON documents.
 * This definition is not a full JSON Schema validator but covers common properties.
 * For full JSON Schema validation, a more specific library or type would be used.
 * @see {@link https://json-schema.org/} for more information on JSON Schema.
 */
const JSONSchema = z.record(z.string(), z.any()).and(z.object({
  /** The fundamental type of this schema (e.g., "string", "number", "object", "array"). */
  type: z.string().optional(),
  /** If `type` is "object", this defines the properties (fields) of the object. */
  properties: z.record(z.string(), z.any()).optional(),
  /** If `type` is "array", this defines the schema for items in the array. */
  items: z.record(z.string(), z.any()).optional(),
  /** An array of property names that are required if `type` is "object". */
  required: z.array(z.string()).optional(),
})).describe("Represents a JSON Schema object");

/**
 * Defines the structure for describing an MCP (Model Context Protocol) tool.
 * This schema includes how to identify the tool, its purpose, the parameters it accepts
 * (defined using JSON Schema), optional UI hints for rendering those parameters,
 * and an optional schema for the tool's response.
 */
export const MCPToolSchema = z.object({
  /** A unique identifier for the tool, e.g., 'weather-lookup', 'image-generator'. */
  tool: z.string().describe("Identifier for the tool, e.g., 'weather-lookup'"),
  /** A human-readable description of what the tool does. */
  description: z.string().optional().describe("A brief description of what the tool does"),
  /**
   * A JSON Schema object defining the input parameters that the tool accepts.
   * This schema dictates the structure, types, and validation rules for the tool's inputs.
   */
  parameters: JSONSchema.describe("JSON Schema for the tool's input parameters"),
  /**
   * Optional UI hints and layout preferences for rendering the tool's parameters.
   * This schema, if provided, guides the UI generation engine on how to display form fields,
   * choose widgets, and arrange elements.
   * @see UISchema
   */
  uiSchema: UISchema.optional().describe("Optional UI hints and layout preferences for rendering tool parameters"),
  /**
   * Optional JSON Schema defining the structure and types of the data that the tool is expected to return.
   * This can be used by the client to understand and potentially validate the tool's response.
   */
  responseSchema: JSONSchema.optional().describe("Optional JSON Schema for the tool's response data"),
});

/**
 * TypeScript type inferred from the `MCPToolSchema` Zod schema.
 * Describes an MCP tool, including its identification, parameters, UI hints, and response structure.
 * @see MCPToolSchema
 */
export type MCPToolSchema = z.infer<typeof MCPToolSchema>;
