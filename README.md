# PodAI - Podcast Persona Architect

PodAI is a web application that gives your voice a new personality. It transforms raw audio recordings into professional podcast segments, witty monologues, or structured narratives using Google's Gemini AI.

![Landing Page](https://i.imgur.com/uX8H4qj.png)

## Features

- **Smart Transcription**: Instantly converts raw audio (MP3, WAV, M4A) into text using Gemini 2.5 Flash.
- **Persona Transformation**: Rewrites your content into specific styles using Gemini 3 Pro:
  - *The Stand-Up*: Comedy host style.
  - *The Analyst*: Tech reviewer style.
  - *The Narrator*: NPR-style storytelling.
  - *The Provocateur*: High-energy debate.
  - *The Essentialist*: Minimalist productivity guru.
  - *The Futurist*: Sci-fi visionary.
- **Interactive Chat**: Chat directly with the specific persona about the transcript content.
- **Local History**: Saves your generations locally so you can revisit them later.

## Screenshots

### 1. Choose a Persona
Select how you want your content to be reimagined.
<img width="2573" height="2285" alt="image" src="https://github.com/user-attachments/assets/c61ffd6f-1a7e-4c7d-964a-36035a13c5ec" />

![Persona Selection](https://i.imgur.com/3Z4jX8a.png)

### 2. Generated Script
View the original transcript side-by-side with the transformed persona edition.
![Generated Script](https://i.imgur.com/Kq7Z9aX.png)

### 3. Chat with Persona
Have a conversation with the specific persona about the content of your recording.
![Chat Interface](https://i.imgur.com/4J9zX8b.png)

## Tech Stack

- **Frontend**: React, Vite, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google GenAI SDK (@google/genai)
- **Icons**: Lucide React
