export interface DirectoryEntry {
  name: string;
  type: 'file' | 'directory';
  children?: DirectoryEntry[];
}

export interface FileSystemMCP {
  getDirectoryStructure(path: string): Promise<DirectoryEntry[]>;
}
