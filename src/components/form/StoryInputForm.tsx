'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
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
import { GeminiService } from '@/services/geminiService';
import { useStoryStore } from '@/store/storyStore';
import type { ReadingLevel } from '@/types';
import { Eye, EyeOff, HelpCircle, Mic, MicOff } from 'lucide-react';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';

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

	// State for API key visibility and transcription
	const [showApiKey, setShowApiKey] = useState(false);
	const [liveTranscript, setLiveTranscript] = useState('');
	const textPrefixRef = useRef(''); // Ref to store text before listening starts

	// Speech Recognition Hook Integration
	const { isListening, startListening, stopListening, isAvailable } =
		useSpeechRecognition({
			onTranscriptChange: (currentSessionTranscript) => {
				// During listening, just update the live transcript display
				// without changing the topic state
				setLiveTranscript(currentSessionTranscript);
			},
			onRecognitionEnd: () => {
				// Only update the actual topic when recording ends
				if (liveTranscript.trim()) {
					// If we have a prefix and new transcript
					if (textPrefixRef.current.trim() && liveTranscript.trim()) {
						setTopic(
							`${textPrefixRef.current.trim()} ${liveTranscript.trim()}`,
						);
					} else {
						// If we only have new transcript or only prefix
						setTopic(
							liveTranscript.trim() ||
								textPrefixRef.current.trim(),
						);
					}
				}
				setLiveTranscript('');
			},
		});

	const handleMicClick = () => {
		if (!isAvailable) {
			alert('Speech recognition is not available in your browser.');
			return;
		}
		if (isListening) {
			stopListening();
		} else {
			// Store current topic as the prefix before starting
			textPrefixRef.current = topic;
			setLiveTranscript(''); // Clear live transcript
			startListening();
		}
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (isListening) {
			stopListening();
		}
		if (!apiKey) {
			alert('Please enter your Gemini API Key.');
			return;
		}
		startLoading();
		console.log('Submitting:', { topic, readingLevel });

		// Create a new GeminiService instance with the user-provided API key
		const geminiService = new GeminiService(apiKey);

		try {
			// First validate the API key
			const isValidKey = await geminiService.validateApiKey();
			if (!isValidKey) {
				throw new Error(
					'Invalid API key. Please check your Gemini API key and try again.',
				);
			}

			// Generate the story
			const story = await geminiService.generateStory(
				topic,
				readingLevel,
			);
			setGeneratedStory(story);
		} catch (error) {
			console.error('Error generating story:', error);
			let errorMessage =
				'An error occurred while generating the story. Please try again.';

			if (error instanceof Error) {
				errorMessage = error.message;
			} else if (
				typeof error === 'object' &&
				error !== null &&
				'message' in error
			) {
				errorMessage = String(error.message);
			}

			setGeneratedStory(null, errorMessage);
		}
	};

	return (
		<Card className="w-full max-w-lg mx-auto">
			<CardHeader>
				<CardTitle className="text-center text-2xl">
					Create a Reading Story
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* API Key Input */}
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Label htmlFor="apiKey">Gemini API Key</Label>
							<Dialog>
								<DialogTrigger asChild>
									<HelpCircle className="h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700" />
								</DialogTrigger>
								<DialogContent className="sm:max-w-[425px]">
									<DialogHeader>
										<DialogTitle>
											Getting Your Gemini API Key
										</DialogTitle>
									</DialogHeader>
									<DialogDescription className="py-4">
										Generate your Gemini API Key by visiting{' '}
										<a
											href="https://aistudio.google.com/"
											target="_blank"
											rel="noopener noreferrer"
											className="underline text-indigo-600 hover:text-indigo-800"
										>
											Google AI Studio
										</a>
										. Look for the blue &apos;Get API
										Key&apos; button on the left side panel.
										You may need to create a new Google
										Cloud project to implement this.
									</DialogDescription>
								</DialogContent>
							</Dialog>
						</div>
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
							onValueChange={(value) =>
								setReadingLevel(value as ReadingLevel)
							}
							defaultValue={readingLevel}
						>
							<SelectTrigger id="readingLevel" className="w-full">
								<SelectValue placeholder="Select reading level" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="kindergarten">
									Kindergarten
								</SelectItem>
								<SelectItem value="firstGrade">
									First Grade
								</SelectItem>
								<SelectItem value="secondGrade">
									Second Grade
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
								value={
									isListening
										? `${topic}${topic ? ' ' : ''}${liveTranscript}`
										: topic
								}
								onChange={(e) => {
									if (!isListening) {
										// Only allow direct editing when not listening
										setTopic(e.target.value);
									}
								}}
								placeholder={
									isListening
										? 'Listening... speak now!'
										: "e.g., A panda's first day of school, A bunny learning to share..."
								}
								className={`pr-12 ${isListening ? 'bg-amber-50' : ''}`}
								rows={3}
								required
								disabled={isLoading}
								readOnly={isListening}
							/>
							<Button
								type="button"
								variant={
									isListening ? 'destructive' : 'outline'
								}
								size="icon"
								className={`absolute bottom-2 right-2 ${
									isLoading || !isAvailable
										? 'cursor-not-allowed'
										: ''
								} ${
									!isListening && isAvailable
										? 'hover:bg-green-100 hover:text-green-600 hover:border-green-300'
										: ''
								}`}
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
						className={`w-full ${
							topic.trim() && apiKey?.trim() && readingLevel
								? 'bg-indigo-600 hover:bg-indigo-700 text-white'
								: ''
						}`}
						size="lg"
					>
						{isLoading ? 'Generating...' : 'Create Story'}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
