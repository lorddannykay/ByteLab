'use client';

import { useState, useEffect } from 'react';
import { Canvas, Object as FabricObject, IText, Rect, Circle, Line, Image as FabricImage } from 'fabric';

interface LayerPanelProps {
  canvas: Canvas | null;
  onLayerSelect?: (object: FabricObject | null) => void;
}

export default function LayerPanel({ canvas, onLayerSelect }: LayerPanelProps) {
  const [layers, setLayers] = useState<FabricObject[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  useEffect(() => {
    if (!canvas) return;

    const updateLayers = () => {
      const objects = canvas.getObjects();
      // Reverse to show top layer first
      setLayers([...objects].reverse());
    };

    updateLayers();

    canvas.on('object:added', updateLayers);
    canvas.on('object:removed', updateLayers);
    canvas.on('object:modified', updateLayers);
    canvas.on('selection:created', (e) => {
      const obj = e.selected?.[0];
      setSelectedLayerId(obj ? (obj as any).id || String(obj) : null);
    });
    canvas.on('selection:cleared', () => {
      setSelectedLayerId(null);
    });

    return () => {
      canvas.off('object:added', updateLayers);
      canvas.off('object:removed', updateLayers);
      canvas.off('object:modified', updateLayers);
    };
  }, [canvas]);

  const handleLayerClick = (obj: FabricObject) => {
    canvas?.setActiveObject(obj);
    canvas?.renderAll();
    onLayerSelect?.(obj);
  };

  const toggleLayerVisibility = (obj: FabricObject) => {
    obj.visible = !obj.visible;
    canvas?.renderAll();
  };

  const toggleLayerLock = (obj: FabricObject) => {
    obj.selectable = !obj.selectable;
    obj.evented = !obj.evented;
    canvas?.renderAll();
  };

  const deleteLayer = (obj: FabricObject) => {
    canvas?.remove(obj);
    canvas?.renderAll();
  };

  const moveLayer = (obj: FabricObject, direction: 'up' | 'down') => {
    if (direction === 'up') {
      canvas?.bringToFront(obj);
    } else {
      canvas?.sendToBack(obj);
    }
    canvas?.renderAll();
  };

  const getLayerName = (obj: FabricObject): string => {
    if (obj instanceof IText) {
      return (obj as IText).text || 'Text';
    }
    if (obj instanceof Rect) return 'Rectangle';
    if (obj instanceof Circle) return 'Circle';
    if (obj instanceof Line) return 'Line';
    if (obj instanceof FabricImage) return 'Image';
    return obj.type || 'Object';
  };

  return (
    <div className="w-64 bg-bg1 border-l border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-text-primary">Layers</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {layers.length === 0 ? (
          <div className="text-center py-8 text-text-secondary text-sm">
            No layers yet
          </div>
        ) : (
          <div className="space-y-1">
            {layers.map((obj, index) => {
              const isSelected = selectedLayerId === ((obj as any).id || String(obj));
              return (
                <div
                  key={index}
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-accent1/20 border border-accent1' : 'bg-bg2 hover:bg-bg3'
                  }`}
                  onClick={() => handleLayerClick(obj)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text-primary truncate">
                      {getLayerName(obj)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLayerVisibility(obj);
                        }}
                        className="p-1 hover:bg-bg4 rounded"
                        title={obj.visible ? 'Hide' : 'Show'}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {obj.visible ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          )}
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLayerLock(obj);
                        }}
                        className="p-1 hover:bg-bg4 rounded"
                        title={obj.selectable ? 'Unlock' : 'Lock'}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {obj.selectable ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayer(obj, 'up');
                      }}
                      className="p-1 hover:bg-bg4 rounded text-xs"
                      title="Bring to front"
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayer(obj, 'down');
                      }}
                      className="p-1 hover:bg-bg4 rounded text-xs"
                      title="Send to back"
                    >
                      ↓
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLayer(obj);
                      }}
                      className="p-1 hover:bg-red-500/10 text-red-500 rounded text-xs ml-auto"
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

