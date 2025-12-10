
export enum ReleaseGroup {
  // Deprecated for logic, kept for default values/types if needed
  MVP = "MVP",
  Release1 = "Release 1",
  Release2 = "Release 2",
  Future = "Future Considerations"
}

export interface Release {
  id: string;
  title: string;
}

export interface Story {
  id: string;
  title: string;
  description?: string;
  releaseGroup: string; // Changed from Enum to string to support dynamic IDs
  points?: number;
  color?: string;
}

export interface Task {
  // Maps to "Feature" in UI
  id: string;
  title: string;
  stories: Story[];
}

export interface Activity {
  // Maps to "Epic" in UI
  id: string;
  title: string;
  tasks: Task[];
}

export interface Version {
  id: string;
  name: string;
  timestamp: number;
  data: Omit<StoryMapData, 'versions'>;
}

export interface StoryMapData {
  id: string;
  title: string;
  okr?: string;
  lastModified: number;
  activities: Activity[];
  releases: Release[]; // New dynamic releases array
  versions: Version[];
}

export interface User {
  email: string;
  name: string;
}
