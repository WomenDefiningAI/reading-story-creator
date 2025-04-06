"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useStoryStore } from "@/store/storyStore";
import type { ReadingLevel } from "@/types";
import { Mic, Save } from "lucide-react"; // Import icons
import type React from "react";

export function StoryInputForm() {
	// Use Zustand store hooks to get/set form state
	const topic = useStoryStore((state) => state.topic);
	const setTopic = useStoryStore((state) => state.setTopic);
	const readingLevel = useStoryStore((state) => state.readingLevel);
	const setReadingLevel = useStoryStore((state) => state.setReadingLevel);
	const apiKey = useStoryStore((state) => state.apiKey);
	const setApiKey = useStoryStore((state) => state.setApiKey);
	const isApiKeySaved = useStoryStore((state) => state.isApiKeySaved);
	const setIsApiKeySaved = useStoryStore((state) => state.setIsApiKeySaved);
	const isLoading = useStoryStore((state) => state.isLoading);
	const startLoading = useStoryStore((state) => state.startLoading);
	const setGeneratedStory = useStoryStore((state) => state.setGeneratedStory);

	const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setApiKey(event.target.value);
		// If user modifies a saved key, mark it as unsaved until they explicitly save again
		if (isApiKeySaved) {
			setIsApiKeySaved(false);
		}
	};

	const handleSaveApiKey = () => {
		if (apiKey) {
			localStorage.setItem("gemini_api_key", apiKey);
			setIsApiKeySaved(true);
		}
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!apiKey) {
			// TODO: Show proper validation/error message
			alert("Please enter your Gemini API Key.");
			return;
		}
		startLoading();
		console.log("Submitting:", { topic, readingLevel, apiKey });
		// TODO: Replace with actual API call in geminiService

		// Simulate API call - Use the single placeholder image
		setTimeout(() => {
			setGeneratedStory({
				title: `A Story About ${topic || "a Dragon"}`,
				panels: Array.from({ length: 6 }).map((_, i) => ({
					text: `This is panel ${i + 1} about ${topic || "a dragon"}. It's written for ${readingLevel}.`,
					imageData: "/placeholderimage1.png", // Use the single provided placeholder path with quotes
					altText: `Illustration for panel ${i + 1}`,
				})),
			});
		}, 1500);
	};

	return (
		<Card className="w-full max-w-lg mx-auto">
			<CardHeader>
				<CardTitle className="text-center text-2xl">
					Create a Reading Story
				</CardTitle>
				{/* Optional: Add CardDescription if needed */}
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* API Key Input */}
					<div className="space-y-2">
						<Label htmlFor="apiKey">Gemini API Key</Label>
						<div className="flex items-center gap-2">
							<Input
								id="apiKey"
								type="password"
								value={apiKey || ""}
								onChange={handleApiKeyChange}
								placeholder="Enter your API key"
								required
							/>
							<Button
								type="button"
								variant="outline"
								size="icon"
								onClick={handleSaveApiKey}
								disabled={!apiKey || isApiKeySaved || isLoading}
								aria-label="Save API Key"
							>
								<Save
									className={`h-4 w-4 ${isApiKeySaved ? "text-green-600" : ""}`}
								/>
							</Button>
						</div>
						{isApiKeySaved && (
							<p className="text-xs text-green-600">
								API Key saved in browser storage.
							</p>
						)}
					</div>

					{/* Reading Level Select */}
					<div className="space-y-2">
						<Label htmlFor="readingLevel">Reading Level</Label>
						<Select
							value={readingLevel}
							onValueChange={(value) => setReadingLevel(value as ReadingLevel)}
							disabled={isLoading}
						>
							<SelectTrigger id="readingLevel">
								<SelectValue placeholder="Select level" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="kindergarten">Kindergarten</SelectItem>
								<SelectItem value="firstGrade">1st Grade</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Story Topic Textarea */}
					<div className="space-y-2">
						<Label htmlFor="topic">What should the story be about?</Label>
						<div className="relative">
							<Textarea
								id="topic"
								value={topic}
								onChange={(e) => setTopic(e.target.value)}
								placeholder="e.g., A panda's first day of school, A bunny learning to share..."
								className="pr-12" // Add padding for the mic button
								rows={3}
								required
								disabled={isLoading}
							/>
							<Button
								type="button"
								variant="outline"
								size="icon"
								className="absolute bottom-2 right-2"
								aria-label="Use voice input" // Add aria-label
								onClick={() => alert("Voice input not implemented yet")} // Placeholder action
								disabled={isLoading}
							>
								<Mic className="h-4 w-4" />
							</Button>
						</div>
					</div>

					{/* Submit Button */}
					<Button
						type="submit"
						disabled={isLoading || !topic.trim() || !apiKey}
						className="w-full"
					>
						{isLoading ? "Generating..." : "Create Story"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
