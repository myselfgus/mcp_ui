# Introduction

Welcome to the MCP-UI documentation!

This SDK provides tools for building Model Context Protocol (MCP) enabled applications with interactive UI components. It aims to standardize how models and tools can request the display of rich HTML interfaces within a client application.

## What is MCP-UI?

MCP-UI is a TypeScript SDK containing:

- **`@mcp-ui/client`**: UI components (like `<ResourceRenderer />`) for easy rendering of interactive UI snippets.
- **`@mcp-ui/server`**: Helper functions (like `createUiSnippetResource`) for server-side logic to easily construct `UiSnippetResource` objects.

## Core Concept: The Interactive UI Snippet Resource Protocol

The central piece of this SDK is the `UiSnippetResource`. This object defines a contract for how interactive UI snippet should be structured and delivered from a server/tool to a client.

### `UiSnippetResource` Structure

```typescript
interface UiSnippetResource {
  type: 'resource';
  resource: {
    uri: string;       // ui://component/id
    mimeType: 'text/html' | 'text/uri-list' | 'application/vnd.mcp-ui.remote-dom'; // text/html for HTML content, text/uri-list for URL content, application/vnd.mcp-ui.remote-dom for remote-dom content (Javascript)
    text?: string;      // Inline HTML or external URL
    blob?: string;      // Base64-encoded HTML or URL
  };
}
```

### Key Field Details:

- **`uri` (Uniform Resource Identifier)**:
  - All UI resources use the `ui://` scheme (e.g., `ui://my-custom-form/instance-01`)
  - The rendering method is determined by the `mimeType`:
    - `mimeType: 'text/html'` → HTML content rendered via `<iframe srcdoc>`
    - `mimeType: 'text/uri-list'` → URL content rendered via `<iframe src>`
- **`mimeType`**: `'text/html'` for HTML content, `'text/uri-list'` for URL content
- **`text` or `blob`**: The actual content (HTML string or URL string), either as plain text or Base64 encoded

## How It Works

1. **Server Side**: Use `@mcp-ui/server` to create `HtmlResource` objects
2. **Client Side**: Use `@mcp-ui/client` to render these resources in your React app

### Example Flow

**Server (MCP Tool):**
```typescript
import { createUiSnippetResource } from '@mcp-ui/server';

const resource = createUiSnippetResource({
  uri: 'ui://my-tool/dashboard',
  content: { type: 'rawHtml', htmlString: '<h1>Dashboard</h1>' },
  delivery: 'text'
});

// Return in MCP response
return { content: [resource] };
```

**Client (React App):**
```tsx
import { ResourceRenderer } from '@mcp-ui/client';

function App({ mcpResponse }) {
  return (
    <div>
      {mcpResponse.content.map((item) => (
        <ResourceRenderer
          key={item.resource.uri}
          resource={item.resource}
          onUiAction={(result) => {
            console.log('Action:', result);
            return { status: 'handled' };
          }}
        />
      ))}
    </div>
  );
}
```

## Key Benefits

- **Standardized**: Consistent interface for UI resources across MCP applications
- **Secure**: Sandboxed iframe execution prevents malicious code from affecting the host
- **Interactive**: Two-way communication between resources and host application
- **Flexible**: Supports both direct HTML content and external applications
- **Future-proof**: Extensible design supports new resource types as they're added

## Next Steps

- [Getting Started](./getting-started.md) - Set up your development environment
- [Server SDK](./server/overview.md) - Learn to create resources
- [Client SDK](./client/overview.md) - Learn to render resources
- [Protocol Details](./protocol-details.md) - Understand the underlying protocol

## Philosophy

Returning snippets of UI as responses from MCP servers is a powerful way to create interactive experiences. However, it can be difficult to get right.
This is an ongoing discussion in the MCP community and the [UI Community Working Group](https://github.com/modelcontextprotocol-community/working-groups/issues/35).
This project is an experimental playground for MCP-UI ideas, as explore ways to make it easier.