import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles } from 'lucide-react';
import { ChatMessage, Persona } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  persona: Persona;
  isLoading: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  persona,
  isLoading 
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const text = input;
    setInput('');
    await onSendMessage(text);
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-xl animate-fade-in">
      {/* Chat Header */}
      <div className={`p-4 border-b border-slate-800 bg-gradient-to-r ${persona.color} bg-opacity-10 backdrop-blur-md flex items-center gap-3`}>
        <div className="w-10 h-10 rounded-full bg-slate-950/30 flex items-center justify-center text-white backdrop-blur-sm border border-white/10">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-white flex items-center gap-2">
            Chat with {persona.name}
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-normal">AI</span>
          </h3>
          <p className="text-xs text-slate-100/80">{persona.role}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center p-8 opacity-60">
            <Sparkles className="w-12 h-12 mb-4 text-brand-400" />
            <p className="text-lg font-medium text-white mb-2">Ask me anything!</p>
            <p className="text-sm">I've read the transcript and I'm ready to discuss it in character.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0 border
              ${msg.role === 'user' 
                ? 'bg-slate-800 border-slate-700 text-slate-400' 
                : `bg-gradient-to-br ${persona.color} border-transparent text-white shadow-lg`
              }
            `}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            
            <div className={`
              max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed
              ${msg.role === 'user' 
                ? 'bg-slate-800 text-slate-200 rounded-tr-sm' 
                : 'bg-slate-950/80 border border-slate-800 text-slate-300 rounded-tl-sm'
              }
            `}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <span className="text-[10px] opacity-40 mt-1 block">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-4 animate-pulse">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${persona.color} flex items-center justify-center text-white opacity-50`}>
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl rounded-tl-sm px-5 py-4">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce delay-150"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce delay-300"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleSubmit} className="flex gap-3 relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${persona.name}...`}
            className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-slate-600"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};