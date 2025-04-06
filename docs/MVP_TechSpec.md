# Technical Specification: Reading Story Creator

## 1. System Architecture

### 1.1 Overview
The Reading Story Creator is a client-side web application built with Next.js that leverages the Gemini API for story generation and illustrations. The application is entirely frontend-driven with no backend server component, utilizing browser APIs for speech recognition and local storage for API keys.

### 1.2 Component Diagram
```
+-------------------------------+
|        Next.js Frontend       |
+-------------------------------+
|                               |
| +---------------------------+ |
| |      UI Components        | |
| | - Story Input Form        | |
| | - Voice Input Control     | |
| | - Panel Display           | |
| | - Navigation Controls     | |
| | - PDF Generation          | |
| +---------------------------+ |
|                               |
| +---------------------------+ |
| |      Core Services        | |
| | - Story Generation        | |
| | - Speech Recognition      | |
| | - Local Storage           | |
| +---------------------------+ |
|                               |
| +---------------------------+ |
| |   External Integrations   | |
| | - Gemini API              | |
| | - Web Speech API          | |
| | - HTML2PDF                | |
| +---------------------------+ |
|                               |
+-------------------------------+
```

## 2. Technical Dependencies

### 2.1 Frontend Framework
- **Next.js**: v14.0.0+ (App Router)
- **React**: v19.0.0+
- **TypeScript**: v5.0.0+

### 2.2 UI Components
- **Tailwind CSS**: v3.3.0+ for styling
- **Shadcn/ui**: Latest version for component library
- **Lucide React**: For icons
- **React Hook Form**: For form handling and validation

### 2.3 External APIs
- **Gemini API**: For story generation and illustrations
- **Web Speech API**: Native browser API for speech recognition

### 2.4 Utilities
- **html2pdf.js**: For PDF generation
- **Zustand**: For lightweight state management 
- **Next.js local storage**: For API key storage

## 3. Component Specifications

### 3.1 Story Input Form Component
- Single text input field for character/topic
- Reading level selection (Kindergarten/1st Grade)
- API key input field (with option to save to local storage)
- Submit button with loading state
- Form validation

### 3.2 Voice Input Component
```typescript
interface VoiceInputProps {
  onTranscriptComplete: (transcript: string) => void;
  placeholder?: string;
}
```
- Microphone button with three states (idle, listening, processing)
- Visual feedback during recording (animation, sound wave visualization)
- Transcript preview with confirmation/cancellation
- Error handling for unsupported browsers

### 3.3 Panel Navigation Component
```typescript
interface PanelNavigationProps {
  currentPanel: number;
  totalPanels: number;
  onNavigate: (panelIndex: number) => void;
  allowDownload: boolean;
  onDownload: () => void;
}
```
- Previous/Next buttons
- Panel indicator (e.g., "Panel 3 of 6")
- Download/Save button

### 3.4 Story Panel Component
```typescript
interface StoryPanelProps {
  panel: {
    text: string;
    imageUrl: string;
    altText: string;
  };
  panelNumber: number;
}
```
- Image display with appropriate sizing for mobile
- Text display beneath image
- Consistent styling across all panels

## 4. API Integrations

### 4.1 Gemini API Integration
```typescript
interface StoryGenerationParams {
  prompt: string;
  readingLevel: 'kindergarten' | 'firstGrade';
  apiKey: string;
}

interface StoryPanel {
  text: string;
  imageData: string; // base64 encoded image
  altText: string;
}

interface StoryResponse {
  title: string;
  panels: StoryPanel[];
  error?: string;
}
```

- API key validation before submission
- Structured prompt formatting based on reading level
- Error handling for API failures
- Rate limiting feedback

### 4.2 Web Speech API Integration
```typescript
interface SpeechRecognitionOptions {
  continuous?: boolean;
  lang?: string;
  interimResults?: boolean;
  maxAlternatives?: number;
}

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}
```

- Browser compatibility detection
- Language settings (default: 'en-US')
- Error handling with graceful fallback to text input
- Confidence threshold for transcript accuracy

## 5. State Management

### 5.1 Application States
- **Initial State**: Form input view
- **Loading State**: During API call
- **Success State**: Story display with navigation
- **Error State**: API error or generation failure

### 5.2 Data Flow
1. User inputs story parameters (text or voice)
2. Form validation
3. API request to Gemini
4. Process and format response
5. Display story panels
6. Enable navigation and download options

## 6. UI/UX Specifications

### 6.1 Responsive Breakpoints
- **Mobile**: 320px - 639px
- **Tablet**: 640px - 1023px
- **Desktop**: 1024px+

### 6.2 Color Palette
- Primary: `#4F46E5` (indigo-600)
- Secondary: `#10B981` (emerald-500)
- Background: `#FFFFFF` (white)
- Text: `#1F2937` (gray-800)
- Accent: `#F59E0B` (amber-500)
- Error: `#EF4444` (red-500)

### 6.3 Typography
- Heading: Inter, 24px (mobile), 32px (desktop)
- Body: Inter, 16px (mobile), 18px (desktop)
- Story Text: Comic Sans MS or similar child-friendly font, 20px

### 6.4 Animation Specifications
- Microphone pulse animation: 1s ease-in-out infinite
- Panel transition: 300ms ease
- Loading spinner: 750ms linear infinite

## 7. Performance Considerations

### 7.1 Optimization Strategies
- Use Next.js Image component for optimized image loading
- Lazy load panels beyond the current view
- Implement debounce for voice input processing
- Use React.memo for panel components to prevent unnecessary re-renders

### 7.2 Performance Targets
- Time to First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- First Input Delay: < 100ms
- Cumulative Layout Shift: < 0.1

## 8. Gemini API Prompt Engineering

### 8.1 Base Prompt Structure
```
Create a 6-panel storybook for a [READING_LEVEL] reader about [USER_INPUT].

Reading level requirements:
[VOCABULARY_CONSTRAINTS_BASED_ON_LEVEL]

For each panel:
- Write ONE or TWO simple sentences using appropriate vocabulary
- Generate a detailed illustration that:
  * Shows the characters in action within a rich, relevant environment
  * Includes background elements that relate to the story setting
  * Features dynamic poses and expressions that convey emotion
  * Shows interaction with objects or environment elements mentioned in the text
  * Maintains consistent character appearance across panels

Panel 1: Introduction of characters and setting
Panel 2: Introduction of story problem or goal
Panel 3: First attempt or action
Panel 4: Challenge or complication
Panel 5: Resolution begins
Panel 6: Happy ending

Title the story with a simple, engaging name using sight words when possible.
```

### 8.2 Reading Level Specifications
**Kindergarten Vocabulary Constraints:**
```
Use ONLY these sight words: a, and, away, big, blue, can, come, down, find, for, funny, go, help, here, I, in, is, it, jump, little, look, make, me, my, not, one, play, red, run, said, see, the, three, to, two, up, we, where, yellow, you
You may introduce up to 5 simple new words that a child can sound out
Keep sentences very short
Make sure to repeat new vocabulary words at least once in the story to help with learning
```

**1st Grade Vocabulary Constraints:**
```
Use the Kindergarten words plus: all, am, are, at, ate, be, black, brown, but, came, did, do, eat, four, get, good, have, he, into, like, must, new, no, now, on, our, out, please, pretty, ran, ride, saw, say, she, so, soon, that, there, they, this, too, under, want, was, well, went, what, white, who, will, with
You may introduce up to 8 simple new words that a child can sound out
Keep sentences short
Make sure to repeat new vocabulary words at least once in the story to help with learning
```

## 9. PDF Generation

### 9.1 PDF Format Specifications
- Page Size: US Letter (8.5" x 11")
- Orientation: Portrait
- Margins: 0.5" on all sides
- Two panels per page
- Story title on first page
- Page numbers at bottom
- Font embedding for consistent display

### 9.2 Implementation Approach
```typescript
const generatePDF = async (storyTitle: string, panels: StoryPanel[]) => {
  const element = document.getElementById('story-container');
  const opt = {
    margin: 10,
    filename: `${storyTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' }
  };
  
  await html2pdf().set(opt).from(element).save();
};
```

## 10. Testing Strategy

### 10.1 Component Testing
- Unit tests for all UI components using React Testing Library
- Integration tests for form submission and navigation
- Mock Gemini API responses for predictable testing

### 10.2 Browser Compatibility
- Test on latest versions of Chrome, Firefox, Safari, and Edge
- Test voice input on both desktop and mobile browsers
- Test PDF generation across browsers

### 10.3 Accessibility Testing
- Screen reader compatibility
- Keyboard navigation
- Color contrast compliance
- ARIA attributes validation

## 11. Implementation Timeline

### 11.1 Phase 1: Setup and Core UI (Week 1)
- Project initialization with Next.js
- Setup Tailwind CSS and Shadcn/ui
- Implement basic UI components
- Create form with validation

### 11.2 Phase 2: API Integration (Week 2)
- Implement Gemini API integration
- Create story generation service
- Build panel navigation
- Add local storage for API key

### 11.3 Phase 3: Voice Input & PDF (Week 3)
- Implement Web Speech API integration
- Add visual feedback for voice recording
- Implement PDF generation
- Finalize responsive design

### 11.4 Phase 4: Testing & Polishing (Week 4)
- Comprehensive testing across devices
- Performance optimization
- Bug fixes
- Documentation

## 12. Future Enhancement Considerations

### 12.1 Potential Features for Future Versions
- User accounts for saving and retrieving stories
- Reading progress tracking
- Audio narration of stories
- Interactive elements within stories
- Custom illustration style selection
- Multi-language support

### 12.2 Technical Preparation
- Design components with extensibility in mind
- Use feature flags for experimental features
- Implement analytics hooks for usage insights
- Create documentation for future contributors