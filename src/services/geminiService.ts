import { VOCABULARY_CONSTRAINTS } from '@/lib/vocabulary';
import type { ReadingLevel, StoryData } from '@/types';
import {
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
		const model = this.genAI.getGenerativeModel({ model: this.model });
		const prompt = this.constructPrompt(topic, readingLevel);
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

		if (!result.response) {
			throw new Error('Failed to generate story');
		}

		return this.parseResponse(result.response.text());
	}

	private constructPrompt(topic: string, level: ReadingLevel): string {
		return `Create a 6-panel children's storybook for a reader at the [${level === 'kindergarten' ? 'KINDERGARTEN' : '1ST GRADE'}] level.
The story should be about: [${topic}].

Reading Level Requirements:
${VOCABULARY_CONSTRAINTS[level].description}
- Use simple sentence structures
- Repeat new vocabulary words at least once

Format:
Title: (Story Title)
Panel 1 Text: (One or two simple sentences)
Panel 1 Image: (Visual description)
... continue for all 6 panels`;
	}

	private parseResponse(text: string): StoryData {
		const lines = text
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean);
		const story: StoryData = { title: 'My Story', panels: [] };

		for (const line of lines) {
			if (line.startsWith('Title:')) {
				story.title = line.replace('Title:', '').trim();
			} else if (line.match(/^Panel \d+ Text:/)) {
				const text = line.replace(/^Panel \d+ Text:/, '').trim();
				story.panels.push({
					text,
					imageData: '/placeholder-image.png',
					altText: `Illustration for panel ${story.panels.length + 1}`,
				});
			}
		}

		return story;
	}
}
