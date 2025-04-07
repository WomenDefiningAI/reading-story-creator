import React from 'react';

const Footer = () => {
	return (
		<footer className="w-full p-4 mt-8 text-center text-sm text-gray-500 border-t border-gray-200">
			A vibe-coded project developed by the{' '}
			<a
				href="https://www.womendefiningai.com/"
				target="_blank"
				rel="noopener noreferrer"
				className="underline text-indigo-600 hover:text-indigo-800"
			>
				Women Defining AI
			</a>{' '}
			community |{' '}
			<a
				href="https://github.com/WomenDefiningAI/reading-story-creator"
				target="_blank"
				rel="noopener noreferrer"
				className="underline text-indigo-600 hover:text-indigo-800"
			>
				Github Repo
			</a>
		</footer>
	);
};

export default Footer;
