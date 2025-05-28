import React from 'react';
import ProjectAnalysisView from './ui-components/ProjectAnalysisView';
import './index.css'; // Assuming you have a global CSS file for Tailwind

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-semibold">MCP Desktop Platform</h1>
      </header>
      <main className="p-4">
        <ProjectAnalysisView />
      </main>
      <footer className="text-center p-4 text-sm text-gray-600">
        © 2023 MCP Project
      </footer>
    </div>
  );
}

export default App;
