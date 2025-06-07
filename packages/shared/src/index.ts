import { MCPToolSchema } from '@mcp-ui/schemas'; // Assuming linked

/**
 * Represents an HTML resource that can be part of an MCP (Model Context Protocol) message.
 * It defines the structure for embedding HTML content or linking to an external HTML application,
 * and can optionally include an `MCPToolSchema` for schema-driven UI generation.
 */
export interface HtmlResource {
  /** Indicates the type of content block, always 'resource' for this type. */
  type: 'resource';
  /** Contains the details of the HTML resource. */
  resource: {
    /**
     * Primary identifier for the resource.
     * Typically starts with "ui://" for inline/embedded HTML or "ui-app://" for external HTML applications.
     */
    uri: string;
    /** The MIME type of the resource, expected to be 'text/html'. */
    mimeType: 'text/html';
    /**
     * Optional direct HTML content string or a URL (if `uri` is 'ui-app://').
     * This field is typically used when the `delivery` method specified at creation time was 'text'.
     */
    text?: string;
    /**
     * Optional Base64 encoded HTML content string or URL.
     * This field is typically used when the `delivery` method specified at creation time was 'blob'.
     */
    blob?: string;
    /**
     * Optional schema definition for an MCP tool associated with this HTML resource.
     * If provided, clients can use this schema to dynamically generate a UI for interacting
     * with the tool, potentially as an alternative or enhancement to the static HTML content.
     * @see MCPToolSchema from '@mcp-ui/schemas'
     */
    mcpToolSchema?: MCPToolSchema;
    // TODO: Consider adding other common resource fields if necessary e.g. title, description, icon
  };
}

// Define other shared types here if any in the future
// For example:
// export interface SomeOtherSharedType {
//   id: string;
// }
