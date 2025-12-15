import React, { useRef, useState } from 'react';
import { UploadCloud, Music, FileAudio, AlertCircle, FolderOpen } from 'lucide-react';
import { MAX_FILE_SIZE_MB } from '../constants';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  onFolderSelected: (files: File[]) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelected, onFolderSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndPassFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('audio/')) {
      setError('Please upload an audio file (MP3, WAV, M4A, etc.)');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
      return;
    }
    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndPassFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndPassFile(e.target.files[0]);
    }
  };

  const handleFolderInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Explicitly type file as File to avoid 'unknown' type error in some TS configurations
      const audioFiles = Array.from(e.target.files).filter((file: File) => 
        file.type.startsWith('audio/') && file.size <= MAX_FILE_SIZE_MB * 1024 * 1024
      );
      
      if (audioFiles.length === 0) {
        setError("No valid audio files found in this folder.");
      } else {
        setError(null);
        onFolderSelected(audioFiles);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 animate-fade-in-up">
      <div 
        className={`
          relative group cursor-pointer
          border-2 border-dashed rounded-3xl p-12
          transition-all duration-300 ease-in-out
          flex flex-col items-center justify-center text-center
          ${isDragging 
            ? 'border-brand-400 bg-brand-400/10 scale-[1.02]' 
            : 'border-slate-700 hover:border-brand-500/50 hover:bg-slate-800/50 bg-slate-900/50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        
        <div className={`p-4 rounded-full bg-slate-800 mb-6 group-hover:scale-110 transition-transform duration-300 ${isDragging ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400'}`}>
          <UploadCloud className="w-10 h-10" />
        </div>

        <h3 className="text-xl font-display font-semibold text-white mb-2">
          Upload your raw audio
        </h3>
        <p className="text-slate-400 mb-8 max-w-sm">
          Drag and drop your voice note, podcast clip, or meeting recording here.
          <br />
          <span className="text-xs text-slate-500 mt-2 block">Supports MP3, WAV, M4A up to {MAX_FILE_SIZE_MB}MB</span>
        </p>

        <div className="flex gap-4 relative z-10">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium transition-all shadow-lg shadow-brand-900/20 flex items-center gap-2"
          >
            <Music className="w-4 h-4" />
            Select File
          </button>
          
          <button 
            onClick={() => folderInputRef.current?.click()}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-all border border-slate-700 hover:border-slate-600 flex items-center gap-2"
          >
            <FolderOpen className="w-4 h-4" />
            Select Folder
          </button>
        </div>

        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept="audio/*"
          onChange={handleFileInput}
        />
        
        <input 
          type="file" 
          ref={folderInputRef}
          className="hidden" 
          {...{webkitdirectory: "", directory: ""} as any}
          onChange={handleFolderInput}
        />
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-200">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};