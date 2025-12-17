'use client';

import { useState, useRef, useEffect } from 'react';

interface HeadingBlockProps {
  value: string;
  onChange: (value: string) => void;
  level?: 1 | 2 | 3 | 4;
}

export default function HeadingBlock({ value, onChange, level = 2 }: HeadingBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(localValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setLocalValue(value);
      setIsEditing(false);
    }
  };

  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
  const sizeClasses = {
    1: 'text-4xl',
    2: 'text-3xl',
    3: 'text-2xl',
    4: 'text-xl',
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full p-2 border-2 border-accent1 rounded-lg bg-bg1 text-text-primary font-bold ${sizeClasses[level]} focus:outline-none focus:ring-2 focus:ring-accent1`}
        placeholder="Heading..."
      />
    );
  }

  return (
    <HeadingTag
      onClick={() => setIsEditing(true)}
      className={`font-bold text-text-primary mb-3 cursor-text hover:text-accent1 transition-colors ${sizeClasses[level]}`}
    >
      {value || <span className="text-text-tertiary italic">Click to edit heading...</span>}
    </HeadingTag>
  );
}

