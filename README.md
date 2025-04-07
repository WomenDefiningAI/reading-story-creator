# Reading Story Creator

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FWomenDefiningAI%2Freading-story-creator)

Try it live: [reading-story-creator.vercel.app](https://reading-story-creator.vercel.app/)

This is a Next.js web application designed to help parents and educators create simple, illustrated stories for young children (Kindergarten, 1st Grade, and 2nd Grade reading levels).

![Input Page Screenshot](public/images/input-page.png)
_Main input form_

![Story Panel Screenshot](public/images/story-panel.png)
_Example generated story panel_

## Core Functionality

*   **Story Generation:** Creates custom 5-panel stories with illustrations based on a user-provided topic/character and selected reading level (K, 1st, or 2nd grade).
*   **Input:** Accepts text input for the story idea. Voice input via Web Speech API is available in supported browsers.
*   **API Integration:** Uses the Google Gemini API for generating story text and illustrations (requires user-provided API key, with a helper modal linking to Google AI Studio for key generation).
*   **Vocabulary Control:** Guides story generation using grade-appropriate vocabulary lists (based on Dolch, Fry, and common high-frequency words) and constraints for sentence length and new word introduction.
*   **Interface:** Simple, mobile-friendly UI.
*   **Output:**
    *   Displays the generated story panel-by-panel.
    *   Generates a printable PDF with all panels.
*   **Footer:** Includes links to the Women Defining AI community and the project's GitHub repository.

## Getting Started

1.  **Prerequisites:** Node.js (v18+ recommended), npm/yarn/pnpm.
2.  **Clone the repository:**
    ```bash
    git clone https://github.com/WomenDefiningAI/reading-story-creator.git
    cd reading-story-creator
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install / pnpm install
    ```
4.  **Environment Variables (Optional):** While the app allows entering the Google Gemini API key directly (stored in local storage), you can optionally create a `.env.local` file for development if preferred (note: direct local storage use is the primary method currently implemented).
    ```
    # .env.local
    # NEXT_PUBLIC_GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```
5.  **Run the development server:**
    ```bash
    npm run dev
    ```
6.  **Open your browser:** Navigate to <http://localhost:3000>.
7.  **Usage:**
    *   Enter your Gemini API key (use the ' ? ' icon for help).
    *   Select a reading level (Kindergarten, 1st Grade, or 2nd Grade).
    *   Type or speak a story topic (e.g., "A brave little boat finds a friend").
    *   Click "Create Story".
    *   Once generated, view the story and click "Download PDF" to save a print-ready version.

## Project Structure

*   `src/app/`: Main application routes and layout (Next.js App Router).
*   `src/components/`: Reusable React components (UI, form, story elements, layout).
*   `src/hooks/`: Custom React hooks (speech recognition, local storage).
*   `src/lib/`: Utility functions, constants (vocabulary lists/constraints).
*   `src/services/`: API interaction (Gemini, PDF generation).
*   `src/store/`: Zustand state management store.
*   `src/types/`: TypeScript type definitions.
*   `public/`: Static assets.
*   `docs/`: Project documentation.

## Technology Stack

*   Framework: Next.js (App Router)
*   Language: TypeScript
*   Styling: Tailwind CSS
*   UI Components: Shadcn/ui
*   State Management: Zustand
*   Linting/Formatting: Biome.js
*   APIs: Google Gemini (Client-Side), Web Speech API
*   PDF Generation: html2pdf.js

## Contributing

This project is developed by the [Women Defining AI](https://www.womendefiningai.com/) community. Contributions are welcome!

## Deployment

Deployed via Vercel: [reading-story-creator.vercel.app](https://reading-story-creator.vercel.app/)

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
