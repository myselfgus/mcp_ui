# ResourceRenderer Component

The `<ResourceRenderer />` component is the **main entry point** for rendering MCP-UI resources in your React application. It automatically detects the resource type and renders the appropriate component internally.

## Why use `ResourceRenderer`?

- **Automatic Type Detection**: Inspects the resource's `mimeType` and `contentType` to determine the appropriate rendering method
- **Future-Proof**: Handles new resource types as they're added to the MCP-UI specification
- **Unified API**: Single component interface for all resource types
- **Security**: Maintains sandboxing and security features across all resource types

## Supported Resource Types

`ResourceRenderer` automatically handles:

- **HTML Resources** (`text/html`): Direct HTML content rendered in sandboxed iframes
- **External URLs** (`text/uri-list`): External applications and websites
- **Remote DOM Resources** (`application/vnd.mcp-ui.remote-dom`): Server-generated UI components using Shopify's remote-dom

## Props

```typescript
import type { Resource } from '@modelcontextprotocol/sdk/types';

interface ResourceRendererProps {
  resource: Partial<Resource>;
  onUiAction?: (result: UiActionResult) => Promise<unknown>;
  style?: React.CSSProperties;
  iframeProps?: Omit<React.HTMLAttributes<HTMLIFrameElement>, 'src' | 'srcDoc' | 'ref' | 'style'>;
  library?: ComponentLibrary;
  remoteElements?: RemoteElementConfiguration[];
  supportedContentTypes?: ResourceContentType[];
}
```

### Props Details

- **`resource`**: The resource object from an MCP response. Should include `uri`, `mimeType`, and content (`text`, `blob`, or `content`)
- **`onUiAction`**: Optional callback for handling UI actions from the resource:
  ```typescript
  { type: 'tool', payload: { toolName: string, params: Record<string, unknown> } } |
  { type: 'intent', payload: { intent: string, params: Record<string, unknown> } } |
  { type: 'prompt', payload: { prompt: string } } |
  { type: 'notification', payload: { message: string } } |
  { type: 'link', payload: { url: string } }
  ```
- **`supportedContentTypes`**: Optional array to restrict which content types are allowed (`['rawHtml', 'externalUrl', 'remoteDom']`)
- **`style`**: Optional custom styles for iframe-based resources
- **`iframeProps`**: Optional props passed to iframe elements (for HTML/URL resources)
- **`library`**: Optional component library for Remote DOM resources (defaults to `basicComponentLibrary`)
- **`remoteElements`**: Optional remote element definitions for Remote DOM resources. REQUIRED for Remote DOM snippets.

## Basic Usage

```tsx
import React from 'react';
import { ResourceRenderer, UiActionResult } from '@mcp-ui/client';

function App({ mcpResource }) {
  const handleUiAction = async (result: UiActionResult) => {
    switch (result.type) {
      case 'tool':
        console.log('Tool call:', result.payload.toolName, result.payload.params);
        // Handle tool execution
        break;
      case 'prompt':
        console.log('Prompt:', result.payload.prompt);
        // Handle prompt display
        break;
      case 'link':
        console.log('Link:', result.payload.url);
        // Handle link navigation
        break;
      case 'intent':
        console.log('Intent:', result.payload.intent, result.payload.params);
        // Handle intent processing
        break;
      case 'notification':
        console.log('Notification:', result.payload.message);
        // Handle notification display
        break;
    }
    return { status: 'handled' };
  };

  if (
    mcpResource.type === 'resource' &&
    mcpResource.resource.uri?.startsWith('ui://')
  ) {
    return (
      <ResourceRenderer
        resource={mcpResource.resource}
        onUiAction={handleUiAction}
      />
    );
  }
  
  return <p>Unsupported resource</p>;
}
```

## Advanced Usage

### Content Type Restrictions

```tsx
// Only allow HTML resources (block external URLs and Remote DOM)
<ResourceRenderer
  resource={mcpResource.resource}
  supportedContentTypes={['rawHtml']}
  onUiAction={handleUiAction}
/>
```

### Custom Component Library (for Remote DOM)

```tsx
import { ComponentLibrary } from '@mcp-ui/client';
import { MyButton, MyCard } from './MyComponents';

const customLibrary: ComponentLibrary = {
  name: 'custom',
  elements: [
    { tagName: 'my-button', component: MyButton },
    { tagName: 'my-card', component: MyCard },
  ],
};

<ResourceRenderer
  resource={mcpResource.resource}
  library={customLibrary}
  onUiAction={handleUiAction}
/>
```

### Custom Styling

```tsx
<ResourceRenderer
  resource={mcpResource.resource}
  style={{ 
    border: '2px solid #007acc',
    borderRadius: '8px',
    minHeight: '400px'
  }}
  iframeProps={{
    title: 'Custom MCP Resource',
    className: 'mcp-resource-frame'
  }}
  onUiAction={handleUiAction}
/>
```

## Resource Type Detection

`ResourceRenderer` determines the resource type using this logic:

1. **Explicit `contentType`**: If `resource.contentType` is set, use it directly
2. **MIME Type Detection**:
   - `text/html` → `rawHtml`
   - `text/uri-list` → `externalUrl`
   - `application/vnd.mcp-ui.remote-dom+javascript` → `remoteDom`
3. **Fallback**: Show unsupported resource error

## Error Handling

```tsx
function App({ mcpResource }) {
  if (
    mcpResource.type === 'resource' &&
    mcpResource.resource.uri?.startsWith('ui://')
  ) {
    return (
      <div>
        <h3>MCP Resource: {mcpResource.resource.uri}</h3>
        <ResourceRenderer
          resource={mcpResource.resource}
          onUiAction={handleUiAction}
          supportedContentTypes={['rawHtml', 'externalUrl']} // Restrict types
        />
      </div>
    );
  }
  
  return <p>This resource is not a UI resource</p>;
}
```

When unsupported content types are encountered, `ResourceRenderer` will display appropriate error messages:
- `"Unsupported content type: {type}."`
- `"Unsupported resource type."`

## Security Considerations

- **Sandboxing**: HTML and URL resources are rendered in sandboxed iframes
- **Content Restrictions**: Use `supportedContentTypes` to limit allowed resource types
- **Origin Validation**: Always validate `postMessage` origins in production
- **Content Sanitization**: Consider sanitizing HTML content for untrusted sources

## Examples

See [Client SDK Usage & Examples](./usage-examples.md) for complete working examples.
