import React from 'react';
// import { JSONSchema } from '@mcp-ui/schemas'; // For later schema integration

/**
 * Props for the `DataTable` component.
 */
export interface DataTableProps {
  /**
   * An array of objects to display in the table. Each object represents a row,
   * and its properties represent the cells in that row.
   */
  data: Array<Record<string, any>>;
  /**
   * @experimental
   * Optional schema to define columns, their types, and formatting.
   * If not provided, columns and headers are inferred from the keys of the first data object.
   * (Currently not implemented).
   */
  // schema?: JSONSchema; // For future use to define columns, types, etc.
}

/**
 * A React functional component that renders an array of objects as an HTML table.
 * In its current version, it infers columns from the keys of the first data object
 * if no explicit schema is provided.
 *
 * @remarks
 * This is a basic implementation. Future enhancements could include:
 * - Column definition via schema.
 * - Sorting and filtering.
 * - Pagination.
 * - Customizable cell rendering.
 *
 * @param props - The properties for the DataTable component.
 * @returns A JSX element representing the rendered table or a message if no data is provided.
 */
export const DataTable: React.FC<DataTableProps> = ({ data /*, schema */ }) => {
  if (!data || data.length === 0) {
    return <p>No data to display.</p>;
  }

  // Infer columns from the first data item if no schema is provided
  const headers = Object.keys(data[0]);

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #ccc' }}>
      <thead>
        <tr>
          {headers.map(header => (
            <th key={header} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f2f2f2' }}>
              {/* Simple capitalization for header display */}
              {header.charAt(0).toUpperCase() + header.slice(1)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex} style={{ borderBottom: '1px solid #ddd' }}>
            {headers.map(header => (
              <td key={`${rowIndex}-${header}`} style={{ border: '1px solid #ddd', padding: '8px' }}>
                {/* Displaying objects as JSON string, other types as plain string */}
                {typeof row[header] === 'object' && row[header] !== null ? JSON.stringify(row[header]) : String(row[header])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
