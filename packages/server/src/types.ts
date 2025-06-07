export type ResourceContentPayload =
  | { type: 'rawHtml'; htmlString: string }
  | { type: 'externalUrl'; iframeUrl: string };

import { MCPToolSchema } from '@mcp-ui/schemas';

/**
 * Defines the options for creating an HTML resource block.
 */
export interface CreateHtmlResourceOptions {
  /**
   * REQUIRED. The URI for the resource.
   * Must start with "ui://" if `content.type` is "rawHtml".
   * Must start with "ui-app://" if `content.type` is "externalUrl".
   */
  uri: string;
  /** REQUIRED. The actual content payload, specifying either raw HTML or an external URL. */
  content: ResourceContentPayload;
  /**
   * REQUIRED. Specifies how the content string (`htmlString` or `iframeUrl`)
   * should be packaged in the final `HtmlResourceBlock`.
   * - 'text': The content string is included directly in the `text` field.
   * - 'blob': The content string is Base64 encoded and included in the `blob` field.
   */
  delivery: 'text' | 'blob';
  /**
   * Optional schema definition for an MCP tool. If provided, this schema
   * will be included in the generated `HtmlResourceBlock`. Clients can use this
   * schema to dynamically render a UI for the tool.
   * @see MCPToolSchema from '@mcp-ui/schemas'
   */
  mcpToolSchema?: MCPToolSchema;
}
