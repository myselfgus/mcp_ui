import React, { useState } from 'react';
import { DirectoryEntry } from '../../mcp-bridge/fs/types'; // Adjusted import path

interface FileTreeProps {
  entries: DirectoryEntry[];
  level?: number; // Optional: for indentation
  path?: string; // Optional: for unique key generation
}

const FileTree: React.FC<FileTreeProps> = ({ entries, level = 0, path = '' }) => {
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});

  const toggleEntry = (entryPath: string) => {
    setExpandedEntries(prev => ({ ...prev, [entryPath]: !prev[entryPath] }));
  };

  return (
    <ul className="list-none p-0 m-0">
      {entries.map(entry => {
        const entryPath = `${path}/${entry.name}`; // Create a unique path for each entry
        return (
          <li key={entryPath} className={`my-0.5 ml-${level * 4}`}>
            <div 
              className="flex items-center cursor-pointer hover:bg-gray-100 p-0.5 rounded" 
              onClick={() => entry.type === 'directory' && entry.children && toggleEntry(entryPath)}
            >
              <span className="mr-2 text-xs w-5 text-center">
                {entry.type === 'directory' ? (
                  entry.children && expandedEntries[entryPath] ? '▼' : '►' // Using different icons
                ) : (
                  '•' // Simple dot for files
                )}
              </span>
              <span className="text-sm">{entry.name}</span>
            </div>
            {entry.type === 'directory' && entry.children && expandedEntries[entryPath] && (
              <FileTree entries={entry.children} level={level + 1} path={entryPath} />
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default FileTree;
      ))}
    </ul>
  );
};

export default FileTree;
