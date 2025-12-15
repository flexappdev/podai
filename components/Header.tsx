import React from 'react';
import { Mic2 } from 'lucide-react';

interface HeaderProps {
  onNavigate: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  return (
    <header className="w-full py-6 px-4 md:px-8 border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => onNavigate('top')}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-brand-500 blur-lg opacity-20 animate-pulse-slow"></div>
            <Mic2 className="w-8 h-8 text-brand-400 relative z-10 group-hover:text-brand-300 transition-colors" />
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-white group-hover:text-brand-100 transition-colors">
            Pod<span className="text-brand-400">AI</span>
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button onClick={() => onNavigate('how-it-works')} className="hover:text-brand-300 transition-colors">How it works</button>
          <button onClick={() => onNavigate('personas')} className="hover:text-brand-300 transition-colors">Personas</button>
          <button onClick={() => onNavigate('history')} className="hover:text-brand-300 transition-colors">History</button>
        </div>
      </div>
    </header>
  );
};