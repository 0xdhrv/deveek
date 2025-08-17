
import { GoogleGenAI, Type } from "@google/genai";
import { Task } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "DISABLED" });

const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: 'A concise, actionable title for the development task.',
        },
        description: {
          type: Type.STRING,
          description: 'A brief, one-sentence description of what needs to be done for this task.',
        },
        estimatedHours: {
          type: Type.NUMBER,
          description: 'A reasonable estimate of the time required to complete the task, in hours.',
        },
      },
      required: ["title", "description", "estimatedHours"],
    },
};

export const generateTasksFromGoal = async (goal: string): Promise<Omit<Task, 'id' | 'date' | 'status'>[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API key is not configured. Please set the API_KEY environment variable.");
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Break down the following high-level developer goal into smaller, actionable tasks: "${goal}"`,
            config: {
                systemInstruction: "You are an expert senior software engineering project manager. Your role is to break down high-level development goals into a series of smaller, actionable tasks. For each task, provide a clear title, a brief description, and an estimated duration in hours. Respond only with a valid JSON array of tasks, adhering to the provided schema.",
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const generatedTasks = JSON.parse(jsonText);
        
        if (!Array.isArray(generatedTasks)) {
            throw new Error("AI response was not a JSON array.");
        }

        return generatedTasks as Omit<Task, 'id' | 'date' | 'status'>[];
    } catch (error) {
        console.error("Error generating tasks with Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate tasks: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI.");
    }
};
