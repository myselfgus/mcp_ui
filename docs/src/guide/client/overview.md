# @mcp-ui/client Overview

The `@mcp-ui/client` package helps you render UI resources sent from an MCP-enabled server. The primary component for this is `<ResourceRenderer />`, which automatically detects the resource type and renders the appropriate component for it.

## What’s Included?

- **`<ResourceRenderer />`**: The main component you'll use. It inspects the resource's `mimeType` and renders either `<HtmlResource />` or `<RemoteDomResource />`.
- **`<HtmlResource />`**: Renders traditional HTML content, either from a string or an external URL, inside a sandboxed `<iframe>`.
- **`<RemoteDomResource />`**: Renders a UI described by `remote-dom`, allowing for host-native components that match your application's look and feel.
- **Component Libraries**: A mapping of remote element names to your own React components, used by `<RemoteDomResource />`.

## Purpose

- **Simplified Rendering**: Abstract away the complexities of handling different resource types.
- **Security**: Encourages rendering user-provided HTML and scripts within sandboxed iframes and web workers.
- **Interactivity**: Provides a unified mechanism (`onUiAction` prop) for UI resources to communicate back to the host application.

## Building

This package uses Vite in library mode. It outputs ESM (`.mjs`) and UMD (`.js`) formats, plus TypeScript declarations (`.d.ts`). `react` is externalized.

To build just this package from the monorepo root:

```bash
pnpm build --filter @mcp-ui/client
```

See the following pages for more details:

- [HtmlResource Component](./html-resource.md)
- [RemoteDomResource Component](./remote-dom-resource.md)
- [Client SDK Usage & Examples](./usage-examples.md)
