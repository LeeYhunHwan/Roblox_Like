import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize only if key exists to prevent immediate crashes, though app requires it.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateNPCResponse = async (
  playerName: string,
  playerMessage: string,
  context: string = "game lobby"
): Promise<string> => {
  if (!ai) return "I can't think right now (API Key missing).";

  try {
    const modelId = 'gemini-3-flash-preview'; 
    const prompt = `
      You are an NPC in a Roblox-like game called BloxVerse. 
      The setting is: ${context}.
      The player '${playerName}' just said: "${playerMessage}".
      
      Respond as a friendly, slightly blocky/robotic game character. 
      Keep it short (under 20 words). 
      Be helpful or funny.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text?.trim() || "...";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to the AI mainframe.";
  }
};

export const generateWorldLore = async (): Promise<string> => {
  if (!ai) return "A mysterious void.";

  try {
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate a short, one-sentence 'Server Announcement' for a sandbox game. make it sound sci-fi and exciting.",
    });
    return response.text?.trim() || "Welcome to the BloxVerse.";
  } catch (e) {
    return "Welcome to BloxVerse (Offline Mode).";
  }
}
