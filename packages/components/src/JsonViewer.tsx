import React from 'react';

/**
 * Props for the `JsonViewer` component.
 */
export interface JsonViewerProps {
  /** The JSON data to display. Can be any JavaScript value that is serializable by `JSON.stringify`. */
  data: any;
  /**
   * @experimental
   * If true, the JSON viewer might offer interactive features like collapsible nodes.
   * (Currently not implemented).
   */
  interactive?: boolean;
}

/**
 * A React functional component that displays JSON data in a formatted and readable way
 * within a `<pre>` tag. It handles basic styling for presentation.
 *
 * @remarks
 * Future enhancements could include:
 * - Interactive features (collapsible nodes, search).
 * - Syntax highlighting.
 * - Different themes.
 *
 * @param props - The properties for the JsonViewer component.
 * @returns A JSX element representing the formatted JSON data or an error message if serialization fails.
 */
export const JsonViewer: React.FC<JsonViewerProps> = ({ data /*, interactive */ }) => {
  let jsonDataString: string;
  try {
    jsonDataString = JSON.stringify(data, null, 2); // Pretty print with 2-space indentation
  } catch (error) {
    jsonDataString = "Error: Invalid JSON data provided.";
    console.error("JsonViewer: Error stringifying JSON data", error);
  }

  return (
    <pre style={{
      backgroundColor: '#f5f5f5', // Light gray background
      padding: '10px',           // Padding around the content
      border: '1px solid #ccc',  // Border
      borderRadius: '4px',       // Rounded corners
      whiteSpace: 'pre-wrap',    // Preserve whitespace and wrap lines
      wordBreak: 'break-all',    // Break long words/strings to prevent overflow
      maxHeight: '400px',        // Optional: Set a max height for scrollability
      overflowY: 'auto'          // Add vertical scrollbar if content exceeds maxHeight
    }}>
      {jsonDataString}
    </pre>
  );
};
