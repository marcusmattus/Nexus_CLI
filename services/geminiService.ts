import { GoogleGenAI } from "@google/genai";
import { NexusManifest, InsightResult } from "../types";
import { SYSTEM_PROMPT } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // In a real app, strict error handling here if key is missing.
    // For this demo, we assume process.env.API_KEY is valid as per prompt instructions.
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async analyzeCode(sourceCode: string, filename: string): Promise<NexusManifest> {
    if (!sourceCode.trim()) {
      throw new Error("Source code cannot be empty");
    }

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Filename: ${filename}\n\nCode:\n${sourceCode}`,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          temperature: 0.2, // Low temperature for deterministic analysis
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response from AI Agent");
      }

      const manifest: NexusManifest = JSON.parse(text);
      return manifest;

    } catch (error) {
      console.error("Gemini Analysis Failed:", error);
      throw new Error("Failed to analyze code. Please check your API Key and try again.");
    }
  }

  async getLocationInsights(query: string): Promise<InsightResult> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config: {
          tools: [{ googleMaps: {} }],
        },
      });

      return {
        text: response.text || "No insights available.",
        groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      };
    } catch (error: any) {
      console.error("Maps Grounding Failed:", error);
      throw new Error("Failed to retrieve location insights.");
    }
  }

  async chat(history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> {
    try {
      const chat = this.ai.chats.create({
        model: "gemini-2.5-flash",
        history: history,
        config: {
          systemInstruction: "You are the Nexus Coding Assistant. Your goal is to help the user write, debug, or generate source code files (Python, TS, Go, Rust) that can be analyzed by Nexus. If asked to generate code, provide ONLY the code block if possible, or minimal explanation.",
        }
      });
      
      const response = await chat.sendMessage({ message });
      return response.text || "";
    } catch (error) {
      console.error("Chat Failed:", error);
      throw new Error("Failed to communicate with Nexus Agent.");
    }
  }
}

export const geminiService = new GeminiService();