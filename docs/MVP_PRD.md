#MVP 1: Reading Story Creator

##Core Functionality

###Story Generation
Custom stories based on simplified user input (single text box for character/topic)
Voice input option for story ideas
Reading level vocabulary control (K/1st grade) - all vocabulary from the levels below are available for story generation, for example if 1st grade is chosen then all vocabulary words from K and 1st are available for generation
6-panel format with consistent illustrations
Parent provides Gemini API key

###Mobile-Friendly Interface
Streamlined form for inputting story parameters
Single text input for story idea/topic
Voice input option with microphone button

Panel-by-panel story navigation
Download/save finished stories to a printable PDF that has two-panels per standard 8x11" page of printout
Simple, intuitive UI with Shadcn components

##Technical Implementation

Next.js frontend with Tailwind CSS and Shadcn UI
Client-side Gemini API integration
Web Speech API for voice input functionality
Responsive design optimized for phones
Local storage for API key

##User Experience

Parent enters story parameters (via text or voice) and API key
System generates age-appropriate story with illustrations
Parent and child read the story together
Option to save/download for future reading

##Voice Input Implementation

Web Speech API for client-side speech recognition
Microphone button with visual recording feedback
Transcript preview before confirming input
No additional API keys or services required

##Limitations

No user accounts or persistent storage
No tracking of reading progress
Limited to generating and displaying stories
Each story is a standalone experience