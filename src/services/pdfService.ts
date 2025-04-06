import type { StoryData } from '@/types';
import html2pdf from 'html2pdf.js';

function createPanelElement(
	panel: { text: string; imageData: string; altText: string },
	panelNumber: number,
): HTMLDivElement {
	console.log(`Creating panel ${panelNumber}:`, {
		hasText: !!panel.text,
		imageDataLength: panel.imageData.length,
		altText: panel.altText,
	});

	const panelDiv = document.createElement('div');
	panelDiv.style.cssText = `
		all: initial;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 2rem;
		padding: 1rem;
		background-color: #ffffff;
		font-family: Comic Sans MS, cursive, sans-serif;
	`;

	// Image container with aspect ratio preservation
	const imageContainer = document.createElement('div');
	imageContainer.style.cssText = `
		all: initial;
		display: block;
		width: 100%;
		max-width: 7.5in;
		aspect-ratio: 4/3;
		position: relative;
		margin-bottom: 1rem;
		background-color: #f3f4f6;
	`;

	const img = document.createElement('img');
	img.src = panel.imageData;
	img.alt = panel.altText;
	img.style.cssText = `
		all: initial;
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
	`;

	// Add load event listener to debug image loading
	img.addEventListener('load', () => {
		console.log(`Image for panel ${panelNumber} loaded successfully`);
	});

	img.addEventListener('error', (e) => {
		console.error(`Error loading image for panel ${panelNumber}:`, e);
	});

	imageContainer.appendChild(img);
	panelDiv.appendChild(imageContainer);

	// Text content
	const text = document.createElement('p');
	text.style.cssText = `
		all: initial;
		display: block;
		font-family: Comic Sans MS, cursive, sans-serif;
		font-size: 18px;
		line-height: 1.5;
		margin: 0;
		text-align: center;
		max-width: 7.5in;
		color: #1f2937;
		padding: 1rem;
	`;
	text.textContent = panel.text;

	panelDiv.appendChild(text);
	return panelDiv;
}

function createPDFContainer(story: StoryData): HTMLDivElement {
	console.log('Creating PDF container with story:', {
		title: story.title,
		numberOfPanels: story.panels.length,
	});

	const container = document.createElement('div');
	container.style.cssText = `
		all: initial;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1in 0.5in;
		background-color: #ffffff;
		font-family: Comic Sans MS, cursive, sans-serif;
		width: 8.5in;
		min-height: 11in;
	`;

	// Add title
	const title = document.createElement('h1');
	title.style.cssText = `
		all: initial;
		display: block;
		font-family: Comic Sans MS, cursive, sans-serif;
		font-size: 32px;
		font-weight: bold;
		text-align: center;
		margin-bottom: 2rem;
		color: #1f2937;
		width: 100%;
	`;
	title.textContent = story.title;
	container.appendChild(title);

	// Add all panels
	story.panels.forEach((panel, index) => {
		const panelElement = createPanelElement(panel, index + 1);
		container.appendChild(panelElement);
	});

	return container;
}

export async function generatePDF(story: StoryData): Promise<void> {
	console.log('Starting PDF generation for story:', story.title);

	// Create a new container with all panels
	const container = createPDFContainer(story);

	// Configure PDF options
	const opt = {
		filename: `${story.title.replace(/\s+/g, '-').toLowerCase()}.pdf`,
		image: { type: 'jpeg', quality: 0.98 },
		html2canvas: {
			scale: 2,
			useCORS: true,
			backgroundColor: '#ffffff',
			logging: true, // Enable html2canvas logging
			onclone: (doc) => {
				console.log('Document cloned for PDF generation');
				const clonedContainer = doc.body.firstChild as HTMLElement;
				console.log('Cloned container dimensions:', {
					width: clonedContainer.offsetWidth,
					height: clonedContainer.offsetHeight,
					children: clonedContainer.children.length,
				});
			},
		},
		jsPDF: {
			unit: 'in',
			format: 'letter',
			orientation: 'portrait' as const,
		},
		pagebreak: { mode: 'avoid-all' },
	};

	try {
		// Add container to document
		document.body.appendChild(container);
		console.log('Container added to document, dimensions:', {
			width: container.offsetWidth,
			height: container.offsetHeight,
			children: container.children.length,
		});

		// Generate PDF
		console.log('Starting html2pdf conversion...');
		await html2pdf().set(opt).from(container).save();
		console.log('PDF generation completed');

		// Cleanup
		document.body.removeChild(container);
	} catch (error) {
		console.error('Error during PDF generation:', error);
		if (container.parentNode) {
			container.parentNode.removeChild(container);
		}
		throw error;
	}
}
