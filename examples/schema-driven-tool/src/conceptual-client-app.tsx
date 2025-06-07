import React from 'react';
import { HtmlResource as ClientHtmlResource } from '@mcp-ui/client'; // The React component
import { HtmlResource as SharedHtmlResource } from '@mcp-ui/shared'; // The data type
import { JsonViewer, DataTable } from '@mcp-ui/components';
import { MCPToolSchema } from '@mcp-ui/schemas';

// Mocked data that the server would send (conceptual-server.ts output)
const mockResourceFromServer: SharedHtmlResource = {
  type: 'resource',
  resource: {
    uri: 'tool://get-user-info',
    mimeType: 'text/html',
    text: '<p>Loading User Info Tool...</p>', // Fallback HTML
    mcpToolSchema: { // Inline schema for example clarity
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
        properties: {
          userId: { widget: 'text', label: 'User Identification' },
          includeDetails: { label: 'Include Detailed Information?' },
          age: {label: 'Age'}
        }
      } as MCPToolSchema['uiSchema'],
      responseSchema: { /* ... as defined in server ... */ }
    }
  }
};

const mockToolResponse = {
  id: 'user123',
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  age: 30,
  details: {
    bio: 'Loves coding and hiking.'
  }
};

const mockToolResponseForTable = [
    { UserID: 'user123', Name: 'Jane Doe', Email: 'jane.doe@example.com', Age: 30, Bio: 'Loves coding' },
    { UserID: 'user456', Name: 'John Smith', Email: 'john.smith@example.com', Age: 45, Bio: 'Enjoys reading' },
];

const App = () => {
  // Simulate receiving the resource from an MCP host
  const receivedResource: SharedHtmlResource = mockResourceFromServer;

  // Simulate handling a tool submission and receiving a response
  const [toolResponse, setToolResponse] = React.useState<any>(null);

  const handleFormSubmit = (formData: Record<string, any>) => {
    console.log("Form submitted to tool (mock):", formData);
    // In a real app, this would trigger a call to the MCP agent/server
    // For this example, we'll just set a mock response.
    if(formData.userId === 'user123') {
        setToolResponse(mockToolResponse);
    } else {
        setToolResponse({error: "User not found"});
    }
  };

  // The HtmlResource component would internally call something like onUiAction
  // which would then call handleFormSubmit. This is simplified here.
  // For now, we directly render and then show a mock response area.

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <h1>MCP-UI Schema-Driven Tool Example</h1>

      <section style={{ marginBottom: '20px', padding: '10px', border: '1px solid #eee' }}>
        <h2>Tool UI (Rendered by HtmlResource):</h2>
        <ClientHtmlResource resource={receivedResource.resource} /* onUiAction could be linked to handleFormSubmit */ />
      </section>

      <button onClick={() => handleFormSubmit({userId: 'user123', includeDetails: true, age: 30})}>Simulate Submit for Jane</button>
      <button onClick={() => handleFormSubmit({userId: 'user454', includeDetails: false, age: 20})}>Simulate Submit for Other</button>


      {toolResponse && (
        <section style={{ marginTop: '20px', padding: '10px', border: '1px solid #eee' }}>
          <h2>Mock Tool Response:</h2>
          <h3>JSON Viewer:</h3>
          <JsonViewer data={toolResponse} />

          <h3>DataTable (if response is an array or adaptable):</h3>
          {/* DataTable expects an array of flat objects.
              This specific mockToolResponse isn't an array.
              Let's use a different one for DataTable.
          */}
          <DataTable data={mockToolResponseForTable} />
        </section>
      )}
    </div>
  );
};

export default App;
