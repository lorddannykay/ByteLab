import { NextRequest, NextResponse } from 'next/server';
import { generateSmartImageQueries } from '@/lib/media/smartImageSelector';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { content, heading, context } = body;

        if (!content) {
            return NextResponse.json(
                { error: 'Content is required' },
                { status: 400 }
            );
        }

        const result = await generateSmartImageQueries(content, heading, context);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in smart-image API:', error);
        return NextResponse.json(
            { error: 'Failed to generate image queries' },
            { status: 500 }
        );
    }
}
