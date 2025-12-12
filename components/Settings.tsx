import React, { useState } from 'react';
import Button from './Button';
import { ICONS } from '../constants';

const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState("nxs_live_8f92k39d8s772k1jd02");
  const [showKey, setShowKey] = useState(false);
  
  // Language Runtimes
  const [pythonRuntime, setPythonRuntime] = useState("python:3.11-slim");
  const [nodeRuntime, setNodeRuntime] = useState("node:20-alpine");
  const [goRuntime, setGoRuntime] = useState("golang:1.21-alpine");
  const [rustRuntime, setRustRuntime] = useState("rust:1.75-slim");

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-3 bg-nexus-surface rounded-xl text-nexus-primary">
          {ICONS.Cpu}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-nexus-muted">Manage your Nexus CLI configuration and API keys.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Profile Section */}
        <div className="bg-nexus-panel border border-slate-700 rounded-lg p-6">
           <h2 className="text-lg font-semibold text-white mb-4 border-b border-slate-700 pb-2">Profile</h2>
           <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-nexus-primary to-nexus-secondary flex items-center justify-center text-2xl font-bold text-white">
                 A
              </div>
              <div>
                 <p className="text-white font-medium">Architect User</p>
                 <p className="text-nexus-muted text-sm">architect@nexus.dev</p>
                 <div className="mt-2 flex gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-nexus-primary/20 text-nexus-primary uppercase">Pro Plan</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-nexus-secondary/20 text-nexus-secondary uppercase">Admin</span>
                 </div>
              </div>
           </div>
        </div>

        {/* API Keys Section */}
        <div className="bg-nexus-panel border border-slate-700 rounded-lg p-6">
           <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
              <h2 className="text-lg font-semibold text-white">API Keys</h2>
              <Button variant="ghost" className="text-xs">Revoke All</Button>
           </div>
           
           <div className="space-y-4">
              <p className="text-sm text-nexus-muted">
                 These keys allow the Nexus CLI to authenticate with your account. Do not share them.
              </p>
              
              <div className="bg-slate-950 p-4 rounded-md border border-slate-800 flex items-center justify-between">
                 <div className="flex-1 mr-4">
                    <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Default Key</label>
                    <code className="text-nexus-primary font-mono text-sm block">
                       {showKey ? apiKey : "nxs_live_•••••••••••••••••••••••"}
                    </code>
                 </div>
                 <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setShowKey(!showKey)} className="text-xs py-1 h-8">
                       {showKey ? "Hide" : "Show"}
                    </Button>
                    <Button variant="primary" className="text-xs py-1 h-8">
                       Rotate
                    </Button>
                 </div>
              </div>

              <div className="bg-slate-900/50 p-3 rounded border border-slate-800/50">
                 <h4 className="text-sm font-medium text-white mb-2">Usage</h4>
                 <div className="w-full bg-slate-800 rounded-full h-2 mb-1">
                    <div className="bg-nexus-success h-2 rounded-full" style={{ width: '24%' }}></div>
                 </div>
                 <div className="flex justify-between text-xs text-slate-500">
                    <span>240 / 1000 daily requests</span>
                    <span>Resets in 4h</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Configuration */}
        <div className="bg-nexus-panel border border-slate-700 rounded-lg p-6">
           <h2 className="text-lg font-semibold text-white mb-4 border-b border-slate-700 pb-2">Default Runtimes</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Python */}
              <div>
                 <label className="block text-sm font-medium text-slate-400 mb-2">Python Runtime</label>
                 <select 
                    value={pythonRuntime}
                    onChange={(e) => setPythonRuntime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-nexus-primary outline-none"
                 >
                    <option value="python:3.11-slim">python:3.11-slim (Recommended)</option>
                    <option value="python:3.9-slim">python:3.9-slim</option>
                    <option value="python:3.12-rc">python:3.12-rc</option>
                 </select>
              </div>

              {/* Node.js */}
              <div>
                 <label className="block text-sm font-medium text-slate-400 mb-2">Node.js Runtime</label>
                 <select 
                    value={nodeRuntime}
                    onChange={(e) => setNodeRuntime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-nexus-primary outline-none"
                 >
                    <option value="node:20-alpine">node:20-alpine (Recommended)</option>
                    <option value="node:18-alpine">node:18-alpine</option>
                    <option value="node:21-slim">node:21-slim</option>
                 </select>
              </div>

              {/* Go */}
              <div>
                 <label className="block text-sm font-medium text-slate-400 mb-2">Go Runtime</label>
                 <select 
                    value={goRuntime}
                    onChange={(e) => setGoRuntime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-nexus-primary outline-none"
                 >
                    <option value="golang:1.21-alpine">golang:1.21-alpine (Recommended)</option>
                    <option value="golang:1.20-alpine">golang:1.20-alpine</option>
                    <option value="golang:latest">golang:latest</option>
                 </select>
              </div>

              {/* Rust */}
              <div>
                 <label className="block text-sm font-medium text-slate-400 mb-2">Rust Runtime</label>
                 <select 
                    value={rustRuntime}
                    onChange={(e) => setRustRuntime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-nexus-primary outline-none"
                 >
                    <option value="rust:1.75-slim">rust:1.75-slim (Recommended)</option>
                    <option value="rust:1.70-slim">rust:1.70-slim</option>
                    <option value="rust:latest">rust:latest</option>
                 </select>
              </div>
           </div>
           
           <div className="mt-6 border-t border-slate-700 pt-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">Manifest Sync Policy</label>
              <select className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-nexus-primary outline-none mb-4">
                 <option>Auto-sync on run</option>
                 <option>Manual sync only</option>
                 <option>Prompt before update</option>
              </select>

              <label className="flex items-center gap-3 p-3 bg-slate-900/50 rounded border border-slate-800 cursor-pointer hover:bg-slate-900 transition-colors">
                 <input type="checkbox" defaultChecked className="w-4 h-4 accent-nexus-primary rounded" />
                 <div>
                    <span className="block text-sm font-medium text-white">Enable Bridge Caching</span>
                    <span className="block text-xs text-slate-500">Locally cache generated bridge scripts to speed up execution.</span>
                 </div>
              </label>
           </div>
        </div>

        {/* Danger Zone */}
        <div className="border border-red-900/30 bg-red-950/10 rounded-lg p-6">
           <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
           <div className="flex justify-between items-center">
              <p className="text-sm text-red-200/60">
                 Permanently delete this organization and all associated manifests.
              </p>
              <Button variant="danger">Delete Organization</Button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;