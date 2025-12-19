import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const MEDIA_DIR = path.join(process.cwd(), 'public', 'media');

// Ensure media directory exists
async function ensureMediaDir() {
  try {
    await fs.access(MEDIA_DIR);
  } catch {
    await fs.mkdir(MEDIA_DIR, { recursive: true });
  }
}

// GET - List all media files
export async function GET() {
  try {
    await ensureMediaDir();
    const files = await fs.readdir(MEDIA_DIR);
    const mediaFiles = await Promise.all(
      files
        .filter(file => /\.(jpg|jpeg|png|gif|webp|mp4|webm)$/i.test(file))
        .map(async (file) => {
          const filePath = path.join(MEDIA_DIR, file);
          const stats = await fs.stat(filePath);
          return {
            id: file,
            name: file,
            url: `/media/${file}`,
            size: stats.size,
            createdAt: stats.birthtimeMs,
            type: /\.(mp4|webm)$/i.test(file) ? 'video' : /\.gif$/i.test(file) ? 'gif' : 'image',
            mediaType: /\.(mp4|webm)$/i.test(file) ? 'video' : /\.gif$/i.test(file) ? 'gif' : 'image',
          };
        })
    );
    return NextResponse.json({ media: mediaFiles });
  } catch (error) {
    console.error('Error listing media:', error);
    return NextResponse.json({ error: 'Failed to list media' }, { status: 500 });
  }
}

// POST - Upload media file
export async function POST(request: NextRequest) {
  try {
    await ensureMediaDir();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(MEDIA_DIR, fileName);
    
    await fs.writeFile(filePath, buffer);
    
    // Determine media type
    let mediaType: 'image' | 'gif' | 'video' = 'image';
    if (file.type === 'image/gif') {
      mediaType = 'gif';
    } else if (file.type.startsWith('video/')) {
      mediaType = 'video';
    }

    return NextResponse.json({
      id: fileName,
      name: file.name,
      url: `/media/${fileName}`,
      size: file.size,
      type: mediaType,
      mediaType: mediaType, // Also include as mediaType for consistency
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 });
  }
}

// DELETE - Delete media file
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file');
    
    if (!fileName) {
      return NextResponse.json({ error: 'No file name provided' }, { status: 400 });
    }

    const filePath = path.join(MEDIA_DIR, fileName);
    await fs.unlink(filePath);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}



