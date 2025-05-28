import { FileStructureAgent } from '../agents/FileStructureAgent'; // Adjusted import path
import { DirectoryEntry } from '../mcp-bridge/fs/types'; // Adjusted import path

export class Orchestrator {
  async handleRequest(command: string, projectPath?: string): Promise<any> {
    console.log(`Orchestrator: Received command - ${command}`);

    if (command === 'analyze_project_structure') {
      const agent = new FileStructureAgent();
      const currentPath = projectPath || './'; // Default path
      console.log(`Orchestrator: Delegating to FileStructureAgent for path - ${currentPath}`);
      try {
        const structure: DirectoryEntry[] = await agent.analyzeProject(currentPath);
        return structure;
      } catch (error) {
        console.error('Orchestrator: Error during project structure analysis', error);
        throw new Error('Failed to analyze project structure.');
      }
    } else {
      console.warn(`Orchestrator: Unknown command - ${command}`);
      return Promise.reject('Unknown command');
    }
  }
}
