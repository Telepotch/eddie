# Eddie

AI-powered documentation framework for Obsidian + Claude Code

## What is Eddie?

Eddie is a documentation workflow system that combines:
- 📝 **Obsidian** for Markdown editing
- 🤖 **Claude Code** for AI-assisted writing
- 🔍 **Vector Search** for semantic document search
- 🌐 **VitePress** for static site generation
- 🚀 **Vercel** for automatic deployment

## Quick Start

```bash
# Create new project
npx create-eddie my-project

# Setup
cd my-project
cp .env.example .env
# Add your OPENAI_API_KEY to .env

# Open with Obsidian
# Obsidian → Open folder as vault → select my-project/

# Open with VS Code + Claude Code
code .
```

## Workflow

```
0.prompt🤖  → Get AI prompt templates
1.source📦  → Store raw materials (transcripts, notes)
2.sampling✂️ → Extract and refine content
3.plot📋    → Create document outlines
4.publish📚 → Write final documents → Web
archive🗑️   → Archive unused materials
```

## Packages

- `create-eddie` - Project initialization CLI
- `@eddie/vector-search` - Semantic search for documents
- `@eddie/prompts` - AI prompt template collection

## Development

This is a monorepo managed with npm workspaces.

```bash
# Install dependencies
npm install

# Develop packages
cd packages/create-eddie
npm run dev
```

## License

MIT
