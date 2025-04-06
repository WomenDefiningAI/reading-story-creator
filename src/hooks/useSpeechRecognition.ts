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
	const finalTranscriptRef = useRef(''); // Keep track of finalized segments
	const forcefulStopRef = useRef(false); // Track when user explicitly stops

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
		const recognition = recognitionRef.current;
		return () => {
			recognition?.abort();
		};
	}, []);

	useEffect(() => {
		const recognition = recognitionRef.current;
		// Ensure recognition instance exists before attaching listeners
		if (!recognition) return;

		const handleResult = (event: SpeechRecognitionEvent) => {
			let interimTranscript = '';

			for (let i = event.resultIndex; i < event.results.length; ++i) {
				const transcriptPart = event.results[i][0].transcript;
				if (event.results[i].isFinal) {
					// Accumulate final results in our ref
					finalTranscriptRef.current += ` ${transcriptPart}`;
				} else {
					interimTranscript += transcriptPart;
				}
			}

			// Trim any extra spaces
			finalTranscriptRef.current = finalTranscriptRef.current.trim();

			// Combine final accumulated results with current interim results
			const fullTranscript =
				`${finalTranscriptRef.current} ${interimTranscript}`.trim();
			setCurrentTranscript(fullTranscript);

			// Only notify if we have something meaningful
			if (fullTranscript) {
				onTranscriptChange?.(fullTranscript);
			}
		};

		const handleError = (event: SpeechRecognitionErrorEvent) => {
			console.error(
				'Speech recognition error:',
				event.error,
				event.message,
			);

			// Only end the session on fatal errors, not on no-speech
			if (event.error !== 'no-speech') {
				setIsListening(false);
				onError?.(event.error, event.message);
			}
		};

		const handleStart = () => {
			setIsListening(true);
		};

		const handleEnd = () => {
			// If we're still supposed to be listening AND not forcefully stopped,
			// restart the recognition
			if (isListening && recognition && !forcefulStopRef.current) {
				try {
					recognition.start();
					return; // Don't set isListening to false if we're restarting
				} catch (error) {
					console.error('Failed to restart after pause:', error);
					// Continue to end handling if restart fails
				}
			}

			// Reset the forceful stop flag when we actually end
			forcefulStopRef.current = false;

			setIsListening(false);
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
	}, [onTranscriptChange, onRecognitionEnd, onError, isListening]);

	const startListening = useCallback(() => {
		const recognition = recognitionRef.current;
		if (recognition && !isListening) {
			forcefulStopRef.current = false; // Reset the forceful stop flag
			setCurrentTranscript(''); // Clear current transcript display
			finalTranscriptRef.current = ''; // Reset accumulated transcript
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
			forcefulStopRef.current = true; // Mark this as a forceful stop
			setIsListening(false); // Set this immediately to prevent auto-restart
			recognition.stop();
		}
	}, [isListening]);

	return {
		isListening,
		transcript: currentTranscript,
		isAvailable,
		startListening,
		stopListening,
	};
}
