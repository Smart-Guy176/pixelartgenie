
import React, { useState, useCallback } from 'react';
import { refinePromptForPixelArt, generatePixelArtImage } from './services/geminiService';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorDisplay } from './components/ErrorDisplay';
import { ImageDisplay } from './components/ImageDisplay';
import { PromptInput } from './components/PromptInput';
import { GithubIcon, SparklesIcon } from './components/Icons';


const App: React.FC = () => {
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  const [refinedPrompt, setRefinedPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<string>('');

  const handleGenerate = useCallback(async () => {
    if (!initialPrompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRefinedPrompt('');
    setGeneratedImage(null);

    try {
      setCurrentStage('Refining prompt with Gemini...');
      const refined = await refinePromptForPixelArt(initialPrompt);
      setRefinedPrompt(refined);

      setCurrentStage('Generating pixel art with Imagen...');
      const imageBase64 = await generatePixelArtImage(refined);
      setGeneratedImage(imageBase64);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setCurrentStage('');
    }
  }, [initialPrompt]);

  return (
    <div className="min-h-screen bg-surface-main flex flex-col items-center justify-center p-4 selection:bg-brand-primary selection:text-white">
      <div className="w-full max-w-2xl bg-gray-800 shadow-2xl rounded-xl p-6 md:p-10 space-y-8 transform transition-all duration-500 hover:scale-[1.01]">
        
        <header className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
            <SparklesIcon className="w-10 h-10 mr-3 text-pink-500" />
            Pixel Art Genie
          </h1>
          <p className="mt-3 text-text-secondary text-lg">
            Let AI transform your ideas into stunning pixel art.
          </p>
        </header>

        <PromptInput
          value={initialPrompt}
          onChange={(e) => setInitialPrompt(e.target.value)}
          onSubmit={handleGenerate}
          isLoading={isLoading}
        />

        {isLoading && (
          <div className="text-center space-y-2">
            <LoadingSpinner />
            <p className="text-brand-light animate-pulse">{currentStage || 'Processing...'}</p>
          </div>
        )}

        <ErrorDisplay message={error} />

        {refinedPrompt && !isLoading && (
          <div className="space-y-3 p-4 bg-gray-700/50 rounded-lg border border-border-light">
            <h3 className="text-lg font-semibold text-brand-light">Refined Prompt:</h3>
            <p className="text-text-secondary font-mono text-sm leading-relaxed">{refinedPrompt}</p>
          </div>
        )}
        
        <ImageDisplay base64Image={generatedImage} altText={refinedPrompt || initialPrompt} isLoading={isLoading} />

      </div>
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>Powered by Google Gemini & Imagen API.</p>
        <a 
          href="https://github.com/google/project IDX" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-gray-400 hover:text-brand-primary transition-colors duration-200 mt-2"
        >
          <GithubIcon className="w-5 h-5 mr-2" />
          View on GitHub
        </a>
      </footer>
    </div>
  );
};

export default App;
