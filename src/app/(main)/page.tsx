'use client';

import { StoryInputForm } from '@/components/form/StoryInputForm';
import { StoryContainer } from '@/components/story/StoryContainer';
import { useStoryStore } from '@/store/storyStore';
import React from 'react';

export default function HomePage() {
	const generatedStory = useStoryStore((state) => state.generatedStory);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-4">
			{!generatedStory ? <StoryInputForm /> : <StoryContainer />}
		</div>
	);
}
