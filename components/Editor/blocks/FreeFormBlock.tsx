'use client';

import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

interface FreeFormBlockProps {
    data: any;
    onChange: (data: any) => void;
    onDelete: () => void;
}

export default function FreeFormBlock({ data, onChange, onDelete }: FreeFormBlockProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!canvasRef.current || canvas) return;

        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
            width: containerRef.current?.offsetWidth || 800,
            height: 400,
            backgroundColor: '#ffffff',
        });

        setCanvas(fabricCanvas);

        // Load initial data
        if (data?.canvasData) {
            fabricCanvas.loadFromJSON(data.canvasData, () => {
                fabricCanvas.renderAll();
            });
        }

        // Save on change
        const handleSave = () => {
            const json = fabricCanvas.toJSON();
            onChange({ ...data, canvasData: json });
        };

        fabricCanvas.on('object:modified', handleSave);
        fabricCanvas.on('object:added', handleSave);
        fabricCanvas.on('object:removed', handleSave);

        return () => {
            fabricCanvas.dispose();
        };
    }, []);

    const addText = () => {
        if (!canvas) return;
        const text = new fabric.IText('Double click to edit', {
            left: 100,
            top: 100,
            fontFamily: 'Inter',
            fontSize: 20
        });
        canvas.add(text);
        canvas.setActiveObject(text);
    };

    const addRect = () => {
        if (!canvas) return;
        const rect = new fabric.Rect({
            left: 150,
            top: 150,
            fill: '#e0e0e0',
            width: 100,
            height: 100
        });
        canvas.add(rect);
        canvas.setActiveObject(rect);
    };

    const addCircle = () => {
        if (!canvas) return;
        const circle = new fabric.Circle({
            left: 200,
            top: 150,
            fill: '#4a90e2',
            radius: 50
        });
        canvas.add(circle);
        canvas.setActiveObject(circle);
    };

    return (
        <div className="border border-border rounded-lg bg-bg1 overflow-hidden">
            <div className="p-2 border-b border-border bg-bg2 flex justify-between items-center">
                <div className="flex gap-2">
                    <span className="text-xs font-semibold px-2 py-1 bg-accent1/10 text-accent1 rounded">FreeForm Canvas</span>
                    <button onClick={addText} className="p-1 hover:bg-bg3 rounded text-xs">Add Text</button>
                    <button onClick={addRect} className="p-1 hover:bg-bg3 rounded text-xs">Add Rect</button>
                    <button onClick={addCircle} className="p-1 hover:bg-bg3 rounded text-xs">Add Circle</button>
                </div>
                <button onClick={onDelete} className="text-red-500 hover:text-red-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div ref={containerRef} className="w-full relative">
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
}
