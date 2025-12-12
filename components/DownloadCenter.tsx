import React from 'react';
import WebTerminal from './WebTerminal';
import { NexusManifest } from '../types';

interface DownloadCenterProps {
  publishedManifests: NexusManifest[];
}

const DownloadCenter: React.FC<DownloadCenterProps> = ({ publishedManifests }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-12">
        <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-white">Install Nexus CLI</h2>
            <p className="text-nexus-muted text-lg max-w-2xl mx-auto">
                The bridge between your code and ephemeral containers. Install locally or test drive it right here in the simulator.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Installation */}
            <div className="space-y-6">
                <div className="bg-nexus-panel border border-slate-700 rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white">One-line Installer</h3>
                        <span className="text-xs font-mono bg-slate-800 text-indigo-400 px-2 py-1 rounded">v1.0.4</span>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-md border border-slate-800 group relative">
                        <code className="text-green-400 font-mono text-sm break-all">
                            curl -sL https://get.nexus.dev/install.sh | sh
                        </code>
                    </div>
                    <p className="text-sm text-slate-400">
                        Supported on macOS, Linux, and Windows (WSL2).
                    </p>
                </div>

                <div className="bg-nexus-panel border border-slate-700 rounded-lg p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white">Setup & Auth</h3>
                    <p className="text-sm text-nexus-muted">
                        After installing, authenticate with your personal key found in Settings.
                    </p>
                    <div className="space-y-2">
                        <div className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between">
                            <code className="text-slate-300 font-mono text-xs">nexus login nxs_live_...</code>
                            <span className="text-xs text-slate-500"># Auth</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between">
                             <code className="text-slate-300 font-mono text-xs">nexus sync</code>
                             <span className="text-xs text-slate-500"># Fetch manifests</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Simulator */}
            <div className="flex flex-col space-y-4">
                 <div className="flex justify-between items-end">
                    <h3 className="text-xl font-bold text-white">CLI Simulator</h3>
                    <div className="flex gap-2">
                         <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded">Interactive Demo</span>
                    </div>
                 </div>
                 <WebTerminal availableManifests={publishedManifests} />
                 <p className="text-xs text-center text-slate-500">
                    This terminal mimics the local execution environment of the Nexus CLI.
                 </p>
            </div>
        </div>
    </div>
  );
};

export default DownloadCenter;