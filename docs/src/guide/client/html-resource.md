# HTMLResourceRenderer Component

The `<HTMLResourceRenderer />` component is an internal component used by `<UIResourceRenderer />` to render HTML and URL-based resources.

## Props

```typescript
import type { Resource } from '@modelcontextprotocol/sdk/types';

export interface HTMLResourceRendererProps {
  resource: Partial<Resource>;
  onUIAction?: (result: UIActionResult) => Promise<any>;
  style?: React.CSSProperties;
  iframeProps?: Omit<React.HTMLAttributes<HTMLIFrameElement>, 'src' | 'srcDoc' | 'ref' | 'style'>;
}
```

The component accepts the following props:

- **`resource`**: The resource object from an `UIResource`. It should include `uri`, `mimeType`, and either `text` or `blob`.
- **`onUIAction`**: An optional callback that fires when the iframe content (for `ui://` resources) posts a message to your app. The message should look like:
  ```typescript
  { type: 'tool', payload: { toolName: string, params: Record<string, unknown> } } |
  { type: 'intent', payload: { intent: string, params: Record<string, unknown> } } |
  { type: 'prompt', payload: { prompt: string } } |
  { type: 'notify', payload: { message: string } } |
  { type: 'link', payload: { url: string } } |
  ```
  If you don't provide a callback for a specific type, the default handler will be used.
- **`style`**: (Optional) Custom styles for the iframe.
- **`iframeProps`**: (Optional) Custom props for the iframe.

## How It Works

1.  **Checks Content Type**: If `resource.mimeType` isn't `"text/html"` or `"text/uri-list"`, you'll see an error.
2.  **Handles URI Schemes**:
    - For resources with `mimeType: 'text/uri-list'`:
      - Expects `resource.text` or `resource.blob` to contain a single URL in URI list format
      - **MCP-UI requires a single URL**: While the format supports multiple URLs, only the first valid `http/s` URL is used
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
3.  **Listens for Messages**: Adds a global `message` event listener. If an iframe posts a message with `event.data.tool`, your `onUIAction` callback is called.

## Styling

By default, the iframe stretches to 100% width and is at least 200px tall. You can override this with the `style` prop or your own CSS.

## Example Usage

See [Client SDK Usage & Examples](./usage-examples.md) for examples using the recommended `<UIResourceRenderer />` component.

## Security Notes

- **`sandbox` attribute**: Restricts what the iframe can do. `allow-scripts` is required for JS execution. In the external URL content type, `allow-same-origin` is needed for external apps. Other than these inclusions, all other capabilities are restricted (e.g., no parent access, top-level navigations, modals, forms, etc.)
- **`postMessage` origin**: When sending messages from the iframe, always specify the target origin for safety. The component listens globally, so your iframe content should be explicit.
- **Content Sanitization**: HTML is rendered as-is. If you don't fully trust the source, sanitize the HTML before passing it in, or rely on the iframe's sandboxing.
