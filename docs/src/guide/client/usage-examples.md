# @mcp-ui/client Usage & Examples

Here's how to use the `<UIResourceRenderer />` component from `@mcp-ui/client`.

## Installation

Make sure you have `@mcp-ui/client` and its peer dependencies installed in your project:

```bash
npm i @mcp-ui/client
```

## Rendering HTML Resources

```tsx
import React, { useState } from 'react';
import { UIResourceRenderer, UIActionResult } from '@mcp-ui/client';

// Simulate fetching an MCP UI resource
const fetchMcpResource = async (id: string): Promise<UIResource> => {
  if (id === 'raw') {
    return {
      type: 'resource',
      resource: {
        uri: 'ui://example/raw-html',
        mimeType: 'text/html',
        text: "<h1>raw HTML via Text</h1><p>Content loaded rawly.</p><button onclick=\"window.parent.postMessage({ type: 'tool', payload: { toolName: 'uiInteraction', params: { action: 'rawClick', value: Date.now() } } }, '*')\">Click Me (raw)</button>",
      },
    };
  } else if (id === 'blob') {
    const html =
      "<h1>HTML from Blob</h1><p>Content was Base64 encoded.</p><button onclick=\"window.parent.postMessage({ type: 'tool', payload: { toolName: 'uiInteraction', params: { action: 'blobClick', value: 'test' } } }, '*')\">Click Me (Blob)</button>";
    return {
      type: 'resource',
      resource: {
        uri: 'ui://example/blob-html',
        mimeType: 'text/html',
        blob: btoa(html),
      },
    };
  } else if (id === 'external') {
    return {
      type: 'resource',
      resource: {
        uri: 'ui://example/external-site',
        mimeType: 'text/uri-list',
        text: 'https://vitepress.dev',
      },
    };
  }
  throw new Error('Unknown resource ID');
};

const App: React.FC = () => {
  const [uiResource, setUIResource] = useState<UIResource | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<any>(null);

  const loadResource = async (id: string) => {
    setLoading(true);
    setError(null);
    setUIResource(null);
    try {
      const block = await fetchMcpResource(id);
      setUIResource(block);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleGenericMcpAction = async (result: UIActionResult) => {
    if (result.type === 'tool') {
      console.log(`Action received in host app - Tool: ${result.payload.toolName}, Params:`, result.payload.params);
      setLastAction({ tool: result.payload.toolName, params: result.payload.params });
    } else if (result.type === 'prompt') {
      console.log(`Prompt received in host app:`, result.payload.prompt);
      setLastAction({ prompt: result.payload.prompt });
    } else if (result.type === 'link') {
      console.log(`Link received in host app:`, result.payload.url);
      setLastAction({ url: result.payload.url });
    } else if (result.type === 'intent') {
      console.log(`Intent received in host app:`, result.payload.intent);
      setLastAction({ intent: result.payload.intent });
    } else if (result.type === 'notification') {
      console.log(`Notification received in host app:`, result.payload.message);
      setLastAction({ message: result.payload.message });
    }
    return {
      status: 'Action handled by host application',
    };
  };

  return (
    <div>
      <h1>MCP-UI Client Demo</h1>
      <button onClick={() => loadResource('raw')}>
        Load raw HTML (Text)
      </button>
      <button onClick={() => loadResource('blob')}>
        Load raw HTML (Blob)
      </button>
      <button onClick={() => loadResource('external')}>
        Load External App (URL)
      </button>

      {loading && <p>Loading resource...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {uiResource && uiResource.resource && (
        <div style={{ marginTop: 20, border: '2px solid blue', padding: 10 }}>
          <h2>Rendering Resource: {uiResource.resource.uri}</h2>
          <UIResourceRenderer
            resource={uiResource.resource}
            onUIAction={handleGenericMcpAction}
          />
        </div>
      )}

      {lastAction && (
        <div style={{ marginTop: 20, border: '1px solid green', padding: 10 }}>
          <h3>Last Action Received by Host:</h3>
          <pre>{JSON.stringify(lastAction, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default App;
```

---

That's it! Just use `<UIResourceRenderer />` with the right props and you're ready to render interactive HTML from MCP resources in your React app. The `UIResourceRenderer` automatically detects the resource type and renders the appropriate component internally. If you need more details, check out the [UIResourceRenderer Component](./resource-renderer.md) page.
