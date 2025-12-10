
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StoryMapData } from "../types";
import { generateId, getDefaultReleases } from "../utils/helpers";

const mapSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    productName: {
      type: Type.STRING,
      description: "A catchy name for the product based on the description.",
    },
    okr: {
      type: Type.STRING,
      description: "The primary OKR (Objective & Key Result) or Strategic Goal this product aims to achieve.",
    },
    activities: {
      type: Type.ARRAY,
      description: "The high-level User Epics (Activities). Large areas of functionality.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Name of the Epic (e.g., 'Account Management', 'Search')." },
          tasks: {
            type: Type.ARRAY,
            description: "Specific Features (User Tasks) required to complete the Epic.",
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Name of the Feature (e.g., 'Sign Up', 'Filter Results')." },
                stories: {
                  type: Type.ARRAY,
                  description: "Granular User Stories for this feature.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING, description: "The user story title (e.g., 'As a user I want to...')." },
                      description: { type: Type.STRING, description: "Acceptance criteria or notes." },
                      releaseGroup: {
                        type: Type.STRING,
                        enum: ["mvp", "release-1", "release-2", "future"],
                        description: "The release slice id. Use 'mvp' for MVP, 'release-1' for Release 1, etc."
                      },
                      points: { type: Type.INTEGER, description: "Complexity points (1, 2, 3, 5, 8)." }
                    },
                    required: ["title", "releaseGroup"]
                  }
                }
              },
              required: ["title", "stories"]
            }
          }
        },
        required: ["title", "tasks"]
      }
    }
  },
  required: ["productName", "activities"]
};

export const generateStoryMap = async (prompt: string): Promise<StoryMapData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `
        Act as an expert Product Manager and Agile Coach.
        Create a detailed User Story Map for the following product idea: "${prompt}".
        
        Follow this strict Agile Hierarchy:
        1. **OKR / Strategic Goal**: The main objective.
        2. **Epics (Activities)**: High-level user journeys (Horizontal Axis).
        3. **Features (Tasks)**: Specific capabilities to deliver the Epic.
        4. **User Stories**: Granular implementation items sliced into Releases (Vertical Axis).
        
        Assign stories to these release IDs: 'mvp', 'release-1', 'release-2', 'future'.
        Prioritize ruthlessly. The MVP should only contain the absolute essentials.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: mapSchema,
        thinkingConfig: { thinkingBudget: 1024 }
      }
    });

    if (!response.text) {
      throw new Error("No content generated");
    }

    const rawData = JSON.parse(response.text);
    
    // Inject IDs and normalize structure
    const data: StoryMapData = {
      id: generateId(),
      title: rawData.productName,
      okr: rawData.okr || "Define a strategic goal for this product",
      lastModified: Date.now(),
      releases: getDefaultReleases(),
      activities: rawData.activities.map((act: any) => ({
        id: generateId(),
        title: act.title,
        tasks: act.tasks.map((task: any) => ({
          id: generateId(),
          title: task.title,
          stories: task.stories.map((story: any) => ({
            id: generateId(),
            title: story.title,
            description: story.description,
            releaseGroup: story.releaseGroup, // Should match 'mvp', 'release-1', etc.
            points: story.points
          }))
        }))
      })),
      versions: []
    };

    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
