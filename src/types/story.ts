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

export type ReadingLevel = 'kindergarten' | 'firstGrade' | 'secondGrade';

export type Panel = {
	text: string;
	imagePrompt: string;
	imageData?: string; // Base64 image data
};

export type Story = {
	title: string;
	panels: Panel[];
};
