import type { StoryData } from '@/types';
import html2pdf from 'html2pdf.js';

function createPanelElement(
	panel: { text: string; imageData: string; altText: string },
	panelNumber: number,
): { element: HTMLDivElement; imageLoadPromise: Promise<void> } {
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
	const imageLoadPromise = new Promise<void>((resolve, reject) => {
		img.onload = () => {
			console.log(`Image for panel ${panelNumber} loaded successfully`);
			resolve();
		};
		img.onerror = (e) => {
			console.error(`Error loading image for panel ${panelNumber}:`, e);
			reject(e);
		};
	});

	img.src = panel.imageData;
	img.alt = panel.altText;
	img.style.cssText = `
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
	`;

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
	return { element: panelDiv, imageLoadPromise };
}

function createPDFContainer(story: StoryData): {
	container: HTMLDivElement;
	imageLoadPromises: Promise<void>[];
} {
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
	const imageLoadPromises: Promise<void>[] = [];
	story.panels.forEach((panel, index) => {
		const { element, imageLoadPromise } = createPanelElement(
			panel,
			index + 1,
		);
		gridContainer.appendChild(element);
		imageLoadPromises.push(imageLoadPromise);
	});

	container.appendChild(gridContainer);
	return { container, imageLoadPromises };
}

export async function generatePDF(story: StoryData): Promise<void> {
	console.log('Starting PDF generation for story:', story.title);

	// Create a new container with all panels
	const { container, imageLoadPromises } = createPDFContainer(story);

	// Configure PDF options
	const opt = {
		filename: `${story.title.replace(/\s+/g, '-').toLowerCase()}.pdf`,
		image: { type: 'jpeg', quality: 0.98 },
		html2canvas: {
			scale: 2,
			useCORS: true,
			backgroundColor: '#ffffff',
			logging: true,
			windowWidth: 816, // Match container width
			windowHeight: 1056, // Match container height
			onclone: (doc: Document) => {
				const clonedContainer = doc.body.firstChild as HTMLElement;
				// Force dimensions on the cloned container
				if (clonedContainer) {
					clonedContainer.style.width = '8.5in';
					clonedContainer.style.height = '11in';
					clonedContainer.style.padding = '0.5in';
					// Force display mode
					clonedContainer.style.display = 'block';
					// Force visibility
					clonedContainer.style.visibility = 'visible';
					clonedContainer.style.position = 'relative';
				}
				console.log('Document cloned for PDF generation');
				console.log('Cloned container dimensions:', {
					width: clonedContainer?.offsetWidth,
					height: clonedContainer?.offsetHeight,
					children: clonedContainer?.children.length,
				});
			},
		},
		jsPDF: {
			unit: 'in',
			format: 'letter',
			orientation: 'portrait' as const,
		},
		pagebreak: { mode: 'avoid-all' },
		margin: 0,
	};

	try {
		// Add container to document
		document.body.appendChild(container);
		console.log('Container added to document, dimensions:', {
			width: container.offsetWidth,
			height: container.offsetHeight,
			children: container.children.length,
		});

		// Wait for all images to load before generating PDF
		console.log('Waiting for all images to load...');
		await Promise.all(imageLoadPromises);
		console.log('All images loaded successfully');

		// Add a small delay to ensure layout is complete
		await new Promise((resolve) => setTimeout(resolve, 100));

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
