import { DirectoryEntry, FileSystemMCP } from './types';

export class MockFileSystemMCP implements FileSystemMCP {
  async getDirectoryStructure(path: string): Promise<DirectoryEntry[]> {
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 300)); // Reduced delay

    // Hardcoded sample directory structure (Enhanced React project example)
    return [
      {
        name: 'public',
        type: 'directory',
        children: [
          { name: 'index.html', type: 'file' },
          { name: 'favicon.ico', type: 'file' },
          { name: 'logo192.png', type: 'file' },
          { name: 'manifest.json', type: 'file' },
        ],
      },
      {
        name: 'src',
        type: 'directory',
        children: [
          {
            name: 'assets',
            type: 'directory',
            children: [
              { name: 'main.css', type: 'file' },
              { name: 'logo.svg', type: 'file' },
            ]
          },
          {
            name: 'components',
            type: 'directory',
            children: [
              { name: 'Button.tsx', type: 'file' },
              { name: 'Modal.tsx', type: 'file' },
              { name: 'Navbar.tsx', type: 'file' },
              { name: 'Navbar.css', type: 'file' },
            ],
          },
          {
            name: 'hooks',
            type: 'directory',
            children: [
              { name: 'useLocalStorage.ts', type: 'file' },
            ],
          },
          {
            name: 'views',
            type: 'directory',
            children: [
              { name: 'HomePage.tsx', type: 'file' },
              { name: 'SettingsPage.tsx', type: 'file' },
            ],
          },
          { name: 'App.tsx', type: 'file' },
          { name: 'index.tsx', type: 'file' },
          { name: 'reportWebVitals.ts', type: 'file' },
          { name: 'setupTests.ts', type: 'file' },
          { name: 'serviceWorker.ts', type: 'file' },
          { name: 'react-app-env.d.ts', type: 'file' },
        ],
      },
      { name: '.gitignore', type: 'file' },
      { name: 'package.json', type: 'file' },
      { name: 'package-lock.json', type: 'file' },
      { name: 'tsconfig.json', type: 'file' },
      { name: 'README.md', type: 'file' },
    ];
  }
}
