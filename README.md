# Reading Story Creator

This is a [Next.js](https://nextjs.org/) web application designed to help parents create simple, illustrated stories for young children (Kindergarten / 1st Grade reading levels).

## Core Functionality (MVP)

*   **Story Generation:** Creates custom 5-panel stories with illustrations based on a user-provided topic/character and selected reading level (K or 1st grade).
*   **Input:** Accepts text input for the story idea. Voice input via Web Speech API is planned.
*   **API Integration:** Uses the Google Gemini API for generating story text and illustrations (requires user-provided API key).
*   **Interface:** Simple, mobile-friendly UI built with Shadcn components.
*   **Output:** 
    - Displays the story panel-by-panel with consistent image aspect ratios
    - Generates a single-page printable PDF with all panels in a 2-column grid layout
    - High-quality image rendering (2x scale) for crisp prints
    - Comic Sans MS font for child-friendly reading
*   **Technology:** 
    - Next.js (App Router), React, TypeScript, Tailwind CSS
    - Zustand for state management
    - Client-Side APIs (Gemini Pro for text, Gemini Vision Pro for images)
    - html2pdf.js for PDF generation with proper image handling
*   **Limitations:** No user accounts, no persistent storage beyond API key in local storage, standalone story experiences.

## Getting Started

1.  **Prerequisites:** Node.js (v18+ recommended), npm/yarn/pnpm.
2.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd reading-story-creator
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install / pnpm install
    ```
4.  **Environment Variables:** You will need a Google Gemini API key. While the app allows entering it directly, you can optionally create a `.env.local` file in the root directory for development:
    ```
    # .env.local
    # NEXT_PUBLIC_GEMINI_API_KEY=YOUR_API_KEY_HERE 
    # (Note: Currently the app reads/saves directly from/to local storage, 
    # .env usage is not implemented yet but might be in the future)
    ```
5.  **Run the development server:**
    ```bash
    npm run dev
    ```
6.  **Open your browser:** Navigate to [http://localhost:3000](http://localhost:3000).
7.  **Usage:** 
    - Enter your Gemini API key
    - Select a reading level
    - Type a story topic (e.g., "Pink Bear Goes to School")
    - Click "Create Story"
    - Once generated, click "Download PDF" to save a print-ready version

## Project Structure

*   `src/app/`: Main application routes and layouts (Next.js App Router).
*   `src/components/`: Reusable React components (UI, form, story elements).
*   `src/lib/`: Utility functions, constants (e.g., vocabulary lists).
*   `src/services/`: 
    - `geminiService.ts`: Handles story generation with Gemini API
    - `pdfService.ts`: Manages PDF creation with proper image handling
*   `src/store/`: Zustand state management store.
*   `src/hooks/`: Custom React hooks (e.g., for speech recognition).
*   `src/types/`: TypeScript type definitions.
*   `public/`: Static assets (images, fonts).
*   `docs/`: Project documentation (PRD, Tech Spec).

## Recent Updates

*   Transitioned from 6-panel to 5-panel story format for better pacing
*   Enhanced PDF generation:
    - Single-page layout with 2-column grid
    - Consistent image aspect ratios (4:3)
    - Improved text formatting with Comic Sans MS
    - High-quality image rendering for printing
*   Improved error handling for API calls and PDF generation
*   Added loading states and progress feedback

(This README reflects the current MVP implementation. Features and implementation details continue to evolve.)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
