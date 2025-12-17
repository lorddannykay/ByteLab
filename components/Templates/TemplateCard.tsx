'use client';

import { TemplateInfo, TemplateId } from '@/lib/templates/templateSelector';
import { 
  DocumentTextIcon, 
  SwatchIcon, 
  BookIcon, 
  BookOpenIcon, 
  NewspaperIcon, 
  RectangleStackIcon, 
  ClockIcon, 
  PresentationChartLineIcon,
  CodeBracketIcon,
  MoonIcon,
  BriefcaseIcon,
  BeakerIcon
} from '@/components/Icons/AppleIcons';

interface TemplateCardProps {
  template: TemplateInfo;
  isSelected: boolean;
  isPreviewing: boolean;
  onSelect: () => void;
  onPreview: () => void;
}

export default function TemplateCard({
  template,
  isSelected,
  isPreviewing,
  onSelect,
  onPreview,
}: TemplateCardProps) {
  return (
    <div
      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'border-accent1 bg-accent1/10'
          : 'border-border bg-bg2 hover:border-accent1/50 hover:bg-bg3'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-text-primary mb-1">{template.name}</h3>
          <p className="text-xs text-text-secondary">{template.description}</p>
        </div>
        {isSelected && (
          <div className="w-5 h-5 bg-accent1 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      <div className="mb-3 p-3 glass glass-light rounded border border-border/30 min-h-[80px] flex items-center justify-center">
        <div className="text-center">
          <div className="mb-2 flex justify-center">
            {template.id === 'minimal' && <DocumentTextIcon className="w-8 h-8 text-text-primary" />}
            {template.id === 'modern' && <SwatchIcon className="w-8 h-8 text-text-primary" />}
            {template.id === 'classic' && <BookOpenIcon className="w-8 h-8 text-text-primary" />}
            {template.id === 'magazine' && <NewspaperIcon className="w-8 h-8 text-text-primary" />}
            {template.id === 'card-based' && <RectangleStackIcon className="w-8 h-8 text-text-primary" />}
            {template.id === 'timeline' && <ClockIcon className="w-8 h-8 text-text-primary" />}
            {template.id === 'storybook' && <BookOpenIcon className="w-8 h-8 text-text-primary" />}
            {template.id === 'dashboard' && <PresentationChartLineIcon className="w-8 h-8 text-text-primary" />}
            {template.id === 'gaming' && <CodeBracketIcon className="w-8 h-8 text-text-primary" />}
            {template.id === 'dark-mode' && <MoonIcon className="w-8 h-8 text-text-primary" />}
            {template.id === 'corporate' && <BriefcaseIcon className="w-8 h-8 text-text-primary" />}
            {template.id === 'academic' && <BookOpenIcon className="w-8 h-8 text-text-primary" />}
            {template.id === 'creative' && <BeakerIcon className="w-8 h-8 text-text-primary" />}
            {template.id === 'print-ready' && <DocumentTextIcon className="w-8 h-8 text-text-primary" />}
          </div>
          <p className="text-xs text-text-secondary">{template.preview}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary">Best for: {template.bestFor}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          className="text-xs text-accent1 hover:text-accent2 transition-colors"
        >
          {isPreviewing ? 'Hide' : 'Preview'}
        </button>
      </div>
    </div>
  );
}
