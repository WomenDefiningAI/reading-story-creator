import type { ReadingLevel, StoryData } from "@/types";
import { type StateCreator, create } from "zustand";

export type AppState = {
	// Form State
	topic: string;
	readingLevel: ReadingLevel;
	apiKey: string | null;
	isApiKeySaved: boolean;

	// Generation State
	isLoading: boolean;
	error: string | null;
	generatedStory: StoryData | null;

	// UI State
	currentPanelIndex: number;
};

export type AppActions = {
	setTopic: (topic: string) => void;
	setReadingLevel: (level: ReadingLevel) => void;
	setApiKey: (key: string | null) => void;
	setIsApiKeySaved: (saved: boolean) => void;
	startLoading: () => void;
	setGeneratedStory: (
		story: StoryData | null,
		error?: string | Error | null,
	) => void;
	setCurrentPanelIndex: (index: number) => void;
	resetStory: () => void;
};

const initialState: AppState = {
	topic: "",
	readingLevel: "kindergarten",
	apiKey: null,
	isApiKeySaved: false,
	isLoading: false,
	error: null,
	generatedStory: null,
	currentPanelIndex: 0,
};

// Define the store creator with explicit types
const storeCreator: StateCreator<AppState & AppActions> = (set) => ({
	...initialState,

	setTopic: (topic) => set({ topic }),
	setReadingLevel: (readingLevel) => set({ readingLevel }),
	setApiKey: (apiKey) => set({ apiKey }),
	setIsApiKeySaved: (isApiKeySaved) => set({ isApiKeySaved }),

	startLoading: () =>
		set({
			isLoading: true,
			error: null,
			generatedStory: null,
			currentPanelIndex: 0,
		}),

	setGeneratedStory: (story, error = null) =>
		set({
			generatedStory: story,
			isLoading: false,
			error:
				error instanceof Error ? error.message : error ? String(error) : null,
		}),

	setCurrentPanelIndex: (currentPanelIndex) => set({ currentPanelIndex }),

	resetStory: () =>
		set((state) => ({
			...initialState,
			apiKey: state.apiKey,
			isApiKeySaved: state.isApiKeySaved,
		})),
});

export const useStoryStore = create<AppState & AppActions>(storeCreator);
