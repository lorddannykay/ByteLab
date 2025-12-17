'use client';

import { useState } from 'react';
import { ChatSession } from '@/types/courseCreation';

interface ChatHistorySidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onNewChat: () => void;
}

export default function ChatHistorySidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat,
}: ChatHistorySidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const sortedSessions = [...sessions].sort((a, b) => b.lastUpdated - a.lastUpdated);

  return (
    <div className={`fixed right-0 top-0 h-full bg-bg2 border-l border-border transition-all duration-300 z-40 ${
      isExpanded ? 'w-80' : 'w-12'
    }`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-16 bg-accent1 text-white rounded-l-lg hover:bg-accent2 transition-colors flex items-center justify-center shadow-lg z-50"
        aria-label={isExpanded ? 'Collapse chat history' : 'Expand chat history'}
      >
        <svg
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Sidebar Content */}
      <div className={`h-full flex flex-col ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h3 className="font-bold text-lg mb-3">Chat History</h3>
          <button
            onClick={onNewChat}
            className="w-full px-4 py-2 bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm"
          >
            + New Chat
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2">
          {sortedSessions.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-8">
              No chat history yet
            </div>
          ) : (
            <div className="space-y-2">
              {sortedSessions.map((session) => (
                <div
                  key={session.id}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                    currentSessionId === session.id
                      ? 'bg-accent1/20 border-2 border-accent1'
                      : 'bg-bg1 border border-border hover:bg-bg3'
                  }`}
                  onClick={() => onSelectSession(session.id)}
                >
                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this chat session?')) {
                        onDeleteSession(session.id);
                      }
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded text-red-500"
                    aria-label="Delete session"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Session Title */}
                  <div className="font-semibold text-sm mb-1 pr-6 truncate">
                    {session.title}
                  </div>

                  {/* File Names */}
                  {session.fileNames.length > 0 && (
                    <div className="text-xs text-gray-500 mb-2 truncate">
                      {session.fileNames.slice(0, 2).join(', ')}
                      {session.fileNames.length > 2 && '...'}
                    </div>
                  )}

                  {/* Message Count & Time */}
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>{session.messages.filter(m => m.role === 'user').length} messages</span>
                    <span>{formatDate(session.lastUpdated)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

