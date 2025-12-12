import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Analyzer from './components/Analyzer';
import ManifestBuilder from './components/ManifestBuilder';
import DownloadCenter from './components/DownloadCenter';
import Settings from './components/Settings';
import { AppView, NexusManifest } from './types';
import { EMPTY_MANIFEST } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [manifest, setManifest] = useState<NexusManifest>(EMPTY_MANIFEST);
  
  // State for manifests that have been "deployed" to production
  const [publishedManifests, setPublishedManifests] = useState<NexusManifest[]>([
      {
          namespace: "billing-service",
          source: "github.com/nexus/billing",
          generated_at: new Date(Date.now() - 86400000).toISOString(),
          language: "python",
          commands: [
              {
                  name: "invoice-generate",
                  id: "billing-service:invoice-generate",
                  description: "Generates a PDF invoice",
                  source_file: "src/invoicing.py",
                  language: "python",
                  entrypoint: "src.invoicing:generate",
                  runtime: "python:3.9-slim",
                  arguments: [],
                  returns: "file",
                  async: false,
                  confidence: 1.0,
                  examples: []
              }
          ],
          warnings: []
      }
  ]);

  const handleAnalysisComplete = (newManifest: NexusManifest) => {
    setManifest(newManifest);
    setCurrentView(AppView.BUILDER);
  };

  const handleManifestSave = (updatedManifest: NexusManifest) => {
    // Upsert the manifest into the published list
    setPublishedManifests(prev => {
        const index = prev.findIndex(m => m.namespace === updatedManifest.namespace);
        if (index >= 0) {
            const newList = [...prev];
            newList[index] = { ...updatedManifest, generated_at: new Date().toISOString() };
            return newList;
        }
        return [...prev, { ...updatedManifest, generated_at: new Date().toISOString() }];
    });

    setManifest(updatedManifest);
    setCurrentView(AppView.DASHBOARD);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard manifests={publishedManifests} />;
      case AppView.ANALYZER:
        return <Analyzer onAnalysisComplete={handleAnalysisComplete} />;
      case AppView.BUILDER:
        return (
          <ManifestBuilder 
            initialManifest={manifest} 
            onSave={handleManifestSave}
            onCancel={() => setCurrentView(AppView.DASHBOARD)}
          />
        );
      case AppView.DOWNLOAD:
        return <DownloadCenter publishedManifests={publishedManifests} />;
      case AppView.SETTINGS:
        return <Settings />;
      default:
        return <Dashboard manifests={publishedManifests} />;
    }
  };

  return (
    <div className="min-h-screen bg-nexus-dark text-nexus-text font-sans selection:bg-nexus-primary/30">
      <Navbar currentView={currentView} onChangeView={setCurrentView} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)]">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;