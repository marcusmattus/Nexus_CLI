import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCardProps, NexusManifest, InsightResult } from '../types';
import { ICONS } from '../constants';
import WorldMap from './WorldMap';
import { geminiService } from '../services/geminiService';
import Button from './Button';

const data = [
  { name: 'Mon', runs: 40 },
  { name: 'Tue', runs: 30 },
  { name: 'Wed', runs: 20 },
  { name: 'Thu', runs: 27 },
  { name: 'Fri', runs: 18 },
  { name: 'Sat', runs: 23 },
  { name: 'Sun', runs: 34 },
];

const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon }) => (
  <div className="bg-nexus-panel p-6 rounded-lg border border-slate-700">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-nexus-muted">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-2">{value}</h3>
      </div>
      <div className="p-2 bg-slate-800 rounded-lg text-indigo-400">
        {icon}
      </div>
    </div>
    {change && (
      <div className={`mt-4 text-xs font-medium ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
        {change} from last week
      </div>
    )}
  </div>
);

interface DashboardProps {
  manifests: NexusManifest[];
}

const Dashboard: React.FC<DashboardProps> = ({ manifests }) => {
  const activeCount = manifests.length;
  const totalCommands = manifests.reduce((acc, m) => acc + m.commands.length, 0);
  
  // Calculate dynamic stats based on "live" data
  const totalRuns = 1284 + (activeCount * 142);

  // Insight State
  const [insightQuery, setInsightQuery] = useState('');
  const [insightResult, setInsightResult] = useState<InsightResult | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const handleInsightSearch = async () => {
    if (!insightQuery.trim()) return;
    setLoadingInsight(true);
    setInsightResult(null);
    try {
      const result = await geminiService.getLocationInsights(insightQuery);
      setInsightResult(result);
    } catch (error) {
      console.error(error);
      setInsightResult({ text: "Failed to retrieve location insights.", groundingChunks: [] });
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total CLI Runs" 
          value={totalRuns.toLocaleString()} 
          change="+12.5%" 
          trend="up" 
          icon={ICONS.Terminal}
        />
        <StatCard 
          title="Commands Published" 
          value={totalCommands} 
          change={activeCount > 0 ? `+${activeCount} new` : "0"} 
          trend="up" 
          icon={ICONS.Code}
        />
        <StatCard 
          title="Active Manifests" 
          value={activeCount} 
          change="Live Production" 
          trend="neutral" 
          icon={ICONS.Cpu}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Execution Map */}
        <div className="lg:col-span-2 bg-nexus-panel p-6 rounded-lg border border-slate-700 h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Global Execution Map
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-normal border border-indigo-500/20">Live</span>
            </h3>
          </div>
          <div className="flex-1 overflow-hidden">
            <WorldMap />
          </div>
        </div>

        {/* Regional Intelligence (Google Maps Grounding) */}
        <div className="bg-nexus-panel p-6 rounded-lg border border-slate-700 flex flex-col h-[400px]">
           <div className="flex items-center gap-2 mb-4">
             <div className="p-1.5 bg-green-500/10 rounded text-green-400">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
               </svg>
             </div>
             <h3 className="text-lg font-bold text-white">Regional Intelligence</h3>
           </div>
           
           <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto mb-4 bg-slate-900/50 rounded p-3 border border-slate-800">
                {insightResult ? (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{insightResult.text}</p>
                    {insightResult.groundingChunks && insightResult.groundingChunks.length > 0 && (
                      <div className="pt-2 border-t border-slate-800">
                        <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Sources</span>
                        <div className="flex flex-wrap gap-2">
                          {insightResult.groundingChunks.map((chunk, idx) => {
                             if (chunk.web?.uri) {
                               return (
                                 <a key={idx} href={chunk.web.uri} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline truncate max-w-full">
                                   {chunk.web.title || chunk.web.uri}
                                 </a>
                               );
                             }
                             return null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center text-sm p-4">
                    <p className="mb-2">Ask about infrastructure or regions displayed on the map.</p>
                    <span className="text-xs bg-slate-800 px-2 py-1 rounded">"Where are the data centers in Tokyo?"</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                 <input 
                   className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-nexus-primary outline-none"
                   placeholder="Ask Gemini Maps..."
                   value={insightQuery}
                   onChange={(e) => setInsightQuery(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleInsightSearch()}
                 />
                 <Button onClick={handleInsightSearch} isLoading={loadingInsight} className="px-3">
                   →
                 </Button>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-nexus-panel p-6 rounded-lg border border-slate-700 h-96">
          <h3 className="text-lg font-bold text-white mb-6">Execution Activity</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={data}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                itemStyle={{ color: '#f8fafc' }}
                cursor={{fill: '#334155', opacity: 0.4}}
              />
              <Bar dataKey="runs" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-nexus-panel p-6 rounded-lg border border-slate-700 flex flex-col">
           <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
           <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b border-slate-800 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-900/50 flex items-center justify-center text-xs text-indigo-300 font-mono">
                             CLI
                          </div>
                          <div>
                              <p className="text-sm text-white">Ran <span className="font-mono text-indigo-300">payment-service:refund</span></p>
                              <p className="text-xs text-slate-500">2 minutes ago</p>
                          </div>
                      </div>
                      <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded border border-green-900/50">Success</span>
                  </div>
              ))}
           </div>
        </div>
      </div>

      <div className="bg-nexus-panel rounded-lg border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Live Deployments</h3>
            <span className="px-2 py-1 bg-green-900/20 text-green-400 text-xs font-bold rounded border border-green-900/50 uppercase tracking-wide">
                Production Environment
            </span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-900/50 uppercase text-xs font-semibold text-slate-500">
                    <tr>
                        <th className="px-6 py-4">Namespace</th>
                        <th className="px-6 py-4">Source</th>
                        <th className="px-6 py-4">Commands</th>
                        <th className="px-6 py-4">Language</th>
                        <th className="px-6 py-4">Deployed</th>
                        <th className="px-6 py-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {manifests.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-slate-500 italic">
                                No manifests deployed to production yet.
                            </td>
                        </tr>
                    ) : manifests.map((manifest) => (
                        <tr key={manifest.namespace} className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-white font-mono">{manifest.namespace}</td>
                            <td className="px-6 py-4 text-xs truncate max-w-[150px]">{manifest.source}</td>
                            <td className="px-6 py-4">{manifest.commands.length}</td>
                            <td className="px-6 py-4">
                                <span className="capitalize px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs">
                                    {manifest.language}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-xs">
                                {new Date(manifest.generated_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-900/50">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                                    Live
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;