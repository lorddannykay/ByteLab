'use client';

import { useState, useEffect } from 'react';
import { Canvas, Object as FabricObject } from 'fabric';

interface PropertyPanelProps {
  selectedObject: FabricObject | null;
  canvas: Canvas | null;
  onUpdate?: () => void;
}

export default function PropertyPanel({ selectedObject, canvas, onUpdate }: PropertyPanelProps) {
  const [properties, setProperties] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    opacity: 1,
    fill: '#000000',
    stroke: '#000000',
    strokeWidth: 0,
  });

  useEffect(() => {
    if (!selectedObject) {
      setProperties({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        rotation: 0,
        opacity: 1,
        fill: '#000000',
        stroke: '#000000',
        strokeWidth: 0,
      });
      return;
    }

    const updateProperties = () => {
      setProperties({
        x: Math.round(selectedObject.left || 0),
        y: Math.round(selectedObject.top || 0),
        width: Math.round((selectedObject.width || 0) * (selectedObject.scaleX || 1)),
        height: Math.round((selectedObject.height || 0) * (selectedObject.scaleY || 1)),
        rotation: Math.round(selectedObject.angle || 0),
        opacity: selectedObject.opacity || 1,
        fill: (selectedObject as any).fill || '#000000',
        stroke: (selectedObject as any).stroke || '#000000',
        strokeWidth: (selectedObject as any).strokeWidth || 0,
      });
    };

    updateProperties();

    selectedObject.on('modified', updateProperties);
    selectedObject.on('moved', updateProperties);

    return () => {
      selectedObject.off('modified', updateProperties);
      selectedObject.off('moved', updateProperties);
    };
  }, [selectedObject]);

  const updateProperty = (key: string, value: any) => {
    if (!selectedObject) return;

    if (key === 'x') {
      selectedObject.set('left', parseFloat(value));
    } else if (key === 'y') {
      selectedObject.set('top', parseFloat(value));
    } else if (key === 'width') {
      const scale = parseFloat(value) / (selectedObject.width || 1);
      selectedObject.set('scaleX', scale);
    } else if (key === 'height') {
      const scale = parseFloat(value) / (selectedObject.height || 1);
      selectedObject.set('scaleY', scale);
    } else if (key === 'rotation') {
      selectedObject.set('angle', parseFloat(value));
    } else if (key === 'opacity') {
      selectedObject.set('opacity', parseFloat(value));
    } else if (key === 'fill') {
      (selectedObject as any).set('fill', value);
    } else if (key === 'stroke') {
      (selectedObject as any).set('stroke', value);
    } else if (key === 'strokeWidth') {
      (selectedObject as any).set('strokeWidth', parseFloat(value));
    }

    canvas?.renderAll();
    onUpdate?.();
  };

  if (!selectedObject) {
    return (
      <div className="w-64 bg-bg1 border-l border-border flex flex-col h-full">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-text-primary">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">
          No object selected
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-bg1 border-l border-border flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-text-primary">Properties</h3>
        <p className="text-xs text-text-secondary mt-1">
          {selectedObject.type}
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Position */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-2">Position</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-text-tertiary mb-1">X</label>
              <input
                type="number"
                value={properties.x}
                onChange={(e) => updateProperty('x', e.target.value)}
                className="w-full px-2 py-1.5 bg-bg2 border border-border rounded text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
              />
            </div>
            <div>
              <label className="block text-xs text-text-tertiary mb-1">Y</label>
              <input
                type="number"
                value={properties.y}
                onChange={(e) => updateProperty('y', e.target.value)}
                className="w-full px-2 py-1.5 bg-bg2 border border-border rounded text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
              />
            </div>
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-2">Dimensions</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-text-tertiary mb-1">W</label>
              <input
                type="number"
                value={properties.width}
                onChange={(e) => updateProperty('width', e.target.value)}
                className="w-full px-2 py-1.5 bg-bg2 border border-border rounded text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
              />
            </div>
            <div>
              <label className="block text-xs text-text-tertiary mb-1">H</label>
              <input
                type="number"
                value={properties.height}
                onChange={(e) => updateProperty('height', e.target.value)}
                className="w-full px-2 py-1.5 bg-bg2 border border-border rounded text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
              />
            </div>
          </div>
        </div>

        {/* Rotation */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-2">Rotation</label>
          <input
            type="number"
            value={properties.rotation}
            onChange={(e) => updateProperty('rotation', e.target.value)}
            className="w-full px-2 py-1.5 bg-bg2 border border-border rounded text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
            min="0"
            max="360"
          />
        </div>

        {/* Opacity */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-2">Opacity</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={properties.opacity}
            onChange={(e) => updateProperty('opacity', e.target.value)}
            className="w-full"
          />
          <div className="text-xs text-text-tertiary mt-1">{Math.round(properties.opacity * 100)}%</div>
        </div>

        {/* Fill Color */}
        {selectedObject.type !== 'image' && (
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">Fill</label>
            <input
              type="color"
              value={properties.fill}
              onChange={(e) => updateProperty('fill', e.target.value)}
              className="w-full h-10 bg-bg2 border border-border rounded cursor-pointer"
            />
          </div>
        )}

        {/* Stroke */}
        {selectedObject.type !== 'image' && (
          <>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">Stroke</label>
              <input
                type="color"
                value={properties.stroke}
                onChange={(e) => updateProperty('stroke', e.target.value)}
                className="w-full h-10 bg-bg2 border border-border rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">Stroke Width</label>
              <input
                type="number"
                value={properties.strokeWidth}
                onChange={(e) => updateProperty('strokeWidth', e.target.value)}
                className="w-full px-2 py-1.5 bg-bg2 border border-border rounded text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
                min="0"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

