import { Persona } from './types';
import { Mic, Zap, BookOpen, Coffee, Award, Search, Hash, Brain } from 'lucide-react';

export const PERSONAS: Persona[] = [
  {
    id: 'comedian',
    name: 'The Stand-Up',
    role: 'Comedy Host',
    description: 'Turns your recording into a witty, humorous monologue full of punchlines and observational comedy.',
    icon: 'Mic',
    color: 'from-yellow-400 to-orange-500',
    promptInstruction: 'Rewrite the following text as a stand-up comedy bit. Use humor, timing, punchlines, and a casual, energetic tone. Make fun of the concepts lightly but keep the core message.'
  },
  {
    id: 'analyst',
    name: 'The Analyst',
    role: 'Tech Reviewer',
    description: 'Transforms the content into a deep-dive technical analysis, focusing on specs, logic, and structured pros/cons.',
    icon: 'Search',
    color: 'from-blue-400 to-cyan-500',
    promptInstruction: 'Rewrite the following text as a technical analysis or deep-dive review. Use structured sections, bullet points, professional terminology, and a critical, objective voice.'
  },
  {
    id: 'storyteller',
    name: 'The Narrator',
    role: 'NPR Style Host',
    description: 'Weaves your words into a compelling narrative with emotional depth, pauses, and atmospheric descriptions.',
    icon: 'BookOpen',
    color: 'from-emerald-400 to-teal-500',
    promptInstruction: 'Rewrite the following text as a narrative storytelling podcast script (like This American Life). Focus on emotion, setting the scene, rhetorical questions, and a calm, soothing cadence.'
  },
  {
    id: 'debater',
    name: 'The Provocateur',
    role: 'Hot Take Host',
    description: 'Takes a controversial stance on your recording, challenging the ideas and creating a high-energy debate format.',
    icon: 'Zap',
    color: 'from-red-500 to-pink-600',
    promptInstruction: 'Rewrite the following text as a controversial, high-energy "hot take" radio segment. Challenge the premises, use strong language, and be opinionated and provocative.'
  },
  {
    id: 'minimalist',
    name: 'The Essentialist',
    role: 'Productivity Guru',
    description: 'Distills everything down to the absolute essentials. Short, punchy, and actionable advice.',
    icon: 'Hash',
    color: 'from-gray-400 to-white',
    promptInstruction: 'Rewrite the following text as a minimalist productivity tip. Strip away all fluff. Use short sentences. Focus on "The One Thing" and actionable steps.'
  },
  {
    id: 'futurist',
    name: 'The Futurist',
    role: 'Sci-Fi Visionary',
    description: 'Reimagines your content through the lens of future technology, AI, and the evolution of humanity.',
    icon: 'Brain',
    color: 'from-violet-500 to-purple-600',
    promptInstruction: 'Rewrite the following text from the perspective of a futurist. Connect the ideas to AI, space travel, or the year 2050. Use visionary language and speculation.'
  }
];

export const MAX_FILE_SIZE_MB = 10;