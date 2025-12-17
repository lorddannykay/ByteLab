'use client';

import { useState } from 'react';
import { LinkIcon, ArrowPathIcon } from '@/components/Icons/AppleIcons';

interface ContextAnalysisResult {
  related: boolean;
  similarity: number;
  suggestion: 'merge' | 'clear';
  reason: string;
}

interface ContextAnalysisCardProps {
  analysis: ContextAnalysisResult;
  onStartFresh: () => void;
  onMerge: () => void;
  onCancel: () => void;
  analyzing?: boolean;
}

export default function ContextAnalysisCard({
  analysis,
  onStartFresh,
  onMerge,
  onCancel,
  analyzing = false,
}: ContextAnalysisCardProps) {
  if (analyzing) {
    return (
      <div className="bg-bg2 border border-border rounded-lg p-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-accent1 border-t-transparent"></div>
          <p className="text-sm text-gray-600">Analyzing file context...</p>
        </div>
      </div>
    );
  }

  const similarityPercent = (analysis.similarity * 100).toFixed(0);
  const isRelated = analysis.related;

  return (
    <div className="bg-bg2 border-2 border-accent1 rounded-lg p-6 mb-4 shadow-lg">
      <div className="flex items-start gap-3 mb-4">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full glass-button flex items-center justify-center ${
          isRelated ? 'bg-blue-500/10' : 'bg-orange-500/10'
        }`}>
          {isRelated ? (
            <LinkIcon className="w-5 h-5 text-blue-600" />
          ) : (
            <ArrowPathIcon className="w-5 h-5 text-orange-600" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2 text-bgInverse">
            {isRelated ? 'Related Content Detected' : 'New Topic Detected'}
          </h3>
          <p className="text-sm text-gray-700 mb-2">{analysis.reason}</p>
          <div className="text-xs text-gray-500">
            Similarity: {similarityPercent}%
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        {isRelated ? (
          <>
            <button
              onClick={onMerge}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Merge with Existing
            </button>
            <button
              onClick={onStartFresh}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Start Fresh
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onStartFresh}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Start Fresh
            </button>
            <button
              onClick={onMerge}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Merge Anyway
            </button>
          </>
        )}
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-bg3 border border-border text-bgInverse rounded-lg font-semibold hover:bg-bg4 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}



