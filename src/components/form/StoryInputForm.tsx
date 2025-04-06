'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useStoryStore } from '@/store/storyStore';
import type { ReadingLevel } from '@/types';
import { Eye, EyeOff, Mic, MicOff } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

export function StoryInputForm() {
	// Use Zustand store hooks to get/set form state
	const topic = useStoryStore((state) => state.topic);
	const setTopic = useStoryStore((state) => state.setTopic);
	const readingLevel = useStoryStore((state) => state.readingLevel);
	const setReadingLevel = useStoryStore((state) => state.setReadingLevel);
	const apiKey = useStoryStore((state) => state.apiKey);
	const setApiKey = useStoryStore((state) => state.setApiKey);
	const isLoading = useStoryStore((state) => state.isLoading);
	const startLoading = useStoryStore((state) => state.startLoading);
	const setGeneratedStory = useStoryStore((state) => state.setGeneratedStory);

	// State for API key visibility
	const [showApiKey, setShowApiKey] = useState(false);

	// Speech Recognition Hook Integration
	const {
		isListening,
		transcript,
		startListening,
		stopListening,
		isAvailable,
	} = useSpeechRecognition({
		onTranscriptChange: (newTranscript) => {
			// Update the form state directly as user speaks
			setTopic(newTranscript);
		},
		// Optional: Add onError or onRecognitionEnd handlers if needed
	});

	// Sync textarea with final transcript when listening stops
	useEffect(() => {
		// Only update if not listening and transcript has a value
		// and it's different from the current topic state
		if (!isListening && transcript && transcript !== topic) {
			setTopic(transcript);
		}
		// Add dependencies: isListening, transcript, setTopic, topic
	}, [isListening, transcript, setTopic, topic]);

	const handleMicClick = () => {
		if (!isAvailable) {
			alert('Speech recognition is not available in your browser.');
			return;
		}
		if (isListening) {
			stopListening();
		} else {
			startListening();
		}
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (isListening) {
			// Stop listening if form is submitted while recording
			stopListening();
		}
		if (!apiKey) {
			// TODO: Show proper validation/error message
			alert('Please enter your Gemini API Key.');
			return;
		}
		startLoading();
		console.log('Submitting:', { topic, readingLevel }); // Don't log key

		// Simulate API call
		setTimeout(() => {
			setGeneratedStory({
				title: `A Story About ${topic || 'a Dragon'}`,
				panels: Array.from({ length: 6 }).map((_, i) => ({
					text: `This is panel ${i + 1} about ${topic || 'a dragon'}. It's written for ${readingLevel}.`,
					imageData: '/placeholderimage1.png',
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
								type={showApiKey ? 'text' : 'password'}
								value={apiKey || ''}
								onChange={(e) => setApiKey(e.target.value)}
								placeholder="Enter your API key"
								required
								disabled={isLoading}
							/>
							<Button
								type="button"
								variant="outline"
								size="icon"
								onClick={() => setShowApiKey(!showApiKey)}
								disabled={isLoading}
								aria-label={
									showApiKey ? 'Hide API Key' : 'Show API Key'
								}
							>
								{showApiKey ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>

					{/* Reading Level Select */}
					<div className="space-y-2">
						<Label htmlFor="readingLevel">Reading Level</Label>
						<Select
							value={readingLevel}
							onValueChange={(value) =>
								setReadingLevel(value as ReadingLevel)
							}
							disabled={isLoading}
						>
							<SelectTrigger id="readingLevel">
								<SelectValue placeholder="Select level" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="kindergarten">
									Kindergarten
								</SelectItem>
								<SelectItem value="firstGrade">
									1st Grade
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Story Topic Textarea */}
					<div className="space-y-2">
						<Label htmlFor="topic">
							What should the story be about?
						</Label>
						<div className="relative">
							<Textarea
								id="topic"
								value={topic}
								onChange={(e) => setTopic(e.target.value)}
								placeholder={
									isListening
										? 'Listening... speak now!'
										: "e.g., A panda's first day of school, A bunny learning to share..."
								}
								className="pr-12"
								rows={3}
								required
								disabled={isLoading}
							/>
							<Button
								type="button"
								variant={
									isListening ? 'destructive' : 'outline'
								}
								size="icon"
								className={`absolute bottom-2 right-2 ${isLoading || !isAvailable ? 'cursor-not-allowed' : ''}`}
								aria-label={
									isListening
										? 'Stop listening'
										: 'Use voice input'
								}
								onClick={handleMicClick}
								disabled={isLoading || !isAvailable}
							>
								{isListening ? (
									<MicOff className="h-4 w-4" />
								) : (
									<Mic className="h-4 w-4" />
								)}
							</Button>
						</div>
						{!isAvailable && (
							<p className="text-xs text-red-600 mt-1">
								Speech recognition not available in this
								browser.
							</p>
						)}
					</div>

					{/* Submit Button */}
					<Button
						type="submit"
						disabled={isLoading || !topic.trim() || !apiKey?.trim()}
						className="w-full"
						size="lg"
					>
						{isLoading ? 'Generating...' : 'Create Story'}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
