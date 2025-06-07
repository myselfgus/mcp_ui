# @mcp-ui/schemas

This package defines the core data structures and schemas used for dynamic UI generation and tool interaction within the MCP-UI framework.

## Key Exports:

- `MCPToolSchema`: Defines the structure for describing an MCP tool, its parameters (using JSON Schema), UI rendering hints (`UISchema`), and its expected response schema.
- `UISchema`: Provides hints for rendering a corresponding JSON Schema, such as widget types, layout preferences, and custom component identifiers.

These schemas are typically defined by the MCP server/tool and consumed by the `@mcp-ui/client` and `@mcp-ui/generators` packages.
