/**
 * Defines the structure of an interactive HTML resource block
 * that the server will send to the client.
 */

// Import types first
import { CreateHtmlResourceOptions } from './types.js';
import { MCPToolSchema } from '@mcp-ui/schemas';

/**
 * Defines the structure of an interactive HTML resource block
 * that the server can send to the client. This block can contain
 * either direct HTML content, a URL to an external HTML application,
 * and optionally an `MCPToolSchema` for schema-driven UI generation.
 */
export interface HtmlResourceBlock {
  /** Indicates the type of content block, always 'resource' for this type. */
  type: 'resource';
  /** Contains the details of the HTML resource. */
  resource: {
    /**
     * Primary identifier for the resource.
     * Must start with "ui://" if `content.type` in `CreateHtmlResourceOptions` is "rawHtml".
     * Must start with "ui-app://" if `content.type` is "externalUrl".
     */
    uri: string;
    /** The MIME type of the resource, always 'text/html' for this block. */
    mimeType: 'text/html';
    /**
     * The HTML content string or the URL for an iframe.
     * Populated if `delivery` in `CreateHtmlResourceOptions` is 'text'.
     */
    text?: string;
    /**
     * Base64 encoded HTML content string or URL for an iframe.
     * Populated if `delivery` in `CreateHtmlResourceOptions` is 'blob'.
     */
    blob?: string;
    /**
     * Optional schema definition for an MCP tool. If provided, clients can use this
     * to dynamically generate a UI for interacting with the tool, potentially
     * instead of or in conjunction with the HTML content in `text` or `blob`.
     * @see MCPToolSchema from '@mcp-ui/schemas'
     */
    mcpToolSchema?: MCPToolSchema;
  };
}

/**
 * Robustly encodes a UTF-8 string to Base64.
 * Uses Node.js Buffer if available, otherwise TextEncoder and btoa.
 * @param str The string to encode.
 * @returns Base64 encoded string.
 */
function robustUtf8ToBase64(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64');
  } else if (
    typeof TextEncoder !== 'undefined' &&
    typeof btoa !== 'undefined'
  ) {
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(str);
    let binaryString = '';
    uint8Array.forEach((byte) => {
      binaryString += String.fromCharCode(byte);
    });
    return btoa(binaryString);
  } else {
    console.warn(
      'MCP SDK: Buffer API and TextEncoder/btoa not available. Base64 encoding might not be UTF-8 safe.',
    );
    try {
      return btoa(str);
    } catch (e) {
      throw new Error(
        'MCP SDK: Suitable UTF-8 to Base64 encoding method not found, and fallback btoa failed.',
      );
    }
  }
}

/**
 * Creates an `HtmlResourceBlock` object, which is suitable for inclusion in the
 * 'content' array of a tool result in the Model Context Protocol.
 *
 * This function packages HTML content (either raw or as a URL) for delivery to a client,
 * and can now optionally include an `MCPToolSchema` to enable schema-driven UI generation
 * on the client side.
 *
 * @param options - Configuration options for creating the HTML resource.
 *   Includes the URI, content payload (raw HTML or external URL), delivery method (text or blob),
 *   and an optional `mcpToolSchema`.
 * @returns An `HtmlResourceBlock` object structured for MCP.
 * @throws If URI prefixes do not match the content type (e.g., 'ui://' for rawHtml, 'ui-app://' for externalUrl).
 * @throws If content string is not provided for the specified content type.
 *
 * @example
 * ```typescript
 * import { createHtmlResource, MCPToolSchema } from '@mcp-ui/server'; // Assuming MCPToolSchema is re-exported or directly available
 *
 * const myToolSchema: MCPToolSchema = {
 *   tool: 'example_tool',
 *   parameters: { type: 'object', properties: { param1: { type: 'string' } } },
 *   // ... other schema details
 * };
 *
 * const resource = createHtmlResource({
 *   uri: 'ui://my-tool-interface',
 *   content: { type: 'rawHtml', htmlString: '<h1>Hello World</h1><p>Interact with my tool.</p>' },
 *   delivery: 'text',
 *   mcpToolSchema: myToolSchema
 * });
 *
 * // This 'resource' can then be sent as part of an MCP message.
 * ```
 */
export function createHtmlResource(
  options: CreateHtmlResourceOptions,
): HtmlResourceBlock {
  const { mcpToolSchema } = options; // <<< DESTRUCTURE
  let actualContentString: string;

  if (options.content.type === 'rawHtml') {
    if (!options.uri.startsWith('ui://')) {
      throw new Error(
        "MCP SDK: URI must start with 'ui://' when content.type is 'rawHtml'.",
      );
    }
    actualContentString = options.content.htmlString;
    if (typeof actualContentString !== 'string') {
      throw new Error(
        "MCP SDK: content.htmlString must be provided as a string when content.type is 'rawHtml'.",
      );
    }
  } else if (options.content.type === 'externalUrl') {
    if (!options.uri.startsWith('ui-app://')) {
      throw new Error(
        "MCP SDK: URI must start with 'ui-app://' when content.type is 'externalUrl'.",
      );
    }
    actualContentString = options.content.iframeUrl;
    if (typeof actualContentString !== 'string') {
      throw new Error(
        "MCP SDK: content.iframeUrl must be provided as a string when content.type is 'externalUrl'.",
      );
    }
  } else {
    // This case should ideally be prevented by TypeScript's discriminated union checks
    const exhaustiveCheckContent: never = options.content;
    throw new Error(
      `MCP SDK: Invalid content.type specified: ${exhaustiveCheckContent}`,
    );
  }

  const resource: HtmlResourceBlock['resource'] = {
    uri: options.uri,
    mimeType: 'text/html',
    mcpToolSchema: mcpToolSchema, // <<< ASSIGN
  };

  switch (options.delivery) {
    case 'text':
      resource.text = actualContentString;
      break;
    case 'blob':
      resource.blob = robustUtf8ToBase64(actualContentString);
      break;
  }

  return {
    type: 'resource',
    resource: resource,
  };
}

// --- HTML Escaping Utilities ---
// These are kept as they can be useful for consumers preparing HTML strings.
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function escapeAttribute(unsafe: string): string {
  // Simplified: primarily for quotes. More robust escaping might be needed
  // depending on context, but for attributes, quotes are key.
  return unsafe.replace(/"/g, '&quot;');
}

export type {
  CreateHtmlResourceOptions as CreateResourceOptions,
  ResourceContentPayload,
} from './types.js';
