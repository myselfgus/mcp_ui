# TypeScript Server Walkthrough

This guide provides a step-by-step walkthrough for integrating `@mcp-ui/server` into a an existing Node.js server using the [Express.js](https://expressjs.com) framework.

For a complete, runnable example, see the [`typescript-server-demo`](https://github.com/idosal/mcp-ui/tree/main/examples/typescript-server-demo).

## 1. Set up an Express Server

If you don't have an existing server, you can create a simple one.

First, install the necessary dependencies:

```bash
npm install express cors @types/express @types/cors
```

Then, create a basic server file (e.g., `server.ts`):

```typescript
import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
```

## 2. Install MCP and mcp-ui Dependencies

Next, add the Model Context Protocol SDK and the `mcp-ui` server package to your project:

```bash
npm install @modelcontextprotocol/sdk @mcp-ui/server
```

The `@modelcontextprotocol/sdk` package provides the core functionality for creating an MCP server, while `@mcp-ui/server` includes helpers specifically for creating UI resources.

## 3. Create an MCP Tool

In MCP, tools are functions that the client can invoke. For this example, we'll create a tool that returns a `UIResource`.

Create a new file, `tools.ts`, and add the following code:

```typescript
import { Tool, ToolResponse } from '@modelcontextprotocol/sdk';
import { createUIResource } from '@mcp-ui/server';

export class GreetTool extends Tool {
  constructor() {
    super({
      name: 'greet',
      description: 'A simple tool that returns a UI resource',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    });
  }

  async call(serverContext: any): Promise<ToolResponse> {
    const uiResource = createUIResource({
      uri: 'ui://greeting',
      content: {
        type: 'externalUrl',
        iframeUrl: 'https://example.com',
      },
      encoding: 'text',
    });

    return new ToolResponse([uiResource]);
  }
}
```

This tool, when called, will generate a simple HTML UI resource. The `import { createUIResource } from '@mcp-ui/server'` line imports the `mcp-ui` helper. The `GreetTool` is a standard MCP `Tool`, but it uses `createUIResource` to generate a `UIResource`, which is the primary integration point with `mcp-ui`. The following section describes how to set up a standard MCP server and expose it over HTTP.

## 4. Set up the MCP Server Handler

Now, let's create an MCP server instance and an endpoint to handle MCP requests.

Modify your `server.ts` file to include the following:

```typescript
import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk';
import { GreetTool } from './tools';

const app = express();
const port = 3000;

// Set up the MCP server with your tool
const mcpServer = new Server({
  tools: [new GreetTool()],
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Add the /mcp endpoint
app.post('/mcp', async (req, res) => {
  const response = await mcpServer.handle(req.body);
  res.json(response);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  console.log(`MCP endpoint available at http://localhost:${port}/mcp`);
});
```

## 5. Run and Test

You can now run your server:

```bash
npx ts-node server.ts
```

To test your new endpoint, you can use the [`ui-inspector`](https://github.com/idosal/ui-inspector):

1. Go to the **[ui-inspector website](https://idosal.github.io/ui-inspector/)**.
2. Enter your server's MCP endpoint URL: `http://localhost:3000/mcp`.
3. Click "Connect".

The inspector will show the `greet` tool. When you call it, the UI resource will be rendered in the inspector's "UI" tab.

You've now successfully integrated `mcp-ui` into your TypeScript server! You can now create more complex tools that return different types of UI resources. 