export enum AppStage {
  UPLOAD = 'UPLOAD',
  TRANSCRIBING = 'TRANSCRIBING',
  REVIEW_TRANSCRIPT = 'REVIEW_TRANSCRIPT',
  SELECT_PERSONA = 'SELECT_PERSONA',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  promptInstruction: string;
  color: string;
}

export interface PodcastResult {
  transcript: string;
  transformedContent: string;
  selectedPersonaId: string;
}

export interface AudioFile {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  fileName: string;
  personaId: string;
  transcriptSnippet: string;
  fullTranscript: string;
  transformedContent: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}