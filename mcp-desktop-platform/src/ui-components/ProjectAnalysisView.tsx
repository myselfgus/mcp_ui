import React, { useEffect, useState } from 'react';
import { FileTree } from './FileTree'; // Assuming FileTree is in the same directory or exported via an index
import { DirectoryEntry } from '../mcp-bridge/fs/types'; // Adjusted import path for DirectoryEntry
import { Orchestrator } from '../orchestrator'; // Import Orchestrator

const ProjectAnalysisView: React.FC = () => {
  const [fileStructure, setFileStructure] = useState<DirectoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStructure = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const orchestrator = new Orchestrator();
        // projectPath is illustrative; MockFileSystemMCP ignores it for now
        const structure = await orchestrator.handleRequest("analyze_project_structure", "mock_project_path");
        setFileStructure(structure as DirectoryEntry[]); // Cast if necessary, ensure type safety
      } catch (err) {
        console.error('Error fetching file structure via orchestrator:', err);
        setError('Failed to load project structure.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStructure();
  }, []);

  if (isLoading) {
    return <div className="p-4 text-center">Loading project structure...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (fileStructure.length === 0) {
    return <div className="p-4 text-center">No files or directories found.</div>;
  }

  // Calculate metrics
  let totalFiles = 0;
  let totalFolders = 0;
  const fileExtensionsCount: Record<string, number> = {};

  const countEntries = (entries: DirectoryEntry[]) => {
    entries.forEach(entry => {
      if (entry.type === 'file') {
        totalFiles++;
        const extension = entry.name.split('.').pop();
        if (extension) {
          fileExtensionsCount[extension] = (fileExtensionsCount[extension] || 0) + 1;
        }
      } else if (entry.type === 'directory') {
        totalFolders++;
        if (entry.children) {
          countEntries(entry.children);
        }
      }
    });
  };

  countEntries(fileStructure);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">Project Analysis</h1>

      <div className="mb-8 p-6 border rounded-lg bg-white shadow-lg">
        <h2 className="text-xl font-semibold mb-3 text-gray-600">Project Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <p><span className="font-medium">Total Files:</span> {totalFiles}</p>
          <p><span className="font-medium">Total Folders:</span> {totalFolders}</p>
          <div>
            <h3 className="font-medium mb-1">Files by Extension:</h3>
            {Object.keys(fileExtensionsCount).length > 0 ? (
              <ul className="list-disc list-inside ml-4">
                {Object.entries(fileExtensionsCount).map(([ext, count]) => (
                  <li key={ext}>{`${ext.toUpperCase()}: ${count}`}</li>
                ))}
              </ul>
            ) : (
              <p>No files with extensions found.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-8 p-6 border rounded-lg bg-white shadow-lg">
        <h2 className="text-xl font-semibold mb-3 text-gray-600">Identified Technologies</h2>
        <div className="text-sm text-gray-500 italic">
          Technology analysis pending... (Examples: React, TypeScript, Tailwind CSS)
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-white shadow-lg">
        <h2 className="text-xl font-semibold mb-3 text-gray-600">File Structure</h2>
        <FileTree entries={fileStructure} />
      </div>
    </div>
  );
};

export default ProjectAnalysisView;
