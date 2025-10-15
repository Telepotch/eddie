# Eddie

AI-powered documentation framework for Obsidian + Claude Code

**Version:** 1.3.4

## What is Eddie?

Eddie is a documentation workflow system that combines:
- 📝 **Obsidian** for Markdown editing
- 🤖 **Claude Code** for AI-assisted writing
- 🔍 **Vector Search** for semantic document search
- 🌐 **VitePress** for static site generation
- 📥 **Download Features** - Export as Markdown, PDF, Word, or ZIP
- 🚀 **Vercel** for automatic deployment

## ✨ Features

- **📥 Document Downloads** - Export any page in multiple formats
  - Markdown (.md) - Original source format
  - PDF (.pdf) - Print-ready with Unicode support
  - Word (.docx) - Editable documents
  - ZIP - Download entire site at once
- **🎯 Smart Filenames** - Automatically extracted from `# Document Title`
- **🎨 Clean UI** - Apple System Blue theme with light mode
- **🐛 Debug Console** - Detailed logging for troubleshooting
- **🔗 Wikilinks** - Full Obsidian `[[wikilink]]` support
- **🚀 Production Ready** - buildEnd hook enables downloads on Vercel

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

## Documentation

📚 **[View Full Documentation](https://eddie-docs.vercel.app)**

- [Installation Guide](https://eddie-docs.vercel.app/installation.html)
- [Getting Started](https://eddie-docs.vercel.app/getting-started.html)
- [Download Features](https://eddie-docs.vercel.app/download-features.html)
- [Vector Search](https://eddie-docs.vercel.app/vector-search.html)
- [Deploy to Vercel](https://eddie-docs.vercel.app/deployment.html)

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
