import React, { useState, useMemo } from 'react';
import { NexusManifest, NexusCommand, NexusArgument } from '../types';
import Button from './Button';
import { ICONS } from '../constants';

interface ManifestBuilderProps {
  initialManifest: NexusManifest;
  onSave: (manifest: NexusManifest) => void;
  onCancel: () => void;
}

const ManifestBuilder: React.FC<ManifestBuilderProps> = ({ initialManifest, onSave, onCancel }) => {
  const [manifest, setManifest] = useState<NexusManifest>(initialManifest);
  const [selectedCmdId, setSelectedCmdId] = useState<string | null>(
    manifest.commands.length > 0 ? manifest.commands[0].id : null
  );

  const selectedCommand = manifest.commands.find(c => c.id === selectedCmdId);

  // Real-time validation logic
  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    manifest.commands.forEach(cmd => {
      // Command Name Validation
      if (!cmd.name.trim()) {
        errors[`cmd-${cmd.id}-name`] = "Command name is required";
      } else if (!/^[a-z0-9-]+$/.test(cmd.name)) {
        errors[`cmd-${cmd.id}-name`] = "Must be kebab-case (e.g. process-refund)";
      }

      // Runtime Validation
      if (!cmd.runtime.trim()) {
        errors[`cmd-${cmd.id}-runtime`] = "Runtime image is required";
      }

      // Arguments Validation
      cmd.arguments.forEach((arg, idx) => {
        // Flag Validation
        if (!arg.cli.trim()) {
          errors[`arg-${cmd.id}-${idx}-cli`] = "Flag is required";
        } else if (!/^-{1,2}[a-z0-9-]+$/.test(arg.cli)) {
          errors[`arg-${cmd.id}-${idx}-cli`] = "Must start with - or --";
        }

        // Argument Name Validation
        if (!arg.name.trim()) {
          errors[`arg-${cmd.id}-${idx}-name`] = "Name is required";
        } else if (!/^[a-zA-Z0-9_]+$/.test(arg.name)) {
          errors[`arg-${cmd.id}-${idx}-name`] = "Alphanumeric only";
        }
      });
    });
    return errors;
  }, [manifest]);

  const hasErrors = Object.keys(validationErrors).length > 0;
  
  // Helper to determine if a specific command has any errors (for sidebar indicator)
  const commandHasErrors = (cmdId: string) => {
    return Object.keys(validationErrors).some(k => k.startsWith(`cmd-${cmdId}`) || k.startsWith(`arg-${cmdId}`));
  };

  const updateCommand = (id: string, updates: Partial<NexusCommand>) => {
    setManifest(prev => ({
      ...prev,
      commands: prev.commands.map(cmd => cmd.id === id ? { ...cmd, ...updates } : cmd)
    }));
  };

  const updateArgument = (commandId: string, argIndex: number, updates: Partial<NexusArgument>) => {
    setManifest(prev => ({
      ...prev,
      commands: prev.commands.map(cmd => {
        if (cmd.id !== commandId) return cmd;
        const newArgs = [...cmd.arguments];
        newArgs[argIndex] = { ...newArgs[argIndex], ...updates };
        return { ...cmd, arguments: newArgs };
      })
    }));
  };

  const addArgument = (commandId: string) => {
    setManifest(prev => ({
      ...prev,
      commands: prev.commands.map(cmd => {
        if (cmd.id !== commandId) return cmd;
        return {
          ...cmd,
          arguments: [
            ...cmd.arguments,
            {
              name: 'new_arg',
              cli: '--new-arg',
              position: 'flag',
              type: 'string',
              required: false,
              description: '',
              confidence: 1.0
            }
          ]
        };
      })
    }));
  };

  const removeArgument = (commandId: string, argIndex: number) => {
    setManifest(prev => ({
      ...prev,
      commands: prev.commands.map(cmd => {
        if (cmd.id !== commandId) return cmd;
        const newArgs = [...cmd.arguments];
        newArgs.splice(argIndex, 1);
        return { ...cmd, arguments: newArgs };
      })
    }));
  };

  // Style helpers
  const getInputClasses = (errorKey: string) => `
    w-full bg-slate-900 border rounded px-3 py-2 text-sm text-white outline-none focus:ring-1 transition-colors
    ${validationErrors[errorKey] ? 'border-red-500 focus:ring-red-500 bg-red-900/10' : 'border-slate-700 focus:ring-indigo-500'}
  `;

  const getSmallInputClasses = (errorKey: string) => `
    w-full bg-slate-800 border rounded px-2 py-1 text-xs outline-none focus:ring-1 transition-colors
    ${validationErrors[errorKey] ? 'border-red-500 focus:ring-red-500 bg-red-900/10' : 'border-slate-700 focus:ring-indigo-500'}
  `;

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center bg-nexus-panel p-4 rounded-lg border border-slate-700">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {ICONS.Terminal} Manifest Builder
          </h2>
          <p className="text-sm text-nexus-muted">Namespace: <span className="font-mono text-indigo-400">{manifest.namespace}</span></p>
        </div>
        <div className="flex gap-2 items-center">
           {hasErrors && (
             <span className="text-xs text-red-400 font-medium mr-2 flex items-center animate-pulse">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
               </svg>
               Fix errors to deploy
             </span>
           )}
           <Button variant="ghost" onClick={onCancel}>Discard</Button>
           <Button 
                onClick={() => onSave(manifest)}
                disabled={hasErrors}
                className={`transition-colors ${hasErrors ? 'opacity-50 cursor-not-allowed bg-slate-600' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'}`}
            >
                Deploy to Production
            </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Sidebar: Command List */}
        <div className="w-1/3 bg-nexus-panel rounded-lg border border-slate-700 overflow-y-auto">
          <div className="p-3 border-b border-slate-700 font-semibold text-slate-300">
            Detected Commands
          </div>
          <ul>
            {manifest.commands.map(cmd => {
              const hasCmdErrors = commandHasErrors(cmd.id);
              return (
                <li 
                  key={cmd.id}
                  onClick={() => setSelectedCmdId(cmd.id)}
                  className={`p-3 border-b border-slate-800 cursor-pointer transition-colors relative ${
                    selectedCmdId === cmd.id 
                      ? 'bg-indigo-900/30 border-l-4 border-l-indigo-500' 
                      : 'hover:bg-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-mono text-sm font-bold ${hasCmdErrors ? 'text-red-400' : 'text-indigo-300'}`}>
                      {cmd.name || '<unnamed>'}
                    </span>
                    <div className="flex gap-2 items-center">
                       {hasCmdErrors && (
                         <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Contains errors"></span>
                       )}
                       <span className={`text-[10px] px-1.5 py-0.5 rounded ${cmd.confidence > 0.8 ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                         {Math.round(cmd.confidence * 100)}% Conf
                       </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{cmd.description}</p>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Main: Editor */}
        <div className="flex-1 bg-nexus-panel rounded-lg border border-slate-700 overflow-y-auto p-6">
          {selectedCommand ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs uppercase text-slate-500 font-bold mb-1">Command Name</label>
                   <input 
                      className={getInputClasses(`cmd-${selectedCommand.id}-name`)}
                      value={selectedCommand.name}
                      onChange={(e) => updateCommand(selectedCommand.id, { name: e.target.value })}
                   />
                   {validationErrors[`cmd-${selectedCommand.id}-name`] && (
                     <p className="text-[10px] text-red-400 mt-1">{validationErrors[`cmd-${selectedCommand.id}-name`]}</p>
                   )}
                </div>
                <div>
                   <label className="block text-xs uppercase text-slate-500 font-bold mb-1">Runtime</label>
                   <input 
                      className={getInputClasses(`cmd-${selectedCommand.id}-runtime`)}
                      value={selectedCommand.runtime}
                      onChange={(e) => updateCommand(selectedCommand.id, { runtime: e.target.value })}
                   />
                   {validationErrors[`cmd-${selectedCommand.id}-runtime`] && (
                     <p className="text-[10px] text-red-400 mt-1">{validationErrors[`cmd-${selectedCommand.id}-runtime`]}</p>
                   )}
                </div>
              </div>

              <div>
                 <label className="block text-xs uppercase text-slate-500 font-bold mb-1">Description</label>
                 <textarea 
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white h-20 resize-none focus:ring-1 focus:ring-indigo-500 outline-none"
                    value={selectedCommand.description}
                    onChange={(e) => updateCommand(selectedCommand.id, { description: e.target.value })}
                 />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
                    <h3 className="text-sm font-bold text-white">Arguments</h3>
                    <Button 
                        variant="secondary" 
                        onClick={() => addArgument(selectedCommand.id)}
                        className="text-xs px-2 py-1 h-7"
                    >
                        + Add Argument
                    </Button>
                </div>
                <div className="space-y-3">
                  {selectedCommand.arguments.map((arg, idx) => {
                    const cliErrorKey = `arg-${selectedCommand.id}-${idx}-cli`;
                    const nameErrorKey = `arg-${selectedCommand.id}-${idx}-name`;
                    return (
                      <div key={idx} className="bg-slate-900/50 p-4 rounded border border-slate-700 flex flex-col gap-3 relative group">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                               onClick={() => removeArgument(selectedCommand.id, idx)}
                               className="text-slate-500 hover:text-red-400 p-1"
                               title="Remove argument"
                            >
                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                               </svg>
                            </button>
                        </div>
                        <div className="grid grid-cols-12 gap-3 items-start">
                          {/* CLI Flag */}
                          <div className="col-span-3">
                            <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Flag</label>
                            <input
                              className={`${getSmallInputClasses(cliErrorKey)} ${!validationErrors[cliErrorKey] ? 'text-yellow-400 font-mono' : 'text-white'}`}
                              value={arg.cli}
                              onChange={(e) => updateArgument(selectedCommand.id, idx, { cli: e.target.value })}
                              placeholder="--flag"
                            />
                            {validationErrors[cliErrorKey] && (
                              <p className="text-[10px] text-red-400 mt-1">{validationErrors[cliErrorKey]}</p>
                            )}
                          </div>

                          {/* Name */}
                          <div className="col-span-3">
                            <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Name</label>
                            <input
                              className={getSmallInputClasses(nameErrorKey)}
                              value={arg.name}
                              onChange={(e) => updateArgument(selectedCommand.id, idx, { name: e.target.value })}
                              placeholder="arg_name"
                            />
                            {validationErrors[nameErrorKey] && (
                              <p className="text-[10px] text-red-400 mt-1">{validationErrors[nameErrorKey]}</p>
                            )}
                          </div>

                          {/* Type */}
                          <div className="col-span-3">
                            <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Type</label>
                            <select
                              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none"
                              value={arg.type}
                              onChange={(e) => updateArgument(selectedCommand.id, idx, { type: e.target.value })}
                            >
                              <option value="string">string</option>
                              <option value="integer">integer</option>
                              <option value="float">float</option>
                              <option value="boolean">boolean</option>
                              <option value="array">array</option>
                              <option value="file">file</option>
                            </select>
                          </div>

                           {/* Required */}
                          <div className="col-span-3 flex items-center h-full pt-5 justify-end">
                               <label className="flex items-center gap-2 cursor-pointer select-none">
                                  <span className={`text-xs font-medium ${arg.required ? 'text-red-400' : 'text-slate-500'}`}>
                                      {arg.required ? 'Required' : 'Optional'}
                                  </span>
                                  <input 
                                      type="checkbox" 
                                      checked={arg.required}
                                      onChange={(e) => updateArgument(selectedCommand.id, idx, { required: e.target.checked })}
                                      className="w-4 h-4 accent-indigo-500 cursor-pointer"
                                  />
                               </label>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="w-full">
                          <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Description</label>
                          <input
                             className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none"
                             value={arg.description}
                             onChange={(e) => updateArgument(selectedCommand.id, idx, { description: e.target.value })}
                             placeholder="Argument description"
                          />
                        </div>
                      </div>
                    );
                  })}
                  {selectedCommand.arguments.length === 0 && (
                      <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-slate-700 rounded">
                          No arguments detected.
                      </div>
                  )}
                </div>
              </div>

              <div>
                 <h3 className="text-sm font-bold text-white mb-2 border-b border-slate-700 pb-2">Generated Bridge Example</h3>
                 <pre className="bg-black p-4 rounded text-xs font-mono text-green-400 overflow-x-auto">
                    {`nexus run ${selectedCommand.name} ${selectedCommand.arguments.map(a => `${a.cli} <value>`).join(' ')}`}
                 </pre>
              </div>

            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
              Select a command to edit details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManifestBuilder;