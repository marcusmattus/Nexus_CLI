import React from 'react';

const WorldMap: React.FC = () => {
  // Simplified world map polygons for aesthetic representation
  return (
    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center bg-slate-900/50 rounded-lg overflow-hidden">
       {/* Abstract Tech Grid Background */}
       <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', 
          backgroundSize: '20px 20px' 
       }}></div>

       <svg viewBox="0 0 800 400" className="w-full h-full fill-slate-700 stroke-slate-600 stroke-1">
          {/* Rough Continents */}
          {/* North America */}
          <path d="M 50 60 L 150 50 L 250 80 L 220 180 L 120 150 Z" className="hover:fill-slate-600 transition-colors" />
          {/* South America */}
          <path d="M 230 200 L 300 190 L 320 280 L 280 350 L 240 280 Z" className="hover:fill-slate-600 transition-colors" />
          {/* Europe */}
          <path d="M 380 70 L 450 60 L 470 110 L 420 120 L 370 110 Z" className="hover:fill-slate-600 transition-colors" />
          {/* Africa */}
          <path d="M 380 140 L 480 140 L 500 250 L 440 300 L 370 200 Z" className="hover:fill-slate-600 transition-colors" />
          {/* Asia */}
          <path d="M 480 60 L 650 60 L 700 150 L 600 200 L 500 150 Z" className="hover:fill-slate-600 transition-colors" />
          {/* Australia */}
          <path d="M 620 280 L 720 280 L 710 340 L 610 330 Z" className="hover:fill-slate-600 transition-colors" />

          {/* Activity Hotspots (Simulated CLI Runs) */}
          <circle cx="150" cy="100" r="4" className="fill-nexus-primary animate-pulse" />
          <circle cx="160" cy="110" r="3" className="fill-nexus-secondary animate-pulse" style={{ animationDelay: '0.5s' }} />
          <circle cx="420" cy="90" r="4" className="fill-nexus-success animate-pulse" style={{ animationDelay: '1s' }} />
          <circle cx="430" cy="100" r="3" className="fill-nexus-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
          <circle cx="650" cy="120" r="5" className="fill-nexus-secondary animate-pulse" style={{ animationDelay: '1.5s' }} />
          <circle cx="660" cy="130" r="3" className="fill-nexus-success animate-pulse" style={{ animationDelay: '0.8s' }} />
          <circle cx="280" cy="250" r="3" className="fill-nexus-primary animate-pulse" style={{ animationDelay: '2s' }} />
       </svg>
       
       <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur p-2 rounded border border-slate-700 text-xs text-slate-400">
          <div className="flex items-center gap-2 mb-1">
             <span className="w-2 h-2 rounded-full bg-nexus-primary"></span>
             <span>US-East (N. Virginia)</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
             <span className="w-2 h-2 rounded-full bg-nexus-success"></span>
             <span>EU-West (London)</span>
          </div>
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-nexus-secondary"></span>
             <span>AP-Northeast (Tokyo)</span>
          </div>
       </div>
    </div>
  );
};

export default WorldMap;