import { marked } from 'marked';

export function parseTXT(text: string): string {
  // Simple text file - return as is
  return text;
}

export async function parseMD(text: string): Promise<string> {
  try {
    // Convert markdown to plain text
    const html = await marked.parse(text);
    // Strip HTML tags for plain text
    return html.replace(/<[^>]*>/g, '').replace(/\n\s*\n/g, '\n\n');
  } catch (error) {
    console.error('Error parsing Markdown:', error);
    // Fallback to plain text
    return text;
  }
}

export function parseFileByExtension(
  content: string | Buffer,
  extension: string
): Promise<string> {
  const text = typeof content === 'string' ? content : content.toString('utf-8');
  
  switch (extension.toLowerCase()) {
    case '.txt':
      return Promise.resolve(parseTXT(text));
    case '.md':
    case '.markdown':
      return parseMD(text);
    default:
      return Promise.resolve(text);
  }
}

