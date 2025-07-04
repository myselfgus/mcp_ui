# @mcp-ui/client Overview

The `@mcp-ui/client` package helps you render UI resources sent from an MCP-enabled server. The primary component for this is `<ResourceRenderer />`, which automatically detects the resource type and renders the appropriate component for it.

## What's Included?

- **`<ResourceRenderer />`**: The main component you'll use. It inspects the resource's `mimeType` and renders either `<HtmlResource />` or `<RemoteDomResource />` internally.
- **`<HtmlResource />`**: Internal component for HTML/URL resources
- **`<RemoteDomResource />`**: Internal component for remote DOM resources

## Purpose
- **Standardized UI**: mcp-ui's client guarantees full compatibility with the latest MCP UI standards.
- **Simplified Rendering**: Abstract away the complexities of handling different resource types.
- **Security**: Renders user-provided HTML and scripts within sandboxed iframes.
- **Interactivity**: Provides a unified mechanism (`onUiAction` prop) for UI resources to communicate back to the host application.

## Building

This package uses Vite in library mode. It outputs ESM (`.mjs`) and UMD (`.js`) formats, plus TypeScript declarations (`.d.ts`). `react` is externalized.

To build just this package from the monorepo root:

```bash
pnpm build --filter @mcp-ui/client
```

See the following pages for more details:

- [ResourceRenderer Component](./resource-renderer.md) - **Main entry point**
- [HtmlResource Component](./html-resource.md)
- [RemoteDomResource Component](./remote-dom-resource.md)
- [Client SDK Usage & Examples](./usage-examples.md)
