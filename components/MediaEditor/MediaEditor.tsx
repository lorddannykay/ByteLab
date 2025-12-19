'use client';

import { useState, useRef, useEffect } from 'react';
import { Canvas, Image as FabricImage, Object as FabricObject } from 'fabric';
import MediaEditorCanvas from './MediaEditorCanvas';
import EditorToolbar from './EditorToolbar';
import LayerPanel from './LayerPanel';
import AssetBrowser from './AssetBrowser';
import PropertyPanel from './PropertyPanel';
import { EditorTool, exportCanvasToImage, exportCanvasToJSON } from '@/lib/canvas/canvasUtils';

interface MediaAsset {
  id: string;
  type: 'image' | 'video';
  thumbnailUrl: string;
  fullUrl: string;
  width: number;
  height: number;
  attribution: string;
}

interface MediaEditorProps {
  onClose?: () => void;
  onSave?: (imageData: string, jsonData: string) => void;
}

export default function MediaEditor({ onClose, onSave }: MediaEditorProps) {
  const [currentTool, setCurrentTool] = useState<EditorTool>('select');
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [showAssetBrowser, setShowAssetBrowser] = useState(false);
  const canvasRef = useRef<{ getCanvas: () => Canvas | null } | null>(null);

  const handleToolChange = (tool: EditorTool) => {
    setCurrentTool(tool);
    if (tool === 'image' && canvasRef.current) {
      setShowAssetBrowser(true);
    }
  };


  const handleObjectSelected = (obj: FabricObject | null) => {
    setSelectedObject(obj);
  };

  const handleAssetSelect = async (asset: MediaAsset) => {
    if (!canvas) return;

    try {
      if (asset.type === 'image') {
        // Use a proxy approach for CORS issues - try direct load first, then fallback
        let img: FabricImage;
        try {
          img = await FabricImage.fromURL(asset.fullUrl, { 
            crossOrigin: 'anonymous',
          });
        } catch (corsError) {
          // If CORS fails, try without crossOrigin
          console.warn('CORS error, trying without crossOrigin:', corsError);
          img = await FabricImage.fromURL(asset.fullUrl);
        }
        
        // Calculate appropriate scale to fit canvas
        const maxWidth = 400;
        const maxHeight = 400;
        const scaleX = Math.min(1, maxWidth / (img.width || 1));
        const scaleY = Math.min(1, maxHeight / (img.height || 1));
        const scale = Math.min(scaleX, scaleY);
        
        img.set({
          left: (canvas.width || 800) / 2 - ((img.width || 0) * scale) / 2,
          top: (canvas.height || 600) / 2 - ((img.height || 0) * scale) / 2,
          scaleX: scale,
          scaleY: scale,
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        setSelectedObject(img);
        setShowAssetBrowser(false);
        setCurrentTool('select');
      } else {
        // For videos, we'll add a placeholder image
        alert('Video support coming soon. For now, please use images.');
      }
    } catch (error) {
      console.error('Error loading asset:', error);
      alert(`Failed to load image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleExport = () => {
    if (!canvas) return;

    const imageData = exportCanvasToImage(canvas);
    const jsonData = exportCanvasToJSON(canvas);

    if (onSave) {
      onSave(imageData, jsonData);
    } else {
      // Download as image
      const link = document.createElement('a');
      link.href = imageData;
      link.download = 'canvas-export.png';
      link.click();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-bg1 border border-border rounded-xl w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">Media Editor</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-bg3 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Toolbar */}
        <EditorToolbar
          currentTool={currentTool}
          onToolChange={handleToolChange}
          onExport={handleExport}
        />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Asset Browser (conditional) */}
          {showAssetBrowser && (
            <AssetBrowser onSelectAsset={handleAssetSelect} />
          )}

          {/* Canvas */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 p-4 overflow-auto">
              <MediaEditorCanvas
                width={800}
                height={600}
                onObjectSelected={handleObjectSelected}
                onCanvasModified={() => {}}
                onCanvasReady={setCanvas}
                currentTool={currentTool}
                onToolChange={setCurrentTool}
              />
            </div>
          </div>

          {/* Layer Panel */}
          <LayerPanel canvas={canvas} onLayerSelect={handleObjectSelected} />

          {/* Property Panel */}
          <PropertyPanel selectedObject={selectedObject} canvas={canvas} />
        </div>
      </div>
    </div>
  );
}

