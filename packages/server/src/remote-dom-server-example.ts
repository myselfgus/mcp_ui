import { Server } from '@modelcontextprotocol/sdk/server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';
import {
  ReadResourceRequestSchema,
  ListResourcesRequestSchema,
  type ReadResourceRequest,
} from '@modelcontextprotocol/sdk/types';

// The UI script that will be sent to the client.
const remoteDomScript = `
  // 'api' is provided by the host environment (our RemoteDomResource component)
  const { log } = api;

  // Polyfilled by the host iframe
  const { createRemoteRoot } = RemoteDom;

  const connection = {
    mutate(mutations) {
      window.parent.postMessage({ type: 'mutate', payload: mutations }, '*');
    }
  };

  const root = createRemoteRoot(connection);

  const stack = root.createElement('ui-stack');

  const text = root.createElement('ui-text');
  text.properties.content = 'Hello from a remote-dom server!';

  const button = root.createElement('ui-button');
  button.properties.label = 'Click Me';
  button.addEventListener('press', () => {
    log('Button was clicked!');
    text.properties.content = 'You clicked the button!';
  });

  stack.appendChild(text);
  stack.appendChild(button);
  root.appendChild(stack);

  root.mount();
`;

const server = new Server(
  {
    name: 'remote-dom-mcp-server',
    version: '1.0.0',
    displayName: 'Remote DOM Example Server',
  },
  {
    capabilities: {
      resources: {
        // No special capabilities needed for this simple case
      },
    },
  },
);

const remoteDomResource = {
  uri: 'mcp://remote-dom-example',
  name: 'Remote DOM Example',
  description: 'An example of a remote-dom resource',
  contentType: 'remoteDom',
  content: remoteDomScript,
};

// Handle requests to list available resources
server.setRequestHandler(ListResourcesRequestSchema, () => ({
  resources: [
    {
      uri: remoteDomResource.uri,
      name: remoteDomResource.name,
      description: remoteDomResource.description,
    },
  ],
}));

// Handle requests to read a specific resource
server.setRequestHandler(
  ReadResourceRequestSchema,
  (request: ReadResourceRequest) => {
    if (request.params.uri === remoteDomResource.uri) {
      return {
        resource: {
          uri: remoteDomResource.uri,
          contentType: remoteDomResource.contentType,
          content: remoteDomResource.content,
        },
      };
    }
    throw new Error('Resource not found');
  },
);

// Start the server with STDIO transport
const transport = new StdioServerTransport();
server.addTransport(transport);

console.log('Remote DOM MCP Server started.'); 