"use client";

import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
} from "@/components/ui/card"
import { useStoryStore } from "@/store/storyStore";
import type { StoryPanelData } from "@/types";
import { AlertCircle, ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react'; // Import icons
import Image from "next/image"; // Import Next.js Image component
import React from "react";

// Updated StoryPanel component using Card
function StoryPanel({ panel }: { panel: StoryPanelData }) {
	return (
		<Card className="overflow-hidden w-full shadow-lg">
			<CardContent className="p-0"> {/* Remove padding for image */}
				<div className="relative w-full aspect-[4/3] bg-gray-100">
					<Image
						src={panel.imageData} // Using placeholder URLs for now
						alt={panel.altText}
						layout="fill" // Fill the container
						objectFit="contain" // Contain the image within the bounds
						unoptimized={true} // Necessary for placeholder URLs or non-standard sources
					/>
				</div>
				<div className="p-6 bg-white"> {/* Changed background and padding */}
					{/* TODO: Use specified story font */}
					<p className="text-xl text-gray-700 font-sans text-center">{panel.text}</p>
				</div>
			</CardContent>
		</Card>
	);
}

// Simplified Navigation / Actions component for the left column
function StoryActions() {
	const generatedStory = useStoryStore((state) => state.generatedStory);
	const currentPanelIndex = useStoryStore((state) => state.currentPanelIndex);
	const setCurrentPanelIndex = useStoryStore((state) => state.setCurrentPanelIndex);
	const resetStory = useStoryStore((state) => state.resetStory);

	if (!generatedStory?.panels?.length) return null;

	const totalPanels = generatedStory.panels.length;

	const handlePrev = () => {
		if (currentPanelIndex > 0) {
			setCurrentPanelIndex(currentPanelIndex - 1);
		}
	};

	const handleNext = () => {
		if (currentPanelIndex < totalPanels - 1) {
			setCurrentPanelIndex(currentPanelIndex + 1);
		}
	};

	const handleDownload = () => {
		// TODO: Implement actual PDF generation in pdfService
		alert("Download PDF - Not implemented yet");
	};

	return (
		<div className="flex flex-col items-center justify-center h-full lg:items-start">
			{/* Title */}
			<h1 className="text-4xl font-bold text-center mb-8 text-gray-800 lg:text-left">
				{generatedStory.title}
			</h1>
			{/* Navigation Arrows and Page Indicator */}
			<div className="flex justify-center items-center mb-8 w-full lg:justify-start">
				<Button 
					variant="outline"
					size="icon"
					onClick={handlePrev} 
					disabled={currentPanelIndex === 0}
					aria-label="Previous Panel"
					className="mr-4"
				>
					<ChevronLeft className="h-6 w-6" />
				</Button>
				<span className="text-lg font-medium text-gray-600 w-24 text-center">
					Page {currentPanelIndex + 1} of {totalPanels} 
				</span>
				<Button 
					variant="outline"
					size="icon"
					onClick={handleNext} 
					disabled={currentPanelIndex === totalPanels - 1}
					aria-label="Next Panel"
					className="ml-4"
				>
					<ChevronRight className="h-6 w-6" />
				</Button>
			</div>
			{/* Action Buttons */}
			<div className="flex flex-col gap-4 w-full max-w-xs">
				 <Button
					variant="outline"
					size="lg" // Make buttons larger
					onClick={resetStory}
				 >
					New Story
				</Button>
				<Button
					size="lg" // Make buttons larger
					onClick={handleDownload}
				>
					<Download className="mr-2 h-5 w-5" /> Download PDF
				</Button>
			</div>
		</div>
	);
}

export function StoryContainer() {
	const generatedStory = useStoryStore((state) => state.generatedStory);
	const isLoading = useStoryStore((state) => state.isLoading);
	const error = useStoryStore((state) => state.error);
	const currentPanelIndex = useStoryStore((state) => state.currentPanelIndex);

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center text-center min-h-screen p-4">
				<Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-6" />
				<p className="text-xl font-medium text-gray-700">Generating your amazing story...</p>
				<p className="text-md text-gray-500">This might take a moment.</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center text-center min-h-screen p-4">
				<div className="text-red-600 p-8 border-2 border-red-200 rounded-lg bg-red-50 flex flex-col items-center shadow-md max-w-md">
					<AlertCircle className="h-12 w-12 text-red-500 mb-4" />
					<p className="text-xl font-semibold mb-3">Oops! Error Generating Story</p>
					<p className="text-base">{error}</p>
					{/* Consider adding a retry/back button here */}
				</div>
			</div>
		);
	}

	if (!generatedStory) {
		return null; 
	}

	const currentPanel = generatedStory.panels[currentPanelIndex];

	// Two-column layout for the story view
	return (
		<div id="story-container" className="w-full max-w-6xl mx-auto p-4 md:p-8 lg:p-12">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
				{/* Left Column: Title, Navigation, Actions */}
				<div className="order-2 lg:order-1">
					<StoryActions /> 
				</div>

				{/* Right Column: Story Panel */}
				<div className="order-1 lg:order-2">
					{currentPanel && (
						<StoryPanel 
							key={currentPanelIndex} 
							panel={currentPanel} 
						/>
					)}
				</div>
			</div>
		</div>
	);
}
