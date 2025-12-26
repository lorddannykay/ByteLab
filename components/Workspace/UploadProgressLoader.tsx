'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { DocumentTextIcon, SparklesIcon } from '@/components/Icons/AppleIcons';

interface UploadProgressLoaderProps {
  files: File[];
  onComplete: () => void;
  onError?: (error: string) => void;
}

type ProcessingStage = 'reading' | 'parsing' | 'analyzing' | 'chunking' | 'indexing' | 'complete';

export default function UploadProgressLoader({ files, onComplete, onError }: UploadProgressLoaderProps) {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [currentStage, setCurrentStage] = useState<ProcessingStage>('reading');
  const [displayedText, setDisplayedText] = useState('');
  const [fileContent, setFileContent] = useState<string>('');
  const [processingFile, setProcessingFile] = useState<File | null>(files && files.length > 0 ? files[0] : null);
  const completedRef = useRef(false);
  const animationRef = useRef<number>();
  const textIndexRef = useRef(0);

  const simulateStage = useCallback((stage: ProcessingStage, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, duration);
    });
  }, []);

  const handleNextFile = useCallback(() => {
    const nextIndex = currentFileIndex + 1;
    if (nextIndex < files.length) {
      setCurrentFileIndex(nextIndex);
      setProcessingFile(files[nextIndex]);
      setDisplayedText('');
      setFileContent('');
      textIndexRef.current = 0;
      setCurrentStage('reading');
    } else {
      if (completedRef.current) return;
      setCurrentStage('complete');
      completedRef.current = true;
      setTimeout(() => {
        onComplete();
      }, 500);
    }
  }, [currentFileIndex, files, onComplete]);

  const startTypingAnimation = useCallback((text: string) => {
    const displayText = text.substring(0, 1500);
    const words = displayText.split(/\s+/);
    let wordIndex = 0;

    const typeNextWord = () => {
      if (wordIndex < words.length) {
        setDisplayedText(prev => {
          const newText = prev + (prev ? ' ' : '') + words[wordIndex];
          return newText;
        });
        wordIndex++;
        animationRef.current = window.setTimeout(typeNextWord, 30);
      } else {
        setTimeout(() => {
          setCurrentStage('chunking');
          setTimeout(() => {
            setCurrentStage('indexing');
            setTimeout(() => {
              handleNextFile();
            }, 1000);
          }, 1500);
        }, 800);
      }
    };

    typeNextWord();
  }, [handleNextFile]);

  useEffect(() => {
    if (!processingFile) {
      onComplete();
      return;
    }

    let isCancelled = false;

    const processFile = async () => {
      setCurrentStage('reading');
      await simulateStage('reading', 600);
      if (isCancelled) return;

      setCurrentStage('parsing');
      await simulateStage('parsing', 1000);
      if (isCancelled) return;

      const reader = new FileReader();

      reader.onload = async (e) => {
        if (isCancelled) return;
        const content = e.target?.result as string;
        if (content && content.length > 0) {
          setFileContent(content);
          setCurrentStage('analyzing');
          startTypingAnimation(content);
        } else {
          setCurrentStage('analyzing');
          await simulateStage('analyzing', 2000);
          if (isCancelled) return;
          setCurrentStage('chunking');
          await simulateStage('chunking', 1200);
          if (isCancelled) return;
          setCurrentStage('indexing');
          await simulateStage('indexing', 1000);
          if (isCancelled) return;
          handleNextFile();
        }
      };

      reader.onerror = () => {
        if (isCancelled) return;
        setCurrentStage('analyzing');
        setTimeout(() => {
          if (isCancelled) return;
          setCurrentStage('chunking');
          setTimeout(() => {
            if (isCancelled) return;
            setCurrentStage('indexing');
            setTimeout(() => {
              if (isCancelled) return;
              handleNextFile();
            }, 1000);
          }, 1200);
        }, 2000);
      };

      const isTextFile = processingFile.type.startsWith('text/') ||
        processingFile.name.endsWith('.txt') ||
        processingFile.name.endsWith('.md');

      if (isTextFile) {
        reader.readAsText(processingFile);
      } else {
        setFileContent(`Extracting text from ${processingFile.name}...\n\nProcessing document structure...\n\nAnalyzing content...`);
        setCurrentStage('analyzing');
        await simulateStage('analyzing', 2500);
        if (isCancelled) return;
        setCurrentStage('chunking');
        await simulateStage('chunking', 1500);
        if (isCancelled) return;
        setCurrentStage('indexing');
        await simulateStage('indexing', 1200);
        if (isCancelled) return;
        handleNextFile();
      }
    };

    processFile();

    return () => {
      isCancelled = true;
    };
  }, [processingFile, onComplete, startTypingAnimation, handleNextFile, simulateStage]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  const getStageMessage = () => {
    switch (currentStage) {
      case 'reading':
        return 'Reading file...';
      case 'parsing':
        return 'Parsing content...';
      case 'analyzing':
        return 'Analyzing content...';
      case 'chunking':
        return 'Chunking text...';
      case 'indexing':
        return 'Indexing for search...';
      case 'complete':
        return 'Complete!';
      default:
        return 'Processing...';
    }
  };

  const getStageIcon = () => {
    switch (currentStage) {
      case 'reading':
      case 'parsing':
        return <DocumentTextIcon className="w-6 h-6 animate-pulse" />;
      case 'analyzing':
      case 'chunking':
      case 'indexing':
        return <SparklesIcon className="w-6 h-6 animate-spin" />;
      default:
        return <DocumentTextIcon className="w-6 h-6" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-bg1 border border-border rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col glass glass-panel shadow-2xl">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            {getStageIcon()}
            <h2 className="text-xl font-semibold text-text-primary">Processing Files</h2>
          </div>
          <p className="text-sm text-text-secondary">
            File {currentFileIndex + 1} of {files.length}: {processingFile?.name}
          </p>
        </div>

        <div className="px-6 py-4 border-b border-border bg-bg2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">{getStageMessage()}</span>
            <span className="text-sm text-text-secondary">
              {Math.round(((currentFileIndex + (['reading', 'parsing', 'analyzing', 'chunking', 'indexing'].indexOf(currentStage) + 1) / 5) / files.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-bg3 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-accent1 to-accent2 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentFileIndex + (['reading', 'parsing', 'analyzing', 'chunking', 'indexing'].indexOf(currentStage) + 1) / 5) / files.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {currentStage === 'analyzing' && (displayedText || fileContent) && (
            <div className="flex-1 overflow-y-auto p-6 bg-bg2">
              <div className="max-w-3xl mx-auto">
                <div className="mb-4 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-accent1 animate-pulse" />
                  <h3 className="text-sm font-semibold text-text-primary">Analyzing Content...</h3>
                </div>
                <div className="bg-bg1 border border-border rounded-lg p-6 font-mono text-sm leading-relaxed max-h-96 overflow-y-auto">
                  <div className="text-text-primary whitespace-pre-wrap">
                    {displayedText || fileContent}
                    {displayedText && <span className="inline-block w-2 h-5 bg-accent1 animate-pulse ml-1" />}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-text-secondary">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-accent1 rounded-full animate-pulse" />
                    <span>Extracting key concepts...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStage !== 'analyzing' && (
            <div className="flex-1 flex items-center justify-center p-12">
              <div className="text-center">
                <div className="mb-6">
                  {currentStage === 'reading' && (
                    <div className="relative">
                      <DocumentTextIcon className="w-16 h-16 mx-auto text-accent1 animate-bounce" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-accent2 border-t-transparent rounded-full animate-spin" />
                      </div>
                    </div>
                  )}
                  {currentStage === 'parsing' && (
                    <div className="relative">
                      <DocumentTextIcon className="w-16 h-16 mx-auto text-accent2" />
                      <div className="absolute -top-2 -right-2">
                        <div className="w-6 h-6 bg-accent1 rounded-full animate-ping" />
                      </div>
                    </div>
                  )}
                  {(currentStage === 'chunking' || currentStage === 'indexing') && (
                    <div className="flex items-center justify-center gap-2">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-3 h-3 bg-accent1 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  )}
                  {currentStage === 'complete' && (
                    <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-lg font-medium text-text-primary mb-2">{getStageMessage()}</p>
                {processingFile && (
                  <p className="text-sm text-text-secondary">
                    {processingFile.name} ({(processingFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-bg2">
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div
                key={index}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${index < currentFileIndex
                  ? 'bg-green-500/20 text-green-500'
                  : index === currentFileIndex
                    ? 'bg-accent1/20 text-accent1 animate-pulse'
                    : 'bg-bg3 text-text-secondary'
                  }`}
              >
                {index < currentFileIndex ? '✓ ' : ''}
                {file.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
