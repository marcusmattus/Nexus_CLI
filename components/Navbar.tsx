import React from 'react';
import { AppView } from '../types';
import { ICONS } from '../constants';

interface NavbarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onChangeView }) => {
  const NavItem = ({ view, label, icon }: { view: AppView; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => onChangeView(view)}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
        currentView === view
          ? 'bg-nexus-primary/10 text-nexus-primary border border-nexus-primary/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <nav className="bg-nexus-panel/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onChangeView(AppView.DASHBOARD)}>
            {/* Custom Nexus Logo - Hexagon N */}
            <div className="relative w-8 h-8 flex items-center justify-center">
               <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                  <defs>
                    <linearGradient id="nexusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan */}
                      <stop offset="50%" stopColor="#8b5cf6" /> {/* Violet */}
                      <stop offset="100%" stopColor="#10b981" /> {/* Green */}
                    </linearGradient>
                  </defs>
                  {/* Hexagon Shape */}
                  <path d="M50 5 L93.3 30 V80 L50 105 L6.7 80 V30 L50 5 Z" stroke="url(#nexusGradient)" strokeWidth="3" fill="rgba(6,182,212,0.1)" />
                  
                  {/* Internal Circuit Lines */}
                  <circle cx="6.7" cy="30" r="3" fill="#06b6d4" />
                  <circle cx="93.3" cy="80" r="3" fill="#8b5cf6" />
                  <circle cx="50" cy="5" r="3" fill="#10b981" />
                  <path d="M6.7 30 L25 40" stroke="#06b6d4" strokeWidth="2" />
                  <path d="M93.3 80 L75 70" stroke="#8b5cf6" strokeWidth="2" />

                  {/* The 'N' */}
                  <path d="M35 35 V75 L65 35 V75" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-nexus-primary via-nexus-secondary to-nexus-success">
              Nexus
            </span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              <NavItem view={AppView.DASHBOARD} label="Dashboard" icon={ICONS.Chart} />
              <NavItem view={AppView.ANALYZER} label="Agent" icon={ICONS.Sparkles} />
              <NavItem view={AppView.BUILDER} label="Builder" icon={ICONS.Terminal} />
              <NavItem view={AppView.DOWNLOAD} label="Download" icon={ICONS.Download} />
              <NavItem view={AppView.SETTINGS} label="Settings" icon={ICONS.Cpu} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;