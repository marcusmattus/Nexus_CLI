import React, { useState, useEffect, useRef } from 'react';
import { NexusManifest } from '../types';

interface WebTerminalProps {
  availableManifests: NexusManifest[];
}

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success' | 'info';
  content: string;
}

const WebTerminal: React.FC<WebTerminalProps> = ({ availableManifests }) => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'info', content: 'Nexus CLI v1.0.4 [Simulator]' },
    { type: 'info', content: 'Type "help" for a list of commands.' },
    { type: 'info', content: 'Try "nexus login <key>" to start.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [localManifests, setLocalManifests] = useState<NexusManifest[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleCommand = async (cmdString: string) => {
    const args = cmdString.trim().split(/\s+/);
    const cmd = args[0];

    if (!cmd) return;

    // Helper to add lines
    const addLine = (type: TerminalLine['type'], content: string) => {
      setLines(prev => [...prev, { type, content }]);
    };

    if (cmd === 'clear') {
      setLines([]);
      return;
    }

    if (cmd === 'help') {
      addLine('output', 'Available commands:');
      addLine('output', '  nexus login <key>    Authenticate with Nexus Cloud');
      addLine('output', '  nexus sync           Fetch latest manifests from production');
      addLine('output', '  nexus list           List all available commands');
      addLine('output', '  nexus run <cmd>      Execute a remote command');
      addLine('output', '  clear                Clear terminal');
      return;
    }

    if (cmd !== 'nexus') {
      addLine('error', `command not found: ${cmd}. Try "nexus" or "help".`);
      return;
    }

    const subCmd = args[1];
    
    // NEXUS CLI LOGIC
    if (!subCmd) {
      addLine('output', 'Nexus CLI v1.0.4');
      addLine('output', 'Usage: nexus <command> [flags]');
      return;
    }

    if (subCmd === 'login') {
      if (args[2] && args[2].startsWith('nxs_')) {
        setIsLoggedIn(true);
        addLine('success', 'Successfully authenticated as architect@nexus.dev');
      } else {
        addLine('error', 'Invalid API key format. Expected starts with "nxs_"');
      }
      return;
    }

    if (!isLoggedIn) {
      addLine('error', 'Error: You must be logged in. Run "nexus login <key>" first.');
      return;
    }

    if (subCmd === 'sync') {
      addLine('info', 'Connecting to Nexus Control Plane...');
      await new Promise(r => setTimeout(r, 800)); // Sim network
      setLocalManifests(availableManifests);
      addLine('success', `Synced ${availableManifests.length} manifests.`);
      return;
    }

    if (subCmd === 'list') {
      if (localManifests.length === 0) {
        addLine('output', 'No commands found. Run "nexus sync" to fetch manifests.');
        return;
      }
      addLine('output', 'NAMESPACE       COMMAND             DESCRIPTION');
      addLine('output', '-----------     -------             -----------');
      localManifests.forEach(m => {
        m.commands.forEach(c => {
          addLine('output', `${m.namespace.padEnd(15)} ${c.name.padEnd(19)} ${c.description}`);
        });
      });
      return;
    }

    if (subCmd === 'run') {
      const target = args[2];
      if (!target) {
        addLine('error', 'Error: Missing command name. Usage: nexus run <namespace:command>');
        return;
      }

      if (localManifests.length === 0) {
        addLine('error', 'Error: Local manifest cache empty. Run "nexus sync".');
        return;
      }

      // Find command
      let foundCmd: any = null;
      let foundManifest: any = null;

      // Try exact match "namespace:command"
      for (const m of localManifests) {
        const hit = m.commands.find(c => c.id === target || c.name === target); // allow loose match for demo
        if (hit) {
          foundCmd = hit;
          foundManifest = m;
          break;
        }
      }

      if (!foundCmd) {
        addLine('error', `Error: Command "${target}" not found in local cache.`);
        return;
      }

      // Check required args (simple check)
      const providedArgs = args.slice(3);
      const missingReq = foundCmd.arguments.filter((a: any) => a.required && !providedArgs.some((pa: string) => pa.startsWith(a.cli)));
      
      // Very basic arg checking for simulation
      if (missingReq.length > 0) {
         addLine('error', `Error: Missing required flags: ${missingReq.map((a: any) => a.cli).join(', ')}`);
         return;
      }

      // Simulation Execution
      addLine('info', `[nexus] Resolving runtime for ${foundCmd.language}...`);
      await new Promise(r => setTimeout(r, 400));
      addLine('info', `[nexus] Using runtime: ${foundCmd.runtime}`);
      
      addLine('info', `[bridge] Generating ${foundCmd.language} bridge script...`);
      await new Promise(r => setTimeout(r, 400));
      
      addLine('info', `[docker] Pulling image ${foundCmd.runtime}...`);
      addLine('info', `[docker] Container started (id: 8f2a1c)`);
      
      addLine('output', '--- CONTAINER STDOUT ---');
      
      // Mock Output based on command
      if (foundCmd.returns === 'json') {
          await new Promise(r => setTimeout(r, 600));
          const mockOutput = {
              status: "success",
              timestamp: new Date().toISOString(),
              data: {
                  message: `Executed ${foundCmd.name} successfully`,
                  input_args: providedArgs
              }
          };
          addLine('output', JSON.stringify(mockOutput, null, 2));
      } else {
          addLine('output', `Command ${foundCmd.name} executed successfully.`);
      }
      
      addLine('success', `[nexus] Command finished with exit code 0`);
      return;
    }

    addLine('error', `Unknown command: ${subCmd}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const cmd = input;
      setLines(prev => [...prev, { type: 'input', content: cmd }]);
      setInput('');
      handleCommand(cmd);
    }
  };

  return (
    <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden font-mono text-sm shadow-2xl flex flex-col h-[500px]">
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex gap-2 items-center">
        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        <span className="ml-2 text-xs text-slate-500">user@devbox: ~</span>
      </div>
      <div className="p-4 flex-1 overflow-y-auto space-y-1" onClick={() => inputRef.current?.focus()}>
        {lines.map((line, i) => (
          <div key={i} className={`${
            line.type === 'input' ? 'text-white' : 
            line.type === 'error' ? 'text-red-400' :
            line.type === 'success' ? 'text-green-400' :
            line.type === 'info' ? 'text-blue-400' : 'text-slate-300'
          }`}>
            {line.type === 'input' && <span className="text-green-500 mr-2">$</span>}
            <span className="whitespace-pre-wrap">{line.content}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex items-center">
        <span className="text-green-500 mr-2">$</span>
        <input 
          ref={inputRef}
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-white placeholder-slate-600"
          placeholder="Type a command..."
          autoFocus
        />
      </div>
    </div>
  );
};

export default WebTerminal;