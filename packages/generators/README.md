# @mcp-ui/generators

This package provides the engine for dynamically generating UI structures based on `MCPToolSchema` definitions.

## Key Exports:

- `generateUIFromSchema(toolSchema: MCPToolSchema): FormDefinition`: Takes a full `MCPToolSchema` and produces a `FormDefinition`.
- `FormDefinition`: An intermediate representation of a form, including its fields, labels, types, and validation rules, which can then be used by a rendering engine (like in `@mcp-ui/client`) to create actual UI components.
- `FormField`, `FormFieldOption`: Types describing individual fields and their options within a `FormDefinition`.
