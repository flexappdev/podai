# PodAI - Podcast Persona Architect

PodAI is a sophisticated web application that transforms raw voice notes and audio recordings into professional podcast segments, witty monologues, or structured narratives using the power of Google's Gemini AI.

## 🚀 Features

### 🎙️ Core Functionality
-   **Smart Transcription**: Instantly converts audio files (MP3, WAV, M4A) into verbatim text using the multimodal capabilities of `gemini-2.5-flash`.
-   **Persona Transformation**: Rewrites transcripts into distinct styles using `gemini-3-pro-preview` with advanced reasoning capabilities.
-   **Interactive Chat**: **(New)** Chat directly with the generated persona to ask follow-up questions or explore topics from the transcript in character.

### 🎭 Available Personas
1.  **The Stand-Up**: Adds humor, punchlines, and observational comedy.
2.  **The Analyst**: Structured, technical deep-dives with pros/cons.
3.  **The Narrator**: Emotional, atmospheric storytelling (NPR style).
4.  **The Provocateur**: High-energy, controversial "hot takes".
5.  **The Essentialist**: Minimalist, actionable productivity advice.
6.  **The Futurist**: Visionary takes connecting topics to AI and the future.

### 🛠️ Tools & Utilities
-   **Local History**: Automatically saves your sessions to your browser's local storage so you never lose a generation.
-   **Folder Browsing**: Select a local folder to view and pick from multiple audio files instantly.
-   **Export Options**:
    -   Download generated scripts as `.txt`.
    -   Export your entire session history as JSON.
-   **Quick Actions**: Sticky footer for quick access to "Random History" and "Export Archive".

## ⚡ Tech Stack

-   **Frontend**: React 19, TypeScript, Vite
-   **Styling**: Tailwind CSS, Lucide React (Icons)
-   **AI Integration**: Google GenAI SDK (`@google/genai`)
    -   Transcription & Chat: `gemini-2.5-flash`
    -   Creative Writing: `gemini-3-pro-preview` (Utilizing Thinking Config)

## 📦 Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up your API Key:
    -   Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/).
    -   Ensure the environment variable `API_KEY` is available to the application.
4.  Run the development server:
    ```bash
    npm run dev
    ```

## 📖 Usage Guide

1.  **Upload**: Drag and drop an audio file onto the upload zone, or use "Select Folder" to browse local files.
2.  **Review**: Wait for transcription to complete and review the raw text.
3.  **Select Persona**: Choose one of the 6 available personas to define the output style.
4.  **Generate**: Watch as Gemini rewrites your content.
5.  **Interact**:
    -   **Script Tab**: Read and copy the generated monologue.
    -   **Chat Tab**: Switch to the chat interface to discuss the content with the AI persona.
6.  **Save/Export**: Use the "Export Script" button to download the result.

## 📸 Screenshots

![PodAI Interface](./screenshots/app-preview.png)
*Engage in a conversation with the specific persona, context-aware of your transcript.*

---

Built with ❤️ using Gemini API.