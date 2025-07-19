# @mcp-ui/server Overview

The `@mcp-ui/server` package provides utilities to generate UI resources (`UIResource`) on your MCP server. It allows you to define UI snippets on the server-side, which can then be seamlessly and securely rendered on the client.

For a complete example, see the [`typescript-server-demo`](https://github.com/idosal/mcp-ui/tree/docs/ts-example/examples/typescript-server-demo).

## Key Exports

- **`createUIResource(options: CreateUIResourceOptions): UIResource`**:
  The primary function for creating UI snippets. It takes an options object to define the URI, content (direct HTML or external URL), and encoding method (text or blob).

## Purpose

- **Ease of Use**: Simplifies the creation of valid `UIResource` objects.
- **Validation**: Includes basic validation (e.g., URI prefixes matching content type).
- **Encoding**: Handles Base64 encoding when `encoding: 'blob'` is specified.

## Building

This package is built using Vite in library mode, targeting Node.js environments. It outputs ESM (`.mjs`) and CJS (`.js`) formats, along with TypeScript declaration files (`.d.ts`).

To build specifically this package from the monorepo root:

```bash
pnpm build --filter @mcp-ui/server
```

See the [Server SDK Usage & Examples](./usage-examples.md) page for practical examples.
