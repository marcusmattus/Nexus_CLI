import React, { useState, useCallback, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { NexusManifest, ChatMessage } from '../types';
import Button from './Button';
import { ICONS } from '../constants';

interface AnalyzerProps {
  onAnalysisComplete: (manifest: NexusManifest) => void;
}

const EXAMPLES = {
  python: {
    filename: "payments.py",
    code: `import click

@click.command()
@click.option('--id', required=True, help='Transaction identifier')
@click.option('--amount', type=float, default=0.0, help='Refund amount')
def process_refund(id, amount):
    """Refunds a transaction by ID and amount"""
    print(f"Refunding {amount} for transaction {id}")
    return {"status": "success", "tx_id": id}`
  },
  typescript: {
    filename: "user-service.ts",
    code: `import { Command } from 'commander';

interface CreateUserOptions {
  role: string;
  active: boolean;
}

/**
 * Creates a new user in the system
 * @param username The username for the new account
 */
export async function createUser(username: string, options: CreateUserOptions) {
  console.log(\`Creating user \${username} with role \${options.role}\`);
  return { id: "usr_123", username, created: true };
}`
  },
  go: {
    filename: "main.go",
    code: `package main

import (
	"fmt"
	"flag"
)

// DeployService deploys a service to the specified cluster
func DeployService(serviceName string, replicas int, cluster string) {
	fmt.Printf("Deploying %s to %s with %d replicas\\n", serviceName, cluster, replicas)
}

func main() {
    // CLI entrypoint would be here
}`
  },
  rust: {
    filename: "lib.rs",
    code: `use clap::Parser;

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
pub struct ResizeArgs {
    /// Path to the input image
    #[arg(short, long)]
    pub input: String,

    /// Target width
    #[arg(short, long, default_value_t = 1920)]
    pub width: u32,
}

pub fn resize_image(args: ResizeArgs) {
    println!("Resizing {} to width {}", args.input, args.width);
}`
  }
};

const Analyzer: React.FC<AnalyzerProps> = ({ onAnalysisComplete }) => {
  // Editor State
  const [code, setCode] = useState<string>('');
  const [filename, setFilename] = useState<string>('example.py');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hello! I'm the Nexus Agent. I can help you write the source code for your CLI tool. What functionality do you need?" }
  ]);
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAnalyze = useCallback(async () => {
    if (!code) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const manifest = await geminiService.analyzeCode(code, filename);
      onAnalysisComplete(manifest);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [code, filename, onAnalysisComplete]);

  const loadExample = (lang: keyof typeof EXAMPLES) => {
    setFilename(EXAMPLES[lang].filename);
    setCode(EXAMPLES[lang].code);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCode(content);
      setFilename(file.name);
    };
    reader.readAsText(file);
    // Reset input value to allow re-uploading same file
    event.target.value = '';
  };

  const handleUrlImport = async () => {
    if (!importUrl) return;
    setIsImporting(true);
    setError(null);
    try {
        let targetUrl = importUrl;
        // Basic conversion for GitHub blob URLs to raw
        if (targetUrl.includes('github.com') && !targetUrl.includes('raw.githubusercontent.com')) {
             targetUrl = targetUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
        }

        const res = await fetch(targetUrl);
        if (!res.ok) throw new Error(`Failed to fetch URL: ${res.statusText}`);
        const text = await res.text();
        setCode(text);
        setFilename(targetUrl.split('/').pop() || 'imported_file');
        setShowUrlInput(false);
        setImportUrl('');
    } catch (err: any) {
        setError(err.message || "Failed to import from URL. Ensure it is accessible/CORS enabled.");
    } finally {
        setIsImporting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg: ChatMessage = { role: 'user', content: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatting(true);

    try {
      // Format history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const responseText = await geminiService.chat(history, userMsg.content);
      const modelMsg: ChatMessage = { role: 'model', content: responseText };
      
      setMessages(prev => [...prev, modelMsg]);

      // Auto-extract code blocks if they exist
      const codeBlockRegex = /```(?:\w+)?\s*([\s\S]*?)```/;
      const match = responseText.match(codeBlockRegex);
      if (match && match[1]) {
         setCode(match[1].trim());
      }

    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error communicating with the agent." }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
      
      {/* LEFT PANE: CHAT INTERFACE (2/5 width) */}
      <div className="lg:col-span-2 flex flex-col h-full bg-nexus-panel border border-slate-700 rounded-lg overflow-hidden">
        <div className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            {ICONS.Sparkles} Nexus Agent
          </h2>
          <span className="text-[10px] uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">Chat</span>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isChatting && (
             <div className="flex justify-start">
               <div className="bg-slate-800 rounded-lg p-3 rounded-bl-none border border-slate-700">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
               </div>
             </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-3 bg-slate-900 border-t border-slate-700">
          <div className="relative">
             <input 
                type="text"
                className="w-full bg-slate-950 border border-slate-700 rounded-md py-2 pl-3 pr-10 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                placeholder="Ask to generate code..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isChatting}
             />
             <button 
                onClick={handleSendMessage}
                disabled={isChatting || !chatInput}
                className="absolute right-2 top-1.5 text-indigo-400 hover:text-white disabled:opacity-50"
             >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                </svg>
             </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: EDITOR & ANALYSIS (3/5 width) */}
      <div className="lg:col-span-3 flex flex-col space-y-4">
        
        {/* Editor Controls */}
        <div className="bg-nexus-panel p-4 rounded-lg border border-slate-700 flex flex-col gap-4 flex-1">
          <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-nexus-text flex items-center gap-2">
                  {ICONS.Code} Source Input
                </h2>
                <div className="flex items-center gap-2">
                   {/* File Upload */}
                   <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileUpload} 
                   />
                   <Button 
                      variant="secondary" 
                      className="text-xs py-1 px-3"
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload Local File"
                   >
                       Upload File
                   </Button>

                   {/* URL Import */}
                   <Button 
                      variant={showUrlInput ? "primary" : "secondary"}
                      className="text-xs py-1 px-3"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      title="Import from URL (GitHub raw, etc.)"
                   >
                       Import URL
                   </Button>
                </div>
              </div>

              {/* URL Import Bar */}
              {showUrlInput && (
                  <div className="flex gap-2 animate-fade-in bg-slate-900 p-2 rounded border border-slate-700">
                      <input 
                          type="text" 
                          placeholder="https://raw.githubusercontent.com/..." 
                          className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-nexus-primary"
                          value={importUrl}
                          onChange={(e) => setImportUrl(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleUrlImport()}
                      />
                      <Button 
                          variant="primary" 
                          className="text-xs py-1 px-3"
                          onClick={handleUrlImport}
                          isLoading={isImporting}
                      >
                          Fetch
                      </Button>
                  </div>
              )}

              <div className="flex gap-2 border-t border-slate-700 pt-3">
                 <span className="text-xs text-slate-500 font-bold uppercase self-center mr-2">Examples:</span>
                 <button onClick={() => loadExample('python')} className="text-xs text-indigo-400 hover:text-white hover:underline">Python</button>
                 <button onClick={() => loadExample('typescript')} className="text-xs text-indigo-400 hover:text-white hover:underline">TS</button>
                 <button onClick={() => loadExample('go')} className="text-xs text-indigo-400 hover:text-white hover:underline">Go</button>
                 <button onClick={() => loadExample('rust')} className="text-xs text-indigo-400 hover:text-white hover:underline">Rust</button>
              </div>
          </div>
          
          <div className="space-y-4 flex-1 flex flex-col">
             <div>
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Filename</label>
              <input 
                type="text" 
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-nexus-text focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex-1 relative">
              <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Source Code</label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste code, upload file, or import from URL..."
                className="w-full h-[450px] font-mono text-sm bg-slate-900 border border-slate-700 rounded-md p-4 text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center">
          {error ? (
             <span className="text-sm text-red-400 bg-red-900/20 px-3 py-1 rounded border border-red-900/50">{error}</span>
          ) : (
             <span className="text-sm text-slate-500 italic">Ready to analyze</span>
          )}
          <Button 
            onClick={handleAnalyze} 
            isLoading={isAnalyzing}
            disabled={!code}
            className="w-full lg:w-auto px-8"
          >
            {ICONS.Sparkles}
            <span className="ml-2">Analyze Code</span>
          </Button>
        </div>

      </div>
    </div>
  );
};

export default Analyzer;