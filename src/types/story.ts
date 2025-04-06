// Base type definitions for the story elements based on the tech spec

export interface StoryPanelData {
	text: string;
	imageData: string; // Assuming base64 encoded image data for now
	altText: string;
}

export interface StoryData {
	title: string;
	panels: StoryPanelData[];
}

export type ReadingLevel = "kindergarten" | "firstGrade";
