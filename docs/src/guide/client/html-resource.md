# HtmlResource Component

The `<HtmlResource />` component is currently the main component of the`@mcp-ui/client` package. It's the only export you need to render interactive HTML resources in your React app.

## Props

```typescript
import type { Resource } from '@modelcontextprotocol/sdk/types';

export interface HtmlResourceProps {
  resource: Partial<Resource>;
  onUiAction?: (
    tool: string,
    params: Record<string, unknown>,
  ) => Promise<any>;
  style?: React.CSSProperties;
}
```

- **`resource`**: The resource object from an `HtmlResourceBlock`. It should include `uri`, `mimeType`, and either `text` or `blob`.
- **`onUiAction`**: An optional callback that fires when the iframe content (for `ui://` resources) posts a message to your app. The message should look like `{ tool: string, params: Record<string, unknown> }`.
- **`style`** (optional): Custom styles for the iframe.

## How It Works

1.  **Checks Content Type**: If `resource.mimeType` isn't `"text/html"` or `"text/uri-list"`, you'll see an error.
2.  **Handles URI Schemes**:
    - For resources with `mimeType: 'text/uri-list'`:
      - Expects `resource.text` or `resource.blob` to contain a single URL in URI list format
      - **MCP-UI requires a single URL**: While the format supports multiple URLs, only the first valid URL is used
      - Multiple URLs are supported for fallback specification but will trigger warnings
      - Ignores comment lines starting with `#` and empty lines
      - If using `blob`, it decodes it from Base64.
      - Renders an `<iframe>` with its `src` set to the first valid URL.
      - Sandbox: `allow-scripts allow-same-origin` (needed for some external sites; be mindful of security).
    - For resources with `mimeType: 'text/html'`:
      - Expects `resource.text` or `resource.blob` to contain HTML.
      - If using `blob`, it decodes it from Base64.
      - Renders an `<iframe>` with its `srcdoc` set to the HTML.
      - Sandbox: `allow-scripts`.
3.  **Listens for Messages**: Adds a global `message` event listener. If an iframe posts a message with `event.data.tool`, your `onUiAction` callback is called.

## Styling

By default, the iframe stretches to 100% width and is at least 200px tall. You can override this with the `style` prop or your own CSS.

## Example Usage

See [Client SDK Usage & Examples](./usage-examples.md).

## Recommended Usage Pattern

Client-side hosts should check for the `ui://` URI scheme first to identify MCP-UI resources, rather than checking mimeType:

```tsx
function App({ mcpResource }) {
  if (
    mcpResource.type === 'resource' &&
    mcpResource.resource.uri?.startsWith('ui://')
  ) {
    return (
      <HtmlResource
        resource={mcpResource.resource}
        onUiAction={(tool, params) => {
          console.log('Action:', tool, params);
          return { status: 'ok' };
        }}
      />
    );
  }
  return <p>Unsupported resource</p>;
}
```

This pattern allows the `HtmlResource` component to handle mimeType-based rendering internally, making your code more future-proof as new content types (like `application/javascript`) are added.

## Backwards Compatibility

The `HtmlResource` component maintains backwards compatibility with the legacy `ui-app://` URI scheme:

- **Legacy Support**: Resources with `ui-app://` URIs are automatically treated as URL content (equivalent to `mimeType: 'text/uri-list'`) even when they have the historically incorrect `mimeType: 'text/html'`
- **Automatic Detection**: The component detects legacy URIs and processes them correctly without requiring code changes
- **MimeType Override**: Ignores the incorrect `text/html` mimeType and treats content as URLs
- **Migration Encouragement**: A warning is logged when legacy URIs are detected, encouraging server updates
- **Seamless Transition**: Existing clients continue working with older servers during migration periods

### Legacy URI Handling

```tsx
// Both patterns work identically:
// Legacy (automatically detected and corrected):
<HtmlResource resource={{ uri: 'ui-app://widget/123', mimeType: 'text/html', text: 'https://example.com/widget' }} />
// Modern (recommended):
<HtmlResource resource={{ uri: 'ui://widget/123', mimeType: 'text/uri-list', text: 'https://example.com/widget' }} />
```

## Security Notes

- **`sandbox` attribute**: Restricts what the iframe can do. `allow-scripts` is needed for interactivity. `allow-same-origin` is external apps. Caution - the external app method isn's not a secure way to render untrusted code. We're working on new methods to alleviate security concerns.
- **`postMessage` origin**: When sending messages from the iframe, always specify the target origin for safety. The component listens globally, so your iframe content should be explicit.
- **Content Sanitization**: HTML is rendered as-is. If you don't fully trust the source, sanitize the HTML before passing it in, or rely on the iframe's sandboxing.
