'use client';

import { ImageMetadata } from '@/types/course';
import HeadingBlock from './HeadingBlock';
import TextBlock from './TextBlock';
import ListBlock from './ListBlock';
import { TrashIcon } from '@/components/Icons/AppleIcons';

interface SectionBlockProps {
    section: {
        heading: string;
        content?: string;
        items?: string[];
        image?: ImageMetadata;
    };
    onChange: (updatedSection: any) => void;
    onDelete: () => void;
    onSearchImage: () => void;
}

export default function SectionBlock({
    section,
    onChange,
    onDelete,
    onSearchImage,
}: SectionBlockProps) {
    return (
        <div className="group relative bg-bg1 border border-border rounded-xl p-6 transition-all hover:border-accent1/30">
            <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={onDelete}
                    className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    title="Delete section"
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-4">
                <HeadingBlock
                    value={section.heading}
                    onChange={(heading) => onChange({ ...section, heading })}
                    level={3}
                />

                {/* Section Image */}
                <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-bg2 group/image">
                    {section.image ? (
                        <>
                            <img
                                src={section.image.thumbnailUrl || section.image.url}
                                alt={section.image.attribution || section.heading}
                                className="w-full h-full object-cover transition-transform group-hover/image:scale-105"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x450?text=Image+Not+Found';
                                }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button
                                    onClick={onSearchImage}
                                    className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all font-medium text-sm"
                                >
                                    Change Media
                                </button>
                                <button
                                    onClick={() => onChange({ ...section, image: undefined })}
                                    className="px-4 py-2 bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-100 rounded-lg hover:bg-red-500/40 transition-all font-medium text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                            {section.image.attribution && (
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                    <p className="text-[10px] text-white/70 truncate">{section.image.attribution}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <button
                            onClick={onSearchImage}
                            className="absolute inset-0 flex flex-col items-center justify-center text-text-tertiary hover:text-accent1 hover:bg-accent1/5 transition-all"
                        >
                            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-medium">Add Contextual Media</span>
                            <span className="text-[10px] opacity-60 mt-1">AI-suggested based on heading</span>
                        </button>
                    )}
                </div>

                {section.items && section.items.length > 0 ? (
                    <ListBlock
                        items={section.items}
                        onChange={(items) => onChange({ ...section, items })}
                    />
                ) : (
                    <TextBlock
                        value={section.content || ''}
                        onChange={(content) => onChange({ ...section, content })}
                        placeholder="Write section content or use AI to expand..."
                    />
                )}
            </div>
        </div>
    );
}
