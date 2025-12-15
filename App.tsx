import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { 
  AppStage, 
  AudioFile, 
  Persona, 
  PodcastResult,
  HistoryItem,
  ChatMessage
} from './types';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { PersonaCard } from './components/PersonaCard';
import { LoadingView } from './components/LoadingView';
import { ChatInterface } from './components/ChatInterface';
import { PERSONAS } from './constants';
import { transcribeAudio, transformTextToPersona, createPersonaChat } from './services/geminiService';
import { 
  FileText,
  FileAudio,
  Play, 
  Pause, 
  RefreshCcw, 
  ArrowRight, 
  Check, 
  Download, 
  Copy,
  Clock,
  Sparkles,
  Upload,
  ChevronRight,
  Trash2,
  Calendar,
  Shuffle,
  Archive,
  Folder,
  MessageSquare,
  FileOutput
} from 'lucide-react';

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:audio/xxx;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

function App() {
  const [stage, setStage] = useState<AppStage>(AppStage.UPLOAD);
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [result, setResult] = useState<PodcastResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [folderFiles, setFolderFiles] = useState<File[]>([]);
  
  // Chat State
  const [activeTab, setActiveTab] = useState<'script' | 'chat'>('script');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('podai_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (res: PodcastResult, fileName: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      fileName: fileName,
      personaId: res.selectedPersonaId,
      fullTranscript: res.transcript,
      transcriptSnippet: res.transcript.substring(0, 100) + '...',
      transformedContent: res.transformedContent
    };

    const updatedHistory = [newItem, ...history].slice(0, 50); // Keep last 50 items
    setHistory(updatedHistory);
    localStorage.setItem('podai_history', JSON.stringify(updatedHistory));
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('podai_history', JSON.stringify(updated));
  };

  const loadFromHistory = (item: HistoryItem) => {
    const persona = PERSONAS.find(p => p.id === item.personaId) || null;
    setSelectedPersona(persona);
    setResult({
      transcript: item.fullTranscript,
      transformedContent: item.transformedContent,
      selectedPersonaId: item.personaId
    });
    setTranscript(item.fullTranscript); // Important for chat context
    setAudioFile(null); // Audio file is not persisted
    setChatMessages([]); // Reset chat
    chatSessionRef.current = null; // Reset chat session
    setActiveTab('script');
    setStage(AppStage.RESULT);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadRandomHistory = () => {
    if (history.length === 0) return;
    const randomItem = history[Math.floor(Math.random() * history.length)];
    loadFromHistory(randomItem);
  };

  const exportHistory = () => {
    if (history.length === 0) return;
    const dataStr = JSON.stringify(history, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `podai_history_export_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadScript = () => {
    if (!result) return;
    const persona = PERSONAS.find(p => p.id === result.selectedPersonaId);
    const fileName = audioFile ? audioFile.file.name.split('.')[0] : 'restored_session';
    const content = `${result.transformedContent}\n\n---\nBased on: ${fileName}\nPersona: ${persona?.name}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PodAI_${persona?.name.replace(/\s+/g, '_')}_${fileName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onpause = () => setIsPlaying(false);
      audioRef.current.onplay = () => setIsPlaying(true);
    }
  }, [audioFile]);

  // Initialize Chat Session when tab switches to chat
  useEffect(() => {
    if (activeTab === 'chat' && !chatSessionRef.current && result && selectedPersona) {
      chatSessionRef.current = createPersonaChat(result.transcript, selectedPersona);
    }
  }, [activeTab, result, selectedPersona]);

  const handleSendMessage = async (text: string) => {
    if (!chatSessionRef.current) return;

    // Add user message to UI
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now()
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const response = await chatSessionRef.current.sendMessage({ message: text });
      const aiText = response.text;

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: aiText || "I'm having trouble thinking of a response right now.",
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
         id: (Date.now() + 1).toString(),
         role: 'model',
         text: "Sorry, I encountered an error. Please try again.",
         timestamp: Date.now()
      }
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      setStage(AppStage.TRANSCRIBING);
      const previewUrl = URL.createObjectURL(file);
      const base64 = await fileToBase64(file);
      
      setAudioFile({
        file,
        previewUrl,
        base64,
        mimeType: file.type
      });

      // Start Transcription immediately
      const text = await transcribeAudio(base64, file.type);
      setTranscript(text);
      setStage(AppStage.REVIEW_TRANSCRIPT);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process audio');
      setStage(AppStage.ERROR);
    }
  };

  const handleFolderSelected = (files: File[]) => {
    setFolderFiles(files);
    // Scroll to the file list if needed
    setTimeout(() => {
      document.getElementById('file-browser')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handlePersonaSelect = async () => {
    if (!selectedPersona || !transcript) return;
    
    try {
      setStage(AppStage.GENERATING);
      const transformed = await transformTextToPersona(transcript, selectedPersona);
      
      const newResult = {
        transcript,
        transformedContent: transformed,
        selectedPersonaId: selectedPersona.id
      };

      setResult(newResult);
      if (audioFile) {
        saveToHistory(newResult, audioFile.file.name);
      }
      setActiveTab('script');
      setChatMessages([]);
      chatSessionRef.current = null;
      setStage(AppStage.RESULT);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate persona content');
      setStage(AppStage.ERROR);
    }
  };

  const reset = () => {
    setStage(AppStage.UPLOAD);
    setAudioFile(null);
    setTranscript('');
    setSelectedPersona(null);
    setResult(null);
    setError(null);
    setChatMessages([]);
    chatSessionRef.current = null;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'top') {
      if (stage !== AppStage.UPLOAD) reset();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (stage !== AppStage.UPLOAD) {
      setStage(AppStage.UPLOAD);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-brand-500/30 flex flex-col overflow-x-hidden">
      <Header onNavigate={handleNavigate} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 pb-32">
        
        {/* Error State */}
        {stage === AppStage.ERROR && (
          <div className="mt-12 max-w-xl mx-auto text-center p-8 bg-red-950/30 border border-red-500/20 rounded-2xl">
            <h2 className="text-xl font-bold text-red-400 mb-2">Something went wrong</h2>
            <p className="text-red-200/80 mb-6">{error}</p>
            <button 
              onClick={reset}
              className="px-6 py-2 bg-red-900/50 hover:bg-red-900 text-red-200 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Upload Stage (Landing Page) */}
        {stage === AppStage.UPLOAD && (
          <div className="flex flex-col space-y-32">
            
            {/* Hero Section */}
            <section className="flex flex-col items-center pt-12 md:pt-20">
              <div className="text-center max-w-3xl">
                <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
                  Give your voice a <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">new personality</span>
                </h2>
                <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
                  Upload your raw recordings and let our AI rewrite them into professional podcast segments, witty monologues, or structured narratives.
                </p>
              </div>
              <UploadZone onFileSelected={handleFileSelect} onFolderSelected={handleFolderSelected} />
              
              {/* Folder File Browser */}
              {folderFiles.length > 0 && (
                <div id="file-browser" className="w-full max-w-4xl mt-12 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 animate-fade-in">
                  <div className="flex items-center gap-3 mb-6">
                    <Folder className="w-6 h-6 text-brand-400" />
                    <h3 className="text-xl font-bold text-white">Folder Contents</h3>
                    <span className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-400">{folderFiles.length} files</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                    {folderFiles.map((file, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handleFileSelect(file)}
                        className="group flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-brand-500/30 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-brand-300 transition-colors">
                            <FileAudio className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-white truncate text-sm">{file.name}</p>
                            <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 opacity-0 group-hover:opacity-100 group-hover:bg-brand-600 group-hover:text-white transition-all">
                          <Play className="w-4 h-4 ml-0.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="relative overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-brand-900/5 -skew-y-3 scale-x-150 pointer-events-none"></div>
              <div className="text-center mb-16 relative z-10 pt-16">
                <h3 className="text-3xl font-display font-bold text-white mb-4">How it works</h3>
                <p className="text-slate-400">Transforming your audio in three simple steps</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 px-4 pb-16">
                {[
                  { icon: Upload, title: 'Upload Audio', desc: 'Drop your voice note, meeting recording, or rough podcast take.' },
                  { icon: FileText, title: 'Transcribe', desc: 'We instantly convert your speech to text using Gemini Flash.' },
                  { icon: Sparkles, title: 'Transform', desc: 'Choose a persona and watch your content get reimagined.' }
                ].map((step, i) => (
                  <div key={i} className="p-8 rounded-3xl bg-slate-900/80 backdrop-blur-sm border border-slate-800 text-center hover:border-brand-500/30 transition-colors">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-6 text-brand-400">
                      <step.icon className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-3">{step.title}</h4>
                    <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Personas Section */}
            <section id="personas">
               <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                 <div>
                   <h3 className="text-3xl font-display font-bold text-white mb-4">Available Personas</h3>
                   <p className="text-slate-400 max-w-lg">
                     Our AI models are fine-tuned to adopt distinct styles and tones. 
                     From comedy to deep analysis, pick the voice that fits your message.
                   </p>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {PERSONAS.map(p => {
                    // Render a static simplified card for the showcase
                    const IconComponent = (window as any).lucide?.[p.icon] || FileText;
                    return (
                      <div key={p.id} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800/50 transition-colors">
                         <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                            <IconComponent className="w-6 h-6" />
                         </div>
                         <h4 className="text-lg font-bold text-white mb-1">{p.name}</h4>
                         <p className="text-xs uppercase font-bold text-slate-500 mb-3">{p.role}</p>
                         <p className="text-sm text-slate-400">{p.description}</p>
                      </div>
                    )
                 })}
               </div>
            </section>

            {/* History Section */}
            <section id="history">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-full bg-slate-800 text-brand-400">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-3xl font-display font-bold text-white">History</h3>
                  <p className="text-slate-400">Your recent generations are saved locally</p>
                </div>
              </div>

              {history.length === 0 ? (
                <div className="p-12 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30">
                  <p className="text-slate-500">No history yet. Upload an audio file to get started!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {history.map(item => {
                    const persona = PERSONAS.find(p => p.id === item.personaId);
                    return (
                      <div 
                        key={item.id}
                        onClick={() => loadFromHistory(item)}
                        className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:bg-slate-800 hover:border-slate-700 cursor-pointer transition-all"
                      >
                        <div className="flex items-start gap-4 mb-4 md:mb-0">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${persona?.color || 'from-gray-700 to-gray-600'} flex items-center justify-center text-white shrink-0`}>
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                             <h4 className="font-bold text-white group-hover:text-brand-300 transition-colors mb-1">{item.fileName}</h4>
                             <div className="flex items-center gap-3 text-xs text-slate-500">
                               <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(item.timestamp).toLocaleDateString()}</span>
                               <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 uppercase tracking-wide font-semibold">{persona?.name || 'Unknown'}</span>
                             </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
                           <div className="text-sm text-slate-500 hidden md:block max-w-[200px] truncate opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to view result
                           </div>
                           <button 
                             onClick={(e) => deleteHistoryItem(e, item.id)}
                             className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                             title="Delete"
                           >
                             <Trash2 className="w-5 h-5" />
                           </button>
                           <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-brand-500 group-hover:text-white transition-all">
                              <ChevronRight className="w-5 h-5" />
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Loading Stages */}
        {(stage === AppStage.TRANSCRIBING || stage === AppStage.GENERATING) && (
          <div className="min-h-[60vh] flex items-center justify-center">
            <LoadingView stage={stage === AppStage.TRANSCRIBING ? 'transcribing' : 'generating'} />
          </div>
        )}

        {/* Review Transcript Stage */}
        {(stage === AppStage.REVIEW_TRANSCRIPT || stage === AppStage.SELECT_PERSONA) && (
          <div className="mt-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Audio & Transcript */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sticky top-24">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                    <FileAudio className="w-4 h-4" /> Source Audio
                  </h3>
                  
                  {audioFile ? (
                    <div className="mb-6 p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-4">
                      <button 
                        onClick={togglePlay}
                        className="w-12 h-12 rounded-full bg-brand-600 hover:bg-brand-500 flex items-center justify-center text-white transition-colors"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                      </button>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">{audioFile.file.name}</p>
                        <p className="text-xs text-slate-500">{(audioFile.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <audio ref={audioRef} src={audioFile.previewUrl} className="hidden" />
                    </div>
                  ) : (
                     <div className="mb-6 p-4 bg-slate-950 rounded-xl border border-slate-800 text-center text-slate-500 text-sm">
                        Audio unavailable
                     </div>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                      Raw Transcript
                    </h3>
                    <span className="text-xs text-slate-600 bg-slate-900 px-2 py-1 rounded">Read-only</span>
                  </div>
                  
                  <div className="max-h-[500px] overflow-y-auto pr-2 text-sm text-slate-300 leading-relaxed font-mono bg-slate-950 p-4 rounded-xl border border-slate-800">
                    {transcript}
                  </div>
                </div>
              </div>

              {/* Right Column: Persona Selection */}
              <div className="lg:col-span-7">
                <div className="mb-8">
                  <h2 className="text-3xl font-display font-bold text-white mb-2">Choose a Persona</h2>
                  <p className="text-slate-400">Select how you want your content to be reimagined.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {PERSONAS.map(persona => (
                    <PersonaCard 
                      key={persona.id} 
                      persona={persona} 
                      isSelected={selectedPersona?.id === persona.id}
                      onSelect={(p) => {
                        setSelectedPersona(p);
                        setStage(AppStage.SELECT_PERSONA);
                      }}
                    />
                  ))}
                </div>

                <div className="flex justify-end sticky bottom-6 z-20">
                  <button
                    disabled={!selectedPersona}
                    onClick={handlePersonaSelect}
                    className={`
                      flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-all
                      ${selectedPersona 
                        ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:scale-105 hover:shadow-brand-500/25 cursor-pointer' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed grayscale'
                      }
                    `}
                  >
                    Generate Podcast
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Result Stage */}
        {stage === AppStage.RESULT && result && (
          <div className="mt-12 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={reset}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCcw className="w-4 h-4" />
                Start Over
              </button>
              <div className="flex items-center gap-3">
                 <span className="text-sm text-slate-500">Generated with</span>
                 <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-brand-300">
                   Gemini 3 Pro
                 </span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="border-b border-slate-800 bg-slate-950/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  {(() => {
                    const p = PERSONAS.find(p => p.id === result.selectedPersonaId);
                    return (
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${p?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white shadow-lg`}>
                         <FileText className="w-8 h-8" />
                      </div>
                    );
                  })()}
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white">Your Generated Episode</h2>
                    <p className="text-slate-400">
                       {audioFile ? 'Ready for recording' : 'Restored from history'}
                    </p>
                  </div>
                </div>
                
                {/* Result Mode Toggles */}
                <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                   <button
                     onClick={() => setActiveTab('script')}
                     className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'script' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                     <FileOutput className="w-4 h-4" />
                     Script
                   </button>
                   <button
                     onClick={() => setActiveTab('chat')}
                     className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'chat' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                     <MessageSquare className="w-4 h-4" />
                     Chat
                   </button>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => copyToClipboard(result.transformedContent)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy Text
                  </button>
                  <button 
                    onClick={downloadScript}
                    className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium transition-colors flex items-center gap-2 shadow-lg shadow-brand-900/20"
                  >
                    <Download className="w-4 h-4" /> Export Script
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'script' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 animate-fade-in">
                  <div className="p-8 bg-slate-900/30">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Original Transcript</h3>
                    <div className="prose prose-invert prose-sm max-w-none text-slate-400">
                      <p className="whitespace-pre-wrap">{result.transcript}</p>
                    </div>
                  </div>
                  <div className="p-8 bg-slate-900/80 relative">
                    <div className="absolute top-0 right-0 p-4">
                       <div className="w-3 h-3 rounded-full bg-brand-500 animate-pulse"></div>
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-brand-400 mb-4">
                       {PERSONAS.find(p => p.id === result.selectedPersonaId)?.name} Edition
                    </h3>
                    <div className="prose prose-invert prose-lg max-w-none text-slate-100">
                      <p className="whitespace-pre-wrap leading-loose font-display">{result.transformedContent}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-slate-900/50 min-h-[500px]">
                  {selectedPersona && (
                    <ChatInterface 
                      messages={chatMessages}
                      onSendMessage={handleSendMessage}
                      persona={selectedPersona}
                      isLoading={isChatLoading}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Sticky Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-4">
             <span className="text-sm font-bold text-slate-500 uppercase tracking-wider hidden sm:block">Quick Actions</span>
             <button 
               onClick={loadRandomHistory}
               disabled={history.length === 0}
               className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm transition-colors border border-slate-700"
             >
               <Shuffle className="w-4 h-4" />
               <span className="hidden sm:inline">Random History</span>
               <span className="sm:hidden">Random</span>
             </button>
           </div>

           <div className="flex items-center gap-4">
              <button
                onClick={exportHistory}
                disabled={history.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 transition-all text-sm"
              >
                <Archive className="w-4 h-4" />
                Export Archive
              </button>
           </div>
        </div>
      </footer>
    </div>
  );
}

export default App;