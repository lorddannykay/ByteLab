<div align="center">

<img src="assets/logo/bytesquare_black.png" alt="ByteLab" width="100" />

# ByteLab

### AI-Powered Microlearning Course Builder

*Part of the ByteVerse ecosystem — transforming a single lesson seed into multimodal learning experiences*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue?style=for-the-badge)](LICENSE)

[Features](#features) · [Quick Start](#quick-start) · [AI Providers](#ai-providers) · [Media Search](#-media-search--content-validation) · [Templates](#templates) · [Architecture](#architecture) · [Contributing](#contributing)

---

## 🆕 What's New (December 2025)

### Major Feature Release

**Multi-Source Media Search & Content Validation**

- ✨ **6 Image Sources** — Google, DuckDuckGo, Pexels, Unsplash, Giphy, and Video Loops
- 🎬 **GIF Support** — Search and display animated GIFs from Giphy
- 🎥 **Video Loops** — Short autoplaying videos for engaging content
- 📤 **Custom Upload** — Drag-and-drop file upload for all media types
- ✅ **Content Validation** — Web search integration for fact-checking generated content
- 🎨 **UI Enhancements** — Resizable preview panels, hideable sidebars, media type badges
- ⚡ **Performance** — 60% reduction in API calls through smart validation
- 🛡️ **Rate Limiting** — Sophisticated cost management and API usage protection

[View Full Changelog](CHANGELOG.md) | [Deployment Guide](docs/DEPLOYMENT_SUMMARY.md)

---

</div>

## Features

<table>
<tr>
<td width="50%">

### Course Generation
- **AI-Powered Content** — Generate complete courses from source materials
- **RAG Pipeline** — Context-aware generation using your uploaded documents
- **Multi-Stage Courses** — Structured learning with progressive stages
- **Interactive Elements** — Quizzes, flashcards, drag-drop exercises

</td>
<td width="50%">

### 14 Visual Templates
- Modern, Minimal, Classic, Magazine
- Card-Based, Timeline, Storybook
- Dashboard, Gaming, Dark Mode
- Corporate, Academic, Creative, Print-Ready

</td>
</tr>
<tr>
<td width="50%">

### Multimodal Output
- **Interactive HTML** — Self-contained courses that work offline
- **Video Version** — Kinetic typography with scene-by-scene narration
- **Podcast Mode** — Dialogue-based audio learning
- **SCORM Export** — LMS-compatible packages

</td>
<td width="50%">

### Editor Blocks
- Text & Headings
- Lists & Code Blocks
- Images & Videos
- Audio Players
- Quizzes & Flashcards
- Drag-Drop Interactions
- Progress Trackers

</td>
</tr>
<tr>
<td width="50%">

### 🆕 Multi-Source Media Search
- **6 Image Sources** — Google, DuckDuckGo, Pexels, Unsplash, Giphy, Video Loops
- **GIF Support** — Search and display animated GIFs
- **Video Loops** — Short autoplaying videos (< 30 seconds)
- **Custom Upload** — Drag-and-drop file upload
- **Smart Search** — Unified search across all sources

</td>
<td width="50%">

### 🆕 Content Validation
- **Fact-Checking** — Web search integration for accuracy
- **Multi-Provider** — Google Search + DuckDuckGo fallback
- **Rate Limiting** — Smart API usage management
- **Confidence Scoring** — Validation results with confidence levels
- **Cost Optimization** — 60% reduction in API calls

</td>
</tr>
</table>

---

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API key from at least one AI provider

### Installation

```bash
# Clone the repository
git clone https://github.com/lorddannykay/ByteLab.git
cd ByteLab

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Setup

Create a `.env.local` file with your preferred AI provider(s) and media APIs:

```env
# AI Providers (choose one or more):

# Together AI (recommended for cost-effective generation)
TOGETHER_API_KEY=your_together_api_key

# OpenAI (GPT-4, GPT-3.5)
OPENAI_API_KEY=your_openai_api_key

# Anthropic (Claude)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Media Search APIs (required for image search features):

# Google Custom Search (for images and content validation)
GOOGLE_SEARCH_API_KEY=your_google_api_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id

# Pexels (for images and video loops)
PEXELS_API_KEY=your_pexels_api_key

# Optional Media APIs:

# Unsplash (additional image source)
UNSPLASH_ACCESS_KEY=your_unsplash_key

# Giphy (for GIF search)
GIPHY_API_KEY=your_giphy_api_key

# Rate Limiting (optional - defaults provided)
GOOGLE_SEARCH_MAX_QUERIES_PER_DAY=100
GOOGLE_SEARCH_MAX_QUERIES_PER_HOUR=30
GOOGLE_SEARCH_MAX_QUERIES_PER_MINUTE=10
MAX_SEARCHES_PER_VALIDATION=5
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## AI Providers

ByteLab supports **multiple AI providers** — use whichever fits your needs:

| Provider | Models | Best For |
|----------|--------|----------|
| **Together AI** | Llama, Mixtral, BAAI embeddings | Cost-effective, open-source models |
| **OpenAI** | GPT-4, GPT-4 Turbo, GPT-3.5 | High-quality generation, wide capabilities |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 | Long context, nuanced content |

The system **automatically detects** available providers and lets you switch between them in the UI.

---

## 🆕 Media Search & Content Validation

### Multi-Source Image Search

ByteLab now supports **6 different media sources** for finding the perfect images, GIFs, and videos:

| Source | Type | API Key Required | Best For |
|--------|------|------------------|----------|
| **Google** | Images | ✅ Yes | Web images, diverse content |
| **DuckDuckGo** | Images | ❌ No | Privacy-focused, fallback option |
| **Pexels** | Images & Videos | ✅ Yes | High-quality stock photos & video loops |
| **Unsplash** | Images | ✅ Yes | Professional photography |
| **Giphy** | GIFs | ✅ Yes | Animated GIFs |
| **Custom Upload** | All | ❌ No | Your own media files |

### Features

- **Unified Search Interface** — Search across all sources simultaneously
- **Smart Deduplication** — Automatically removes duplicate results
- **Media Type Filtering** — Filter by Images, GIFs, or Video Loops
- **Provider Icons** — Visual indicators showing the source
- **Type Badges** — Clear labels for Image/GIF/Video content
- **Drag-and-Drop Upload** — Easy custom file uploads

### Content Validation System

Ensure your generated content is accurate with built-in fact-checking:

- **Web Search Integration** — Validates claims against real-time web sources
- **Multi-Provider Fallback** — Google Search with DuckDuckGo backup
- **Smart Claim Extraction** — Identifies verifiable facts in content
- **Confidence Scoring** — Provides validation confidence levels
- **Issue Flagging** — Highlights potential inaccuracies
- **Cost Optimized** — 60% reduction in API calls through intelligent validation

### Rate Limiting & Cost Management

- **Token Bucket Algorithm** — Sophisticated rate limiting
- **Configurable Limits** — Environment variable-based configuration
- **Usage Monitoring** — Track API consumption in real-time
- **Graceful Fallbacks** — Automatic provider switching when limits hit
- **Cost Guardrails** — Built-in protections against over-usage

```mermaid
flowchart LR
    subgraph Providers["AI Providers"]
        T[Together AI]
        O[OpenAI]
        A[Anthropic]
    end
    
    PM[Provider Manager] --> T
    PM --> O
    PM --> A
    
    T --> |Embeddings| EMB[BAAI/bge-large]
    T --> |Generation| GEN[Llama/Mixtral]
    T --> |Reranking| RR[Llama-Rank]
    
    O --> GPT[GPT-4/3.5]
    A --> Claude[Claude 3.5]
```

---

## Templates

### Course Templates (14 Styles)

Choose from professionally designed templates:

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   Modern    │   Minimal   │   Classic   │  Magazine   │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ Card-Based  │  Timeline   │  Storybook  │  Dashboard  │
├─────────────┼─────────────┼─────────────┼─────────────┤
│   Gaming    │  Dark Mode  │  Corporate  │  Academic   │
├─────────────┼─────────────┴─────────────┴─────────────┤
│  Creative   │           Print-Ready                   │
└─────────────┴─────────────────────────────────────────┘
```

### Starter Templates (10 Use Cases)

Pre-configured templates for common training scenarios:

- **Compliance Training** — Policy & regulatory content
- **Product Training** — Feature walkthroughs
- **Onboarding** — New employee orientation
- **Sales Enablement** — Pitch decks & objection handling
- **Technical Tutorial** — Step-by-step guides
- **Safety Training** — Workplace safety modules
- **Process Documentation** — SOPs & workflows
- **Customer Education** — User guides & tutorials
- **Soft Skills** — Communication & leadership
- **Quick Reference** — Cheat sheets & job aids

---

## Architecture

```mermaid
flowchart TB
    subgraph Client["Frontend · Next.js 14"]
        UI[React Components]
        Editor[Visual Editor]
        Preview[Live Preview]
    end
    
    subgraph API["API Routes"]
        Upload["Upload API"]
        Generate["Generate API"]
        Export["Export API"]
        Studio["Studio API"]
        Media["Media Search API"]
        Search["Search API"]
        Validation["Validation API"]
    end
    
    subgraph Core["Core Libraries"]
        RAG[RAG Pipeline]
        Parsers[File Parsers]
        Templates[Template Engine]
        TTS[Text-to-Speech]
        MediaSearch[Media Search]
        Validator[Content Validator]
    end
    
    subgraph Storage["Storage"]
        VS[(Vector Store)]
        FS[(File System)]
    end
    
    UI --> API
    Editor --> Preview
    
    Upload --> Parsers
    Parsers --> RAG
    RAG --> VS
    
    Generate --> Core
    Studio --> Core
    Export --> Templates
    Export --> TTS
    
    Media --> MediaSearch
    Search --> Validator
    Validation --> Validator
    
    MediaSearch --> FS
    Templates --> FS
```

### RAG Pipeline

```mermaid
flowchart LR
    subgraph Input["Input"]
        PDF[PDF]
        DOCX[DOCX]
        TXT[TXT/MD]
        URL[URL]
    end
    
    subgraph Process["Processing"]
        Parse[Parse] --> Chunk[Chunk]
        Chunk --> Embed[Embed]
        Embed --> Store[Store]
    end
    
    subgraph Retrieve["Retrieval"]
        Query[Query] --> Search[Semantic Search]
        Search --> Rerank[Rerank]
        Rerank --> Context[Context]
    end
    
    Input --> Parse
    Store --> Search
    Context --> LLM[LLM Generation]
```

---

## Project Structure

```
ByteLab/
├── app/                        # Next.js App Router
│   ├── api/                    # API Routes
│   │   ├── generate/           # Content generation endpoints
│   │   ├── studio/             # Studio outputs (audio, video, etc.)
│   │   ├── export/             # Export endpoints (ZIP, SCORM)
│   │   ├── upload/             # File upload handlers
│   │   ├── media/              # Media search endpoints
│   │   └── search/             # Web search & validation
│   ├── course/                 # Course pages
│   └── page.tsx                # Dashboard
│
├── components/                 # React Components
│   ├── Editor/                 # Visual editor & blocks
│   ├── Workspace/              # Main workspace panels
│   ├── Dashboard/              # Dashboard components
│   └── Templates/              # Template selectors
│
├── lib/                        # Core Libraries
│   ├── ai/providers/           # AI provider integrations
│   ├── rag/                    # RAG pipeline
│   ├── parsers/                # File parsers
│   ├── templates/              # Course templates
│   ├── generators/             # HTML generators
│   ├── tts/                    # Text-to-speech
│   ├── scorm/                  # SCORM packager
│   ├── media/                   # Media search providers
│   ├── search/                  # Web search & validation
│   └── validation/              # Content validation
│
├── types/                      # TypeScript types
└── assets/                     # Static assets & logos
```

---

## Configuration

### Supported File Types

| Type | Extensions | Parser |
|------|------------|--------|
| PDF | `.pdf` | pdf-parse |
| Word | `.docx` | mammoth |
| Text | `.txt`, `.md` | Native |
| URL | Web pages | Fetch + parse |

### Supported Media Types

| Type | Formats | Sources |
|------|---------|---------|
| **Images** | `.jpg`, `.jpeg`, `.png`, `.webp` | Google, DuckDuckGo, Pexels, Unsplash, Upload |
| **GIFs** | `.gif` | Giphy, Upload |
| **Videos** | `.mp4`, `.webm` | Pexels (video loops), Upload |

### Export Formats

| Format | Description | Use Case |
|--------|-------------|----------|
| **HTML** | Self-contained interactive course | Web hosting, offline use |
| **Video HTML** | Kinetic typography with audio | Video-style learning |
| **Podcast HTML** | Dialogue-based audio player | Audio learning |
| **SCORM 1.2** | LMS-compatible package | Corporate LMS |
| **ZIP** | Complete course bundle | Distribution |

---

## Workflow

```mermaid
sequenceDiagram
    actor User
    participant UI as ByteLab UI
    participant RAG as RAG Pipeline
    participant AI as AI Provider
    participant Export as Exporter
    
    User->>UI: Upload sources (PDF, DOCX, etc.)
    UI->>RAG: Process & chunk documents
    RAG-->>UI: Sources ready
    
    User->>UI: Configure course settings
    User->>UI: Generate course
    
    UI->>RAG: Retrieve relevant context
    RAG->>AI: Generate with context
    AI-->>UI: Course content
    
    User->>UI: Preview & edit
    User->>UI: Export
    UI->>Export: Package course
    Export-->>User: Download ZIP/SCORM
```

---

## Roadmap

### ✅ Completed

- [x] Multi-provider AI support (Together, OpenAI, Anthropic)
- [x] 14 course templates
- [x] RAG-powered content generation
- [x] SCORM export
- [x] **Multi-source media search** (Google, DuckDuckGo, Pexels, Unsplash, Giphy)
- [x] **GIF and video loop support**
- [x] **Content validation with web search**
- [x] **Custom file upload with drag-and-drop**
- [x] **Rate limiting and cost management**
- [x] **Resizable Live Preview panel**
- [x] **Hideable Stages sidebar**

### 🚧 In Progress / Planned

- [ ] Persistent vector store (Pinecone/Chroma)
- [ ] Real-time collaboration
- [ ] Course analytics dashboard
- [ ] Custom template builder
- [ ] Video rendering with AI avatars
- [ ] Multi-language support
- [ ] Additional image sources (Pixabay, Flickr)
- [ ] Advanced media library organization
- [ ] Batch media operations

---

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push** to your branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## License

This project is licensed under the **Apache License 2.0** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

*Part of the ByteVerse ecosystem*

**One seed. Infinite ways to learn.**

[Back to top](#bytelab)

</div>
