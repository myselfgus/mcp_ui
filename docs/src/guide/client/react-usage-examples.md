# React Usage & Examples

Here's how to use the `<UIResourceRenderer />` component from `@mcp-ui/client` in a React environment.

## Installation

Make sure you have `@mcp-ui/client` and its peer dependencies installed in your project:

```bash
npm i @mcp-ui/client
```

## Rendering Remote DOM Resources

This example shows how to render a `remoteDom` resource. This requires a `remoteElements` and `componentLibrary` (minimal default provided)  to be passed to the `UIResourceRenderer`.

```tsx
import React, { useState } from 'react';
import { 
  UIResourceRenderer, 
  UIActionResult,
  basicComponentLibrary,
  remoteTextDefinition,
  remoteButtonDefinition
} from '@mcp-ui/client';

const remoteDomScript = `
  const button = document.createElement('ui-button');
  button.setAttribute('label', 'Click me for a tool call!');
  button.addEventListener('press', () => {
    window.parent.postMessage({ type: 'tool', payload: { toolName: 'uiInteraction', params: { action: 'button-click', from: 'remote-dom' } } }, '*');
  });
  root.appendChild(button);
`;

// This mocks the resource as received from the server SDK
const remoteDomResource = {
  type: 'resource',
  resource: {
    uri: 'ui://remote-component/action-button',
    mimeType: 'application/vnd.mcp-ui.remote-dom+javascript; framework=react',
    text: remoteDomScript,
  },
};

const AppWithRemoteDOM: React.FC = () => {
  const [lastAction, setLastAction] = useState<any>(null);

  const handleGenericMcpAction = async (result: UIActionResult) => {
    if (result.type === 'tool') {
      setLastAction({ tool: result.payload.toolName, params: result.payload.params });
    }
    return { status: 'Action handled' };
  };

  return (
    <div>
      <UIResourceRenderer
        resource={remoteDomResource.resource}
        onUIAction={handleGenericMcpAction}
        remoteDomProps={{
          library: basicComponentLibrary,
          remoteElements: [remoteButtonDefinition, remoteTextDefinition],
        }}
      />
      {lastAction && (
        <div style={{ marginTop: 20, border: '1px solid green', padding: 10 }}>
          <h3>Last Action Received by Host:</h3>
          <pre>{JSON.stringify(lastAction, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

## Rendering HTML Resources

```tsx
import React, { useState } from 'react';
import { 
  UIResourceRenderer, 
  UIActionResult,
  basicComponentLibrary,
  remoteTextDefinition,
  remoteButtonDefinition
} from '@mcp-ui/client';

// Simulate fetching an MCP UI resource
const fetchMcpResource = async (id: string): Promise<any> => {
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
  if (id === 'remote') {
    const remoteDomScript = `
      const button = document.createElement('ui-button');
      button.setAttribute('label', 'Click me for a tool call!');
      button.addEventListener('press', () => {
        window.parent.postMessage({ type: 'tool', payload: { toolName: 'uiInteraction', params: { action: 'button-click', from: 'remote-dom' } } }, '*');
      });
      root.appendChild(button);
    `;
    return {
      type: 'resource',
      resource: {
        uri: 'ui://remote-component/action-button',
        mimeType: 'application/vnd.mcp-ui.remote-dom+javascript; framework=react',
        text: remoteDomScript,
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
    } else if (result.type === 'notify') {
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
      <button onClick={() => loadResource('remote')}>
        Load Remote DOM
      </button>

      {loading && <p>Loading resource...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {uiResource && uiResource.resource && (
        <div style={{ marginTop: 20, border: '2px solid blue', padding: 10 }}>
          <h2>Rendering Resource: {uiResource.resource.uri}</h2>
          <UIResourceRenderer
            resource={uiResource.resource}
            onUIAction={handleGenericMcpAction}
            remoteDomProps={{
              library: basicComponentLibrary,
              remoteElements: [remoteButtonDefinition, remoteTextDefinition],
            }}
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

## Handling Asynchronous Actions with Message IDs

When your iframe content needs to track the status of long-running operations, you can use the `messageId` field to receive acknowledgment and response messages. Here's a complete example:

### HTML Resource with Async Communication

```typescript
import React, { useState } from 'react';
import { UIResourceRenderer } from '@mcp-ui/client';

const AsyncExampleApp: React.FC = () => {
  const [actionStatus, setActionStatus] = useState<string>('Ready');
  const [actionResult, setActionResult] = useState<any>(null);

  const handleAsyncUIAction = async (result: UIActionResult): Promise<any> => {
    console.log(`Received action with messageId: ${result.messageId}`);
    setActionStatus('Processing...');

    // Simulate an async operation (e.g., API call, database query)
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (result.type === 'tool' && result.payload.toolName === 'processData') {
      // Simulate success or failure based on params
      if (result.payload.params.shouldFail) {
        throw new Error('Simulated processing error');
      }
      
      return {
        status: 'success',
        processedData: `Processed: ${result.payload.params.data}`,
        timestamp: new Date().toISOString()
      };
    }

    return { status: 'unknown action' };
  };

  const asyncHtmlResource = {
    uri: 'ui://async-example/demo',
    mimeType: 'text/html' as const,
    text: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          button { margin: 10px; padding: 10px 20px; }
          .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
          .pending { background: #fff3cd; border: 1px solid #ffeaa7; }
          .success { background: #d4edda; border: 1px solid #c3e6cb; }
          .error { background: #f8d7da; border: 1px solid #f5c6cb; }
        </style>
      </head>
      <body>
        <h3>Async Action Demo</h3>
        <button onclick="processData('success')">Process Data (Success)</button>
        <button onclick="processData('error')">Process Data (Error)</button>
        <div id="status">Ready</div>
        <div id="result"></div>

        <script>
          let messageCounter = 0;
          const pendingRequests = new Map();

          function generateMessageId() {
            return \`async-msg-\${Date.now()}-\${++messageCounter}\`;
          }

          function updateStatus(message, className = '') {
            const statusEl = document.getElementById('status');
            statusEl.textContent = message;
            statusEl.className = 'status ' + className;
          }

          function updateResult(content) {
            document.getElementById('result').innerHTML = content;
          }

          function processData(mode) {
            const messageId = generateMessageId();
            
            updateStatus('Sending request...', 'pending');
            updateResult('');
            
            pendingRequests.set(messageId, { startTime: Date.now(), mode });
            
            window.parent.postMessage({
              type: 'tool',
              messageId: messageId,
              payload: {
                toolName: 'processData',
                params: {
                  data: \`Sample data (\${mode})\`,
                  shouldFail: mode === 'error',
                  timestamp: Date.now()
                }
              }
            }, '*');
          }

          // Listen for response messages
          window.addEventListener('message', (event) => {
            const message = event.data;
            
            if (!message.messageId || !pendingRequests.has(message.messageId)) {
              return;
            }
            
            const request = pendingRequests.get(message.messageId);
            
            switch (message.type) {
              case 'ui-message-received':
                updateStatus('Request acknowledged, processing...', 'pending');
                break;
                
              case 'ui-message-response':
                if (message.payload.error) {
                  updateStatus('Error occurred!', 'error');
                  updateResult(\`
                    <h4>Error:</h4>
                    <div style="color: red;">\${JSON.stringify(message.payload.error, null, 2)}</div>
                  \`);
                  pendingRequests.delete(message.messageId);
                  break;
                }
                updateStatus('Completed successfully!', 'success');
                updateResult(\`
                  <h4>Response:</h4>
                  <pre>\${JSON.stringify(message.payload.response, null, 2)}</pre>
                \`);
                pendingRequests.delete(message.messageId);
                break;
            }
          });
        </script>
      </body>
      </html>
    `
  };

  return (
    <div>
      <h2>Async Communication Example</h2>
      <p>Host Status: {actionStatus}</p>
      {actionResult && (
        <div>
          <h4>Last Host Result:</h4>
          <pre>{JSON.stringify(actionResult, null, 2)}</pre>
        </div>
      )}
      
      <UIResourceRenderer
        resource={asyncHtmlResource}
        onUIAction={handleAsyncUIAction}
      />
    </div>
  );
};
```

### Key Features Demonstrated

1. **Message ID Generation**: The iframe creates unique message IDs for each request
2. **Request Tracking**: Pending requests are stored to match responses
3. **Status Updates**: The UI shows different states (pending, success, error)
4. **Response Handling**: Different message types trigger appropriate UI updates
5. **Cleanup**: Completed requests are removed from pending tracking

This pattern is especially useful for:
- Long-running server operations
- File uploads or downloads
- Database queries
- External API calls
- Multi-step workflows

---

That's it! Just use `<UIResourceRenderer />` with the right props and you're ready to render interactive HTML from MCP resources in your React app. The `UIResourceRenderer` automatically detects the resource type and renders the appropriate component internally. If you need more details, check out the [UIResourceRenderer Component](./resource-renderer.md) page.
