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
		return `Create a 5-panel storybook for a [${level === 'kindergarten' ? 'KINDERGARTEN' : '1ST GRADE'}] reader about [${topic}].

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
Panel 5: Happy ending and resolution

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

(Continue this pattern for all 5 panels)

Remember to:
- Use ONLY approved vocabulary words
- Keep sentences very simple
- Make the story flow naturally from panel to panel
- Generate an illustration for each panel based on your description`;
	}

	private parseResponse(
		response: EnhancedGenerateContentResponse,
	): StoryData {
		console.log('=== START RESPONSE PARSING ===');
		const story: StoryData = { title: 'My Story', panels: [] };
		let currentPanelNumber = 0;
		let pendingImagePanelNumber = 0;

		const parts = response.candidates?.[0]?.content?.parts || [];
		console.log('Total number of parts in response:', parts.length);
		console.log(
			'Full response structure:',
			JSON.stringify(response, null, 2),
		);

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			console.log(`\nProcessing part ${i + 1}/${parts.length}:`, part);

			if (part.text) {
				console.log('\nText part found:', part.text);
				const lines = part.text
					.split('\n')
					.map((line) => line.trim())
					.filter(Boolean);

				console.log('Processed lines:', lines);

				for (const line of lines) {
					if (line.startsWith('Title:')) {
						story.title = line.replace('Title:', '').trim();
						console.log('Found title:', story.title);
					} else if (line.match(/^Panel \d+ Text:/)) {
						const panelNum = Number.parseInt(
							line.match(/^Panel (\d+) Text:/)?.[1] || '0',
						);
						currentPanelNumber = panelNum;
						const text = line
							.replace(/^Panel \d+ Text:/, '')
							.trim();
						console.log(
							`Found panel ${currentPanelNumber} text:`,
							text,
						);

						story.panels.push({
							text: text,
							imageData: '/placeholderimage1.png',
							altText: `Illustration for panel ${currentPanelNumber}`,
						});
						console.log('Current panels array:', story.panels);
					} else if (line.match(/^Panel \d+ Image:/)) {
						pendingImagePanelNumber = Number.parseInt(
							line.match(/^Panel (\d+) Image:/)?.[1] || '0',
						);
						console.log(
							`Now expecting image for panel ${pendingImagePanelNumber}`,
						);
					}
				}
			} else if (part.inlineData && pendingImagePanelNumber > 0) {
				console.log(
					`\nFound image data part for panel ${pendingImagePanelNumber}`,
				);
				console.log('Image MIME type:', part.inlineData.mimeType);
				console.log('Image data length:', part.inlineData.data.length);

				const panelIndex = pendingImagePanelNumber - 1;
				if (panelIndex < story.panels.length) {
					story.panels[panelIndex] = {
						text: story.panels[panelIndex].text,
						imageData: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
						altText: `Illustration for panel ${pendingImagePanelNumber}`,
					};
					console.log(
						`Updated image for panel ${pendingImagePanelNumber}`,
					);
					pendingImagePanelNumber = 0; // Reset after using
				} else {
					console.log(
						`Warning: Cannot find panel ${pendingImagePanelNumber} to update image`,
					);
				}
			}
		}

		console.log('\n=== FINAL STORY STATE ===');
		console.log('Title:', story.title);
		console.log('Number of panels:', story.panels.length);
		story.panels.forEach((panel, index) => {
			console.log(`Panel ${index + 1}:`, {
				text: panel.text,
				hasImage: !panel.imageData.includes('placeholderimage1.png'),
			});
		});
		console.log('=== END RESPONSE PARSING ===');

		return story;
	}
}
