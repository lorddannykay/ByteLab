'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, IText, Rect, Circle, Line, Image, Object as FabricObject } from 'fabric';
import { EditorTool, createTextObject, createRectangle, createCircle, createLine, loadImageToCanvas } from '@/lib/canvas/canvasUtils';

interface MediaEditorCanvasProps {
  width?: number;
  height?: number;
  onObjectSelected?: (object: FabricObject | null) => void;
  onCanvasModified?: () => void;
  onCanvasReady?: (canvas: Canvas) => void;
  currentTool?: EditorTool;
  onToolChange?: (tool: EditorTool) => void;
}

export default function MediaEditorCanvas({
  width = 800,
  height = 600,
  onObjectSelected,
  onCanvasModified,
  onCanvasReady,
  currentTool: externalTool,
  onToolChange,
}: MediaEditorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [currentTool, setCurrentTool] = useState<EditorTool>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  
  // Use refs to store callbacks to prevent infinite loops
  const onObjectSelectedRef = useRef(onObjectSelected);
  const onCanvasModifiedRef = useRef(onCanvasModified);
  const onCanvasReadyRef = useRef(onCanvasReady);
  
  // Update refs when callbacks change
  useEffect(() => {
    onObjectSelectedRef.current = onObjectSelected;
    onCanvasModifiedRef.current = onCanvasModified;
    onCanvasReadyRef.current = onCanvasReady;
  }, [onObjectSelected, onCanvasModified, onCanvasReady]);

  // Use external tool if provided, otherwise use internal state
  const activeTool = externalTool !== undefined ? externalTool : currentTool;
  const setActiveTool = onToolChange || setCurrentTool;

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric.js canvas
    const canvas = new Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#ffffff',
    });

    fabricCanvasRef.current = canvas;
    
    // Notify parent that canvas is ready (only once)
    onCanvasReadyRef.current?.(canvas);

    // Handle object selection
    const handleSelectionCreated = (e: any) => {
      onObjectSelectedRef.current?.(e.selected?.[0] || null);
    };

    const handleSelectionUpdated = (e: any) => {
      onObjectSelectedRef.current?.(e.selected?.[0] || null);
    };

    const handleSelectionCleared = () => {
      onObjectSelectedRef.current?.(null);
    };

    const handleObjectModified = () => {
      onCanvasModifiedRef.current?.();
    };

    canvas.on('selection:created', handleSelectionCreated);
    canvas.on('selection:updated', handleSelectionUpdated);
    canvas.on('selection:cleared', handleSelectionCleared);
    canvas.on('object:modified', handleObjectModified);

    // Handle mouse events for drawing
    const handleMouseDown = (options: any) => {
      if (activeTool === 'select') return;

      const pointer = canvas.getPointer(options.e);
      startPointRef.current = { x: pointer.x, y: pointer.y };
      setIsDrawing(true);

      if (activeTool === 'text') {
        const text = createTextObject('Text', {
          left: pointer.x,
          top: pointer.y,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
        setActiveTool('select');
      } else if (activeTool === 'rectangle') {
        const rect = createRectangle({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
        });
        canvas.add(rect);
        canvas.setActiveObject(rect);
      } else if (activeTool === 'circle') {
        const circle = createCircle({
          left: pointer.x,
          top: pointer.y,
          radius: 0,
        });
        canvas.add(circle);
        canvas.setActiveObject(circle);
      } else if (activeTool === 'line') {
        const line = new Line([
          [pointer.x, pointer.y],
          [pointer.x, pointer.y]
        ], {
          stroke: '#000000',
          strokeWidth: 2,
        } as any);
        canvas.add(line);
        canvas.setActiveObject(line);
      }
    };

    const handleMouseMove = (options: any) => {
      if (!isDrawing || !startPointRef.current) return;

      const pointer = canvas.getPointer(options.e);
      const activeObject = canvas.getActiveObject();

      if (!activeObject) return;

      if (activeTool === 'rectangle' && activeObject instanceof Rect) {
        const width = Math.abs(pointer.x - startPointRef.current.x);
        const height = Math.abs(pointer.y - startPointRef.current.y);
        activeObject.set({
          left: Math.min(pointer.x, startPointRef.current.x),
          top: Math.min(pointer.y, startPointRef.current.y),
          width,
          height,
        });
        canvas.renderAll();
      } else if (activeTool === 'circle' && activeObject instanceof Circle) {
        const radius = Math.sqrt(
          Math.pow(pointer.x - startPointRef.current.x, 2) +
          Math.pow(pointer.y - startPointRef.current.y, 2)
        ) / 2;
        activeObject.set({
          left: startPointRef.current.x - radius,
          top: startPointRef.current.y - radius,
          radius,
        });
        canvas.renderAll();
      } else if (activeTool === 'line' && activeObject instanceof Line) {
        // Update line coordinates - in Fabric.js v6, Line path is an array of points
        const path = [
          [startPointRef.current.x, startPointRef.current.y],
          [pointer.x, pointer.y]
        ];
        activeObject.set({ path });
        canvas.renderAll();
      }
    };

    const handleMouseUp = () => {
      setIsDrawing(false);
      startPointRef.current = null;
      if (activeTool !== 'select') {
        setActiveTool('select');
      }
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    return () => {
      canvas.off('selection:created', handleSelectionCreated);
      canvas.off('selection:updated', handleSelectionUpdated);
      canvas.off('selection:cleared', handleSelectionCleared);
      canvas.off('object:modified', handleObjectModified);
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
      canvas.dispose();
    };
  }, [width, height, activeTool, setActiveTool]);

  // Update tool
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    
    if (activeTool === 'select') {
      canvas.isDrawingMode = false;
      canvas.selection = true;
      canvas.defaultCursor = 'default';
      canvas.hoverCursor = 'move';
    } else {
      canvas.isDrawingMode = false;
      canvas.selection = false;
      canvas.defaultCursor = 'crosshair';
    }
  }, [activeTool]);

  const addImage = useCallback(async (url: string) => {
    if (!fabricCanvasRef.current) return;
    await loadImageToCanvas(url, fabricCanvasRef.current);
  }, []);

  return (
    <div className="relative w-full h-full bg-bg2 border border-border rounded-lg overflow-hidden">
      <canvas ref={canvasRef} className="max-w-full max-h-full" />
    </div>
  );
}

