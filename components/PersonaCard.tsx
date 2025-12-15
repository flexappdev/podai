import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Persona } from '../types';

interface PersonaCardProps {
  persona: Persona;
  isSelected: boolean;
  onSelect: (persona: Persona) => void;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({ persona, isSelected, onSelect }) => {
  // Dynamic icon rendering
  const IconComponent = (LucideIcons as any)[persona.icon] || LucideIcons.User;

  return (
    <div 
      onClick={() => onSelect(persona)}
      className={`
        relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300
        border group
        ${isSelected 
          ? 'border-brand-400 bg-slate-800/80 shadow-[0_0_30px_-10px_rgba(45,212,191,0.3)] scale-[1.02]' 
          : 'border-slate-800 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-800'
        }
      `}
    >
      {/* Background Gradient Accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${persona.color} opacity-10 blur-[40px] -mr-10 -mt-10 transition-opacity group-hover:opacity-20`} />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={`
          p-3 rounded-xl 
          ${isSelected 
            ? `bg-gradient-to-br ${persona.color} text-white shadow-lg` 
            : 'bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-slate-700'
          } transition-all duration-300
        `}>
          <IconComponent className="w-6 h-6" />
        </div>
        {isSelected && (
          <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-brand-300 bg-brand-950/50 rounded-full border border-brand-500/20">
            Selected
          </span>
        )}
      </div>

      <h3 className="text-lg font-display font-bold text-white mb-1 group-hover:text-brand-100 transition-colors">
        {persona.name}
      </h3>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-3">
        {persona.role}
      </p>
      <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
        {persona.description}
      </p>
    </div>
  );
};