'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Use built-in types for Web Speech API (usually provided by @types/dom-speech-recognition)

// Define options for the hook
export type UseSpeechRecognitionOptions = {
	onTranscriptChange?: (transcript: string) => void;
	onRecognitionEnd?: () => void;
	onError?: (error: SpeechRecognitionErrorCode, message: string) => void;
};

export function useSpeechRecognition({
	onTranscriptChange,
	onRecognitionEnd,
	onError,
}: UseSpeechRecognitionOptions = {}) {
	const [isListening, setIsListening] = useState(false);
	const [currentTranscript, setCurrentTranscript] = useState(''); // Renamed for clarity
	const [isAvailable, setIsAvailable] = useState(false);
	const recognitionRef = useRef<SpeechRecognition | null>(null);

	useEffect(() => {
		// Check for API availability on the window object
		const SpeechRecognitionAPI =
			window.SpeechRecognition || window.webkitSpeechRecognition;
		if (typeof SpeechRecognitionAPI !== 'undefined') {
			setIsAvailable(true);
			if (!recognitionRef.current) {
				// Initialize only once
				recognitionRef.current = new SpeechRecognitionAPI();
				recognitionRef.current.continuous = true;
				recognitionRef.current.interimResults = true;
				recognitionRef.current.lang = 'en-US';
			}
		} else {
			setIsAvailable(false);
			console.warn(
				'Web Speech Recognition API is not supported in this browser.',
			);
		}

		// Cleanup function to abort recognition if component unmounts
		return () => {
			recognitionRef.current?.abort();
		};
	}, []); // Run only on mount

	useEffect(() => {
		const recognition = recognitionRef.current;
		// Ensure recognition instance exists before attaching listeners
		if (!recognition) return;

		const handleResult = (event: SpeechRecognitionEvent) => {
			let finalTranscript = '';
			let interimTranscript = '';

			for (let i = event.resultIndex; i < event.results.length; ++i) {
				const transcriptPart = event.results[i][0].transcript;
				if (event.results[i].isFinal) {
					finalTranscript += transcriptPart;
				} else {
					interimTranscript += transcriptPart;
				}
			}

			// Combine final and interim results for live feedback
			const fullTranscript = finalTranscript + interimTranscript;
			setCurrentTranscript(fullTranscript);
			onTranscriptChange?.(fullTranscript);
		};

		const handleError = (event: SpeechRecognitionErrorEvent) => {
			console.error(
				'Speech recognition error:',
				event.error,
				event.message,
			);
			setIsListening(false); // Stop listening state on error
			onError?.(event.error, event.message);
		};

		const handleStart = () => {
			setIsListening(true);
		};

		const handleEnd = () => {
			setIsListening(false);
			// setCurrentTranscript(''); // Decide if transcript should clear on stop
			onRecognitionEnd?.();
		};

		// Attach event listeners
		recognition.addEventListener('result', handleResult);
		recognition.addEventListener('error', handleError);
		recognition.addEventListener('start', handleStart);
		recognition.addEventListener('end', handleEnd);

		// Cleanup function to remove listeners
		return () => {
			recognition.removeEventListener('result', handleResult);
			recognition.removeEventListener('error', handleError);
			recognition.removeEventListener('start', handleStart);
			recognition.removeEventListener('end', handleEnd);
		};
	}, [onTranscriptChange, onRecognitionEnd, onError]); // Re-attach if callbacks change

	const startListening = useCallback(() => {
		const recognition = recognitionRef.current;
		if (recognition && !isListening) {
			setCurrentTranscript(''); // Clear previous transcript before starting
			try {
				recognition.start();
			} catch (error) {
				// Handle potential errors if recognition is already started
				console.error('Error starting speech recognition:', error);
				if (
					error instanceof Error &&
					error.name === 'InvalidStateError'
				) {
					// Already started, maybe stop and restart?
					recognition.stop(); // Attempt to stop gracefully
				} else {
					setIsListening(false); // Ensure state is correct if start fails unexpectedly
				}
			}
		}
	}, [isListening]);

	const stopListening = useCallback(() => {
		const recognition = recognitionRef.current;
		if (recognition && isListening) {
			recognition.stop();
			// onend listener handles setting isListening to false
		}
	}, [isListening]);

	return {
		isListening,
		transcript: currentTranscript, // Expose the latest transcript
		isAvailable,
		startListening,
		stopListening,
	};
}
