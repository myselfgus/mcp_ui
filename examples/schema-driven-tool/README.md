# Schema-Driven Tool Example

This example demonstrates the conceptual flow of using `MCPToolSchema` to dynamically generate a UI for an MCP tool and display its response using components from `@mcp-ui`.

- `src/conceptual-server.ts`: Shows how a server might define an `MCPToolSchema` and package it with `createHtmlResource`.
- `src/conceptual-client-app.tsx`: Shows how the `@mcp-ui/client`'s `HtmlResource` component would render this schema-defined UI, and how `@mcp-ui/components` like `JsonViewer` and `DataTable` can display (mocked) tool responses.

**Note:** This example is for illustrative purposes of the code structure. Due to ongoing `pnpm` environment issues in the execution environment, this example cannot be built, run, or have its dependencies installed at this time.
