'use client';

import { StoryInputForm } from "@/components/form/StoryInputForm";
import { StoryContainer } from "@/components/story/StoryContainer";
import { useStoryStore } from "@/store/storyStore";
import React, { useEffect } from "react";

export default function HomePage() {
  const setApiKey = useStoryStore(state => state.setApiKey);
  const setIsApiKeySaved = useStoryStore(state => state.setIsApiKeySaved);
  const generatedStory = useStoryStore((state) => state.generatedStory); // Check if story exists

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsApiKeySaved(true);
    }
  }, [setApiKey, setIsApiKeySaved]); 

  return (
    // Conditionally render form or story view centered
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {!generatedStory ? <StoryInputForm /> : <StoryContainer />}
    </div>
  );
}
