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
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #ffffff;
		font-family: Comic Sans MS, cursive, sans-serif;
		padding: 0.5rem;
		height: 100%;
	`;

	// Image container with aspect ratio preservation
	const imageContainer = document.createElement('div');
	imageContainer.style.cssText = `
		display: block;
		width: 100%;
		aspect-ratio: 4/3;
		position: relative;
		margin-bottom: 0.5rem;
		background-color: #f3f4f6;
	`;

	const img = document.createElement('img');
	img.src = panel.imageData;
	img.alt = panel.altText;
	img.style.cssText = `
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
	`;

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
		display: block;
		font-family: Comic Sans MS, cursive, sans-serif;
		font-size: 14px;
		line-height: 1.4;
		margin: 0;
		text-align: center;
		color: #1f2937;
		padding: 0.5rem;
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
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.5in;
		background-color: #ffffff;
		font-family: Comic Sans MS, cursive, sans-serif;
		width: 8.5in;
		height: 11in;
	`;

	// Add title
	const title = document.createElement('h1');
	title.style.cssText = `
		display: block;
		font-family: Comic Sans MS, cursive, sans-serif;
		font-size: 24px;
		font-weight: bold;
		text-align: center;
		margin: 0 0 1rem 0;
		color: #1f2937;
		width: 100%;
	`;
	title.textContent = story.title;
	container.appendChild(title);

	// Create grid container for panels
	const gridContainer = document.createElement('div');
	gridContainer.style.cssText = `
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-gap: 1rem;
		width: 100%;
		height: calc(100% - 3rem);
	`;

	// Add all panels to the grid
	story.panels.forEach((panel, index) => {
		const panelElement = createPanelElement(panel, index + 1);
		gridContainer.appendChild(panelElement);
	});

	container.appendChild(gridContainer);
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
			logging: true,
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
