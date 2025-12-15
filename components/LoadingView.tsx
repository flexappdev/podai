import React, { useEffect, useState } from 'react';

interface LoadingViewProps {
  stage: 'transcribing' | 'generating';
}

export const LoadingView: React.FC<LoadingViewProps> = ({ stage }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="relative mb-8">
        {/* Core spinner */}
        <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-brand-500 animate-spin"></div>
        {/* Glow effect */}
        <div className="absolute inset-0 bg-brand-500 blur-xl opacity-20 animate-pulse"></div>
      </div>
      
      <h3 className="text-2xl font-display font-bold text-white mb-2">
        {stage === 'transcribing' ? 'Listening to your audio' : 'Crafting your persona'}
      </h3>
      <p className="text-slate-400">
        {stage === 'transcribing' 
          ? `Transcribing audio into text${dots}` 
          : `AI is rewriting your content${dots}`
        }
      </p>
      
      {stage === 'generating' && (
        <div className="mt-8 max-w-md w-full bg-slate-900/50 rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-600 via-purple-500 to-brand-600 w-1/3 animate-[shimmer_2s_infinite_linear] rounded-full relative">
            <div className="absolute inset-0 bg-white/20"></div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};