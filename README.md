# ByteLab - AI-Powered Microlearning Course Builder

ByteLab is a web application that enables users to create engaging microlearning courses with AI assistance. It uses TogetherAI models for content generation, embeddings, and RAG (Retrieval-Augmented Generation).

## Features

- **File Upload & Context**: Upload PDF, DOCX, TXT, or MD files for AI context
- **AI-Powered Planning**: Chat with AI to plan and refine course structure
- **Course Configuration**: Customize course settings, colors, and preferences
- **Content Generation**: AI generates complete course content with interactive elements
- **Multiple Formats**: Generate interactive courses, video versions, and podcasts
- **Export**: Download complete course packages as ZIP files

## Tech Stack

- **Frontend**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **AI**: TogetherAI API
- **Audio**: Edge-TTS (for future audio generation)
- **File Processing**: pdf-parse, mammoth, marked

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory with your API keys:
```bash
# Required - Get your key at https://api.together.xyz/
TOGETHER_API_KEY=your_together_api_key_here

# Optional - Alternative AI providers
# OPENAI_API_KEY=your_openai_api_key_here
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Upload Files**: Upload context files (PDF, DOCX, TXT, MD) to provide AI with background information
2. **AI Planning**: Chat with AI to discuss course goals and structure
3. **Configure**: Set course title, objectives, audience, style, and preferences
4. **Generate**: AI generates complete course content
5. **Preview & Export**: Review and download your course as a ZIP file

## TogetherAI Models Used

- **Embeddings**: `BAAI/bge-large-en-v1.5` ($0.02/1M tokens)
- **Content Generation**: `servicenow-ai/Apriel-1.6-15B-Thinker` (Free for development)
- **Reranking**: `Salesforce/Llama-Rank-V1` ($0.10/1M tokens)
- **Moderation**: `meta-llama/Llama-Guard-4-12B` ($0.20/1M tokens)

## Project Structure

```
ByteLab/
├── app/                    # Next.js app router pages
├── components/             # React components
├── lib/
│   ├── together/         # TogetherAI integrations
│   ├── rag/              # RAG pipeline (chunking, vector store, retrieval)
│   ├── parsers/          # File parsers (PDF, DOCX, TXT, MD)
│   ├── generators/       # HTML generators
│   └── prompts/          # AI prompt templates
└── types/                 # TypeScript types
```

## Development Notes

- The vector store is currently in-memory (resets on server restart)
- For production, consider using Pinecone or Chroma for persistent storage
- Audio generation with Edge-TTS is planned but not yet implemented
- HTML templates are simplified - full templates from samples can be integrated

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

## License

ISC

