import { IText, Rect, Circle, Line, Image as FabricImage, Canvas, ITextOptions, IRectOptions, ICircleOptions, ILineOptions } from 'fabric';

export type EditorTool = 'select' | 'text' | 'rectangle' | 'circle' | 'line' | 'image';

export interface CanvasObject {
  id: string;
  type: string;
  data: any;
}

export function createTextObject(text: string = 'Text', options?: Partial<ITextOptions>): IText {
  return new IText(text, {
    left: 100,
    top: 100,
    fontSize: 24,
    fill: '#000000',
    fontFamily: 'Arial',
    ...options,
  });
}

export function createRectangle(options?: Partial<IRectOptions>): Rect {
  return new Rect({
    left: 100,
    top: 100,
    width: 100,
    height: 100,
    fill: '#3b82f6',
    stroke: '#1e40af',
    strokeWidth: 2,
    ...options,
  });
}

export function createCircle(options?: Partial<ICircleOptions>): Circle {
  return new Circle({
    left: 100,
    top: 100,
    radius: 50,
    fill: '#3b82f6',
    stroke: '#1e40af',
    strokeWidth: 2,
    ...options,
  });
}

export function createLine(options?: Partial<ILineOptions>): Line {
  return new Line([50, 50, 200, 200], {
    stroke: '#000000',
    strokeWidth: 2,
    ...options,
  });
}

export function loadImageToCanvas(url: string, canvas: Canvas): Promise<FabricImage> {
  return FabricImage.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
    img.set({
      left: 100,
      top: 100,
      scaleX: 0.5,
      scaleY: 0.5,
    });
    canvas.add(img);
    canvas.setActiveObject(img);
    canvas.renderAll();
    return img;
  });
}

export function exportCanvasToImage(canvas: Canvas, format: 'png' | 'jpeg' = 'png'): string {
  return canvas.toDataURL({
    format,
    quality: 1,
    multiplier: 2, // Higher resolution
  });
}

export function exportCanvasToJSON(canvas: Canvas): string {
  return JSON.stringify(canvas.toJSON(['id']));
}

export function loadCanvasFromJSON(canvas: Canvas, json: string): Promise<void> {
  return canvas.loadFromJSON(json).then(() => {
    canvas.renderAll();
  });
}

