import { VOCABULARY_CONSTRAINTS } from '@/lib/vocabulary';
import type { ReadingLevel, StoryData } from '@/types';
import {
	type EnhancedGenerateContentResponse,
	type GenerateContentRequest,
	GoogleGenerativeAI,
} from '@google/generative-ai';

export class GeminiService {
	private genAI: GoogleGenerativeAI;
	private model = 'gemini-2.0-flash-exp-image-generation';

	constructor(apiKey: string) {
		this.genAI = new GoogleGenerativeAI(apiKey);
	}

	async validateApiKey(): Promise<boolean> {
		try {
			const model = this.genAI.getGenerativeModel({ model: this.model });
			const result = await model.generateContent({
				contents: [
					{
						role: 'user',
						parts: [{ text: 'Hello' }],
					},
				],
				generationConfig: {
					responseModalities: ['Text', 'Image'],
				},
			} as GenerateContentRequest);
			return result.response !== null;
		} catch (error) {
			console.error('API key validation error:', error);
			return false;
		}
	}

	async generateStory(
		topic: string,
		readingLevel: ReadingLevel,
	): Promise<StoryData> {
		try {
			console.log('Starting story generation:', { topic, readingLevel });
			const model = this.genAI.getGenerativeModel({ model: this.model });
			const prompt = this.constructPrompt(topic, readingLevel);
			console.log('Generated prompt:', prompt);

			const result = await model.generateContent({
				contents: [
					{
						role: 'user',
						parts: [{ text: prompt }],
					},
				],
				generationConfig: {
					responseModalities: ['Text', 'Image'],
				},
			} as GenerateContentRequest);

			console.log('Received response:', result);

			if (!result.response) {
				throw new Error('Failed to generate story');
			}

			const story = this.parseResponse(result.response);
			console.log('Parsed story:', story);
			return story;
		} catch (error) {
			console.error('Error in story generation:', error);
			throw error;
		}
	}

	private constructPrompt(topic: string, level: ReadingLevel): string {
		return `Create a 6-panel storybook for a [${level === 'kindergarten' ? 'KINDERGARTEN' : '1ST GRADE'}] reader about [${topic}].

Reading Level Requirements:
${VOCABULARY_CONSTRAINTS[level].description}
- Keep sentences very short
- You may introduce up to 5 simple new words that a child can sound out
- Make sure to repeat new vocabulary words at least once in the story to help with learning

Story Structure:
Panel 1: Introduction of characters and clearly defined setting
Panel 2: Introduction of story problem or goal
Panel 3: First attempt or action
Panel 4: Challenge or complication
Panel 5: Resolution begins
Panel 6: Happy ending

For each panel, I need you to:
1. First write "Panel X Text:" followed by ONE or TWO simple sentences using appropriate vocabulary
2. Then write "Panel X Image:" followed by a detailed illustration description that:
   - Shows the characters in action within a rich, relevant environment
   - Includes background elements that relate to the story setting
   - Features dynamic poses and expressions that convey emotion
   - Shows interaction with objects or environment elements
   - Maintains consistent character appearance across panels
3. After each image description, generate the corresponding illustration

Please format your response exactly like this:
Title: (Use a simple, engaging name with sight words)

Panel 1 Text: (One or two simple sentences)
Panel 1 Image: (Detailed illustration description)
[Generate illustration]

Panel 2 Text: (One or two simple sentences)
Panel 2 Image: (Detailed illustration description)
[Generate illustration]

(Continue this pattern for all 6 panels)

Remember to:
- Use ONLY approved vocabulary words
- Keep sentences very simple
- Make the story flow naturally from panel to panel
- Generate an illustration for each panel based on your description`;
	}

	private parseResponse(
		response: EnhancedGenerateContentResponse,
	): StoryData {
		console.log('Starting response parsing');
		const story: StoryData = { title: 'My Story', panels: [] };
		let currentText: string | null = null;
		let currentPanel = 1;

		const parts = response.candidates?.[0]?.content?.parts || [];
		console.log('Response parts:', JSON.stringify(parts, null, 2));

		for (const part of parts) {
			if (part.text) {
				console.log('Processing text part:', part.text);
				const lines = part.text
					.split('\n')
					.map((line) => line.trim())
					.filter(Boolean);

				for (const line of lines) {
					if (line.startsWith('Title:')) {
						story.title = line.replace('Title:', '').trim();
						console.log('Found title:', story.title);
					} else if (line.match(/^Panel \d+ Text:/)) {
						if (currentText) {
							// Store previous panel with placeholder if we didn't get an image
							story.panels.push({
								text: currentText,
								imageData: '/placeholder-image.png',
								altText: `Illustration for panel ${currentPanel}`,
							});
						}
						currentText = line
							.replace(/^Panel \d+ Text:/, '')
							.trim();
						currentPanel++;
						console.log('Found panel text:', currentText);
					}
				}
			} else if (part.inlineData && currentText) {
				console.log('Found image data for panel', currentPanel - 1);
				// Replace the placeholder or add new panel
				const panelIndex = story.panels.length - 1;
				const panel = {
					text: currentText,
					imageData: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
					altText: `Illustration for panel ${currentPanel - 1}`,
				};

				if (
					panelIndex >= 0 &&
					story.panels[panelIndex].text === currentText
				) {
					// Replace the placeholder
					story.panels[panelIndex] = panel;
				} else {
					// Add new panel
					story.panels.push(panel);
				}
				currentText = null;
			}
		}

		// Add final panel if we have text without image
		if (currentText) {
			story.panels.push({
				text: currentText,
				imageData: '/placeholder-image.png',
				altText: `Illustration for panel ${currentPanel - 1}`,
			});
		}

		console.log('Final story data:', JSON.stringify(story, null, 2));
		return story;
	}
}
