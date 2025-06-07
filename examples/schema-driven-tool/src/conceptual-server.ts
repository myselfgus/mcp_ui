import { createHtmlResource } from '@mcp-ui/server';
import { MCPToolSchema, UISchema } from '@mcp-ui/schemas'; // Assuming linked
import { HtmlResource } from '@mcp-ui/shared';

// 1. Define the schema for a tool
const userInfoToolSchema: MCPToolSchema = {
  tool: 'get_user_info',
  description: 'Fetches information about a user by their ID.',
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'The ID of the user.' },
      includeDetails: { type: 'boolean', description: 'Include extra details.' },
      age: {type: 'number', description: 'Age of user'}
    },
    required: ['userId'],
  },
  uiSchema: {
    properties: { // Example of providing UI hints via a nested properties field
      userId: { widget: 'text', label: 'User Identification' },
      includeDetails: { label: 'Include Detailed Information?' },
      age: {label: 'Age'}
    }
  } as UISchema, // Cast needed if uiSchema is more flexible internally
  responseSchema: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      email: { type: 'string' },
      details: { type: 'object', properties: { bio: { type: 'string' } } }
    }
  }
};

// 2. Create the HTML resource with the schema
// No actual HTML content needed if the client solely relies on the schema for this tool
const resourceWithSchema = createHtmlResource({
  uri: 'tool://get-user-info', // A conceptual URI for the tool
  content: { type: 'rawHtml', htmlString: '<p>Loading User Info Tool...</p>' }, // Minimal HTML
  delivery: 'text',
  mcpToolSchema: userInfoToolSchema,
});

// This function would be called by an MCP server framework
function handleToolRequest(): HtmlResource {
  // In a real server, you might select a tool schema dynamically
  console.log("Server: Sending tool schema for get_user_info");
  return resourceWithSchema;
}

// To make it runnable in principle if imports worked:
// console.log(JSON.stringify(handleToolRequest(), null, 2));
