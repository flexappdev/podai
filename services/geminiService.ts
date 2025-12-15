import { GoogleGenAI, Chat } from "@google/genai";
import { Persona } from "../types";

const getAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const transcribeAudio = async (
  base64Audio: string,
  mimeType: string
): Promise<string> => {
  const ai = getAI();
  
  // Using gemini-2.5-flash for fast and accurate multimodal understanding
  const modelId = "gemini-2.5-flash";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio,
            },
          },
          {
            text: "Generate a verbatim transcription of this audio. Do not summarize. If there are multiple speakers, identify them as Speaker 1, Speaker 2, etc. If the audio is silent or unintelligible, state that clearly.",
          },
        ],
      },
    });

    const text = response.text;
    if (!text) throw new Error("No transcription generated");
    return text;
  } catch (error) {
    console.error("Transcription error:", error);
    throw error;
  }
};

export const transformTextToPersona = async (
  transcript: string,
  persona: Persona
): Promise<string> => {
  const ai = getAI();
  
  // Using gemini-3-pro-preview for high-quality creative writing and nuance
  const modelId = "gemini-3-pro-preview";

  const prompt = `
    You are acting as the following persona: ${persona.name} - ${persona.role}.
    
    System Instruction for this persona:
    ${persona.promptInstruction}

    Here is the raw source text (transcript):
    "${transcript}"

    Task:
    Transform the source text into a script or monologue that matches your persona perfectly. 
    Maintain the core information/facts from the source, but completely change the tone, vocabulary, and structure to fit the persona.
    Output ONLY the transformed content. Do not add introductory conversational filler like "Here is the rewritten text".
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 1024 } // Giving it a bit of budget to plan the creative adaptation
      }
    });

    const text = response.text;
    if (!text) throw new Error("No content generated");
    return text;
  } catch (error) {
    console.error("Transformation error:", error);
    throw error;
  }
};

export const createPersonaChat = (
  transcript: string,
  persona: Persona
): Chat => {
  const ai = getAI();
  const modelId = "gemini-2.5-flash"; // Flash is great for responsive chat

  const systemInstruction = `
    You are ${persona.name}, a ${persona.role}.
    ${persona.description}
    
    Your personality instructions are:
    ${persona.promptInstruction}

    CONTEXT:
    The user has provided a transcript of an audio recording. You must answer questions, discuss the content, or elaborate on the topics found in the transcript BELOW.
    
    TRANSCRIPT:
    "${transcript}"

    RULES:
    1. Stay in character as ${persona.name} at all times.
    2. Use the tone, vocabulary, and style defined in your personality instructions.
    3. If the user asks about something not in the transcript, improvise based on your persona but mention it wasn't in the original audio if strictly necessary.
    4. Be helpful but conversational.
  `;

  return ai.chats.create({
    model: modelId,
    config: {
      systemInstruction: systemInstruction,
    }
  });
};