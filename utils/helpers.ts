
import { StoryMapData, Release } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getDefaultReleases = (): Release[] => [
  { id: "mvp", title: "MVP" },
  { id: "release-1", title: "Release 1" },
  { id: "release-2", title: "Release 2" },
  { id: "future", title: "Future Considerations" }
];

export const createEmptyMap = (): StoryMapData => {
  const actId = generateId();
  const taskId = generateId();
  return {
    id: generateId(),
    title: "Untitled Story Map",
    lastModified: Date.now(),
    releases: getDefaultReleases(),
    activities: [
      {
        id: actId,
        title: "First Epic",
        tasks: [
          {
            id: taskId,
            title: "First Feature",
            stories: []
          }
        ]
      }
    ],
    versions: []
  };
};
