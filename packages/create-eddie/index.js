#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createEddieProject(projectName) {
  const currentDir = process.cwd();
  const projectDir = path.join(currentDir, projectName);

  console.log(`\n📝 Creating Eddie project: ${projectName}\n`);

  // Check if directory already exists
  if (fs.existsSync(projectDir)) {
    console.error(`❌ Error: Directory "${projectName}" already exists`);
    process.exit(1);
  }

  // Create project directory
  fs.mkdirSync(projectDir);

  // Create directory structure
  console.log('📁 Creating directory structure...');

  const dirs = [
    'edit/0.prompt🤖',
    'edit/1.source📦',
    'edit/2.sampling✂️',
    'edit/3.plot📋',
    'edit/4.publish📚',
    'edit/archive🗑️',
    '.system/site-config',
    '.system/claude',
    '.system/vector-data'
  ];

  dirs.forEach(dir => {
    fs.mkdirSync(path.join(projectDir, dir), { recursive: true });
  });

  // Create package.json
  console.log('📦 Creating package.json...');
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    type: 'module',
    description: `${projectName} documentation powered by Eddie`,
    scripts: {
      'generate-sidebar': 'node .system/site-config/generate-sidebar.js',
      dev: 'npm run generate-sidebar && vitepress dev edit/4.publish📚',
      build: 'npm run generate-sidebar && vitepress build edit/4.publish📚',
      preview: 'vitepress preview edit/4.publish📚',
      search: 'eddie-search',
      reindex: 'eddie-reindex'
    },
    dependencies: {
      'eddie-vector-search': '^1.0.0',
      vitepress: '^1.0.0'
    }
  };

  fs.writeFileSync(
    path.join(projectDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Create .gitignore
  console.log('🚫 Creating .gitignore...');
  const gitignore = `node_modules/
.DS_Store
*.log
.env

# VitePress
.vitepress/dist/
.vitepress/cache/

# Vector search data
.system/vector-data/
`;
  fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignore);

  // Create .env.example
  console.log('🔐 Creating .env.example...');
  fs.writeFileSync(
    path.join(projectDir, '.env.example'),
    'OPENAI_API_KEY=your_openai_api_key_here\n'
  );

  // Create VitePress config
  console.log('⚙️  Creating VitePress config...');
  const vitepressConfig = `import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load sidebar from generated sidebar.json
let sidebar = 'auto'
const sidebarPath = path.join(__dirname, 'sidebar.json')
if (fs.existsSync(sidebarPath)) {
  sidebar = JSON.parse(fs.readFileSync(sidebarPath, 'utf-8'))
}

export default defineConfig({
  title: '${projectName}',
  description: 'Documentation powered by Eddie',

  appearance: 'light', // Force light mode
  ignoreDeadLinks: true,

  markdown: {
    // Pre-process markdown to convert Obsidian hybrid links
    // [[text]](link) -> [text](link)
    async: true,

    config: (md) => {
      // Store original render method
      const originalRender = md.render.bind(md)

      // Override render to pre-process content
      md.render = function(src, env) {
        // Convert [[text]](link) to [text](link)
        const processed = src.replace(/\\[\\[([^\\]]+)\\]\\]\\(([^)]+)\\)/g, '[$1]($2)')
        return originalRender(processed, env)
      }

      // Enable mermaid diagrams
      const defaultFence = md.renderer.rules.fence
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        const code = token.content.trim()
        const info = token.info ? md.utils.unescapeAll(token.info).trim() : ''

        if (info === 'mermaid') {
          return \`<div class="mermaid">\${code}</div>\`
        }
        return defaultFence ? defaultFence(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options)
      }

      // Convert pure Obsidian wikilinks to markdown links
      // [[Page]] -> [Page](./Page.md)
      // [[Page|Display]] -> [Display](./Page.md)
      // [[Page#heading]] -> [Page](./Page.md#heading)
      md.inline.ruler.before('link', 'wikilink', (state, silent) => {
        const start = state.pos
        const max = state.posMax

        // Check for [[
        if (state.src.charCodeAt(start) !== 0x5B || state.src.charCodeAt(start + 1) !== 0x5B) {
          return false
        }

        // Find ]]
        let end = start + 2
        while (end < max) {
          if (state.src.charCodeAt(end) === 0x5D && state.src.charCodeAt(end + 1) === 0x5D) {
            break
          }
          end++
        }

        if (end >= max) {
          return false
        }

        const content = state.src.slice(start + 2, end)

        // Parse [[Page|Display]] or [[Page#heading]] or [[Page]]
        let page = content
        let display = content
        let heading = ''

        if (content.includes('|')) {
          const parts = content.split('|')
          page = parts[0]
          display = parts[1]
        }

        if (page.includes('#')) {
          const parts = page.split('#')
          page = parts[0]
          heading = '#' + parts[1]
        }

        if (!silent) {
          const token = state.push('link_open', 'a', 1)
          token.attrSet('href', './' + page + '.md' + heading)

          const textToken = state.push('text', '', 0)
          textToken.content = display

          state.push('link_close', 'a', -1)
        }

        state.pos = end + 2
        return true
      })
    }
  },

  themeConfig: {
    sidebar,

    search: {
      provider: 'local'
    }
  },

  head: [
    // Load mermaid from CDN
    ['script', { src: 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js' }],
    ['script', {}, 'mermaid.initialize({ startOnLoad: true });'],

    // Hide theme switcher and add download button
    ['style', {}, \\\`
      .VPSwitchAppearance { display: none !important; }

      .download-button {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 5px 10px;
        font-size: 13px;
        font-weight: 500;
        border: 1px solid var(--vp-c-divider);
        border-radius: 6px;
        background: var(--vp-c-bg);
        color: var(--vp-c-text-1);
        cursor: pointer;
        transition: all 0.2s;
        margin-left: 8px;
      }
      .download-button:hover {
        border-color: var(--vp-c-brand-1);
        color: var(--vp-c-brand-1);
        background: var(--vp-c-bg-soft);
      }
      .download-button svg {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
      }
    \\\`],

    // Download button script
    ['script', {}, \\\`
      if (typeof window !== 'undefined') {
        const insertDownloadButton = () => {
          const navBarExtra = document.querySelector('.VPNavBarExtra');
          if (!navBarExtra || document.querySelector('.download-button')) return;

          const btn = document.createElement('button');
          btn.className = 'download-button';
          btn.innerHTML = \\\\\\\`
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span>MD</span>
          \\\\\\\`;

          btn.onclick = async () => {
            try {
              const path = window.location.pathname;
              let mdPath = path.endsWith('/') ? path + 'index.md' : path + '.md';

              const response = await fetch(mdPath);
              if (!response.ok) throw new Error('File not found');

              const markdown = await response.text();
              const fileName = mdPath.split('/').pop();

              const blob = new Blob([markdown], { type: 'text/markdown' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = fileName;
              a.click();
              URL.revokeObjectURL(url);
            } catch (error) {
              console.error('Download failed:', error);
              alert('ダウンロードに失敗しました');
            }
          };

          navBarExtra.appendChild(btn);
        };

        window.addEventListener('load', insertDownloadButton);

        // For SPA navigation
        const observer = new MutationObserver(insertDownloadButton);
        window.addEventListener('load', () => {
          observer.observe(document.body, { childList: true, subtree: true });
        });
      }
    \\\`]
  ]
})
`;
  fs.writeFileSync(
    path.join(projectDir, '.system/site-config/config.js'),
    vitepressConfig
  );

  // Copy generate-sidebar.js
  console.log('📋 Creating sidebar generator...');
  const generateSidebarPath = path.join(__dirname, 'templates/generate-sidebar.js');
  fs.copyFileSync(
    generateSidebarPath,
    path.join(projectDir, '.system/site-config/generate-sidebar.js')
  );

  // Copy sidebar-order.json template
  const sidebarOrderPath = path.join(__dirname, 'templates/sidebar-order.json');
  fs.copyFileSync(
    sidebarOrderPath,
    path.join(projectDir, 'edit/4.publish📚/sidebar-order.json')
  );

  // Copy Claude Code settings and guide
  console.log('🤖 Setting up Claude Code integration...');
  const claudeSettingsPath = path.join(__dirname, 'templates/claude-settings.json');
  const eddieGuidePath = path.join(__dirname, 'templates/EDDIE_GUIDE.md');
  fs.copyFileSync(
    claudeSettingsPath,
    path.join(projectDir, '.system/claude/settings.local.json')
  );
  fs.copyFileSync(
    eddieGuidePath,
    path.join(projectDir, '.system/claude/EDDIE_GUIDE.md')
  );

  // Create VitePress config symlink
  fs.mkdirSync(path.join(projectDir, 'edit/4.publish📚/.vitepress'), { recursive: true });
  const configSymlink = path.join(projectDir, 'edit/4.publish📚/.vitepress/config.js');
  const configTarget = '../../../.system/site-config/config.js';
  fs.symlinkSync(configTarget, configSymlink);

  // Create index.md
  console.log('📄 Creating index.md...');
  const indexMd = `# ${projectName}

Welcome to your Eddie documentation project!

## Getting Started

Start writing your documentation in \`edit/4.publish📚/\`.

## Workflow

\`\`\`
0.prompt🤖  → Get AI prompt templates
1.source📦  → Store raw materials
2.sampling✂️ → Extract and refine
3.plot📋    → Create outlines
4.publish📚 → Write final docs → Web
archive🗑️   → Archive unused
\`\`\`

## Commands

\`\`\`bash
npm run dev      # Start dev server
npm run build    # Build site
npm run search   # Vector search
npm run reindex  # Re-index docs
\`\`\`
`;
  fs.writeFileSync(path.join(projectDir, 'edit/4.publish📚/index.md'), indexMd);

  // Initialize empty vector store
  console.log('🔍 Initializing vector store...');
  fs.writeFileSync(path.join(projectDir, '.system/vector-data/vector_store.json'), '[]');

  // Create README.md
  console.log('📚 Creating README.md...');
  const readme = `# ${projectName}

Documentation project powered by [Eddie](https://github.com/yourname/eddie)

## Setup

### 1. Install dependencies

\`\`\`bash
cd ${projectName}
npm install
\`\`\`

### 2. Configure environment

\`\`\`bash
cp .env.example .env
\`\`\`

Add your OpenAI API key to \`.env\`:
\`\`\`
OPENAI_API_KEY=sk-...
\`\`\`

### 3. Open with Obsidian

1. Launch Obsidian
2. Click "Open folder as vault"
3. Select this project folder (\`${projectName}\`)

### 4. Open with VS Code

\`\`\`bash
code .
\`\`\`

Launch Claude Code to start writing!

## Workflow

\`\`\`
0.prompt🤖   → Use AI prompt templates
1.source📦   → Store raw materials (transcripts, notes)
2.sampling✂️ → Extract and refine content
3.plot📋     → Create document outlines
4.publish📚  → Write final documents → Deployed as website
archive🗑️    → Archive unused materials
\`\`\`

## Commands

\`\`\`bash
# Development
npm run dev         # Start VitePress dev server (http://localhost:5173)

# Build
npm run build       # Build static site (.vitepress/dist/)
npm run preview     # Preview built site

# Vector Search
npm run search "your query"   # Semantic search across documents
npm run reindex              # Re-index all documents

# Example
npm run search "design principles"
\`\`\`

## Deployment

### Vercel

1. Push to GitHub
\`\`\`bash
git init
git add .
git commit -m "Initial commit"
gh repo create
git push origin main
\`\`\`

2. Deploy to Vercel
\`\`\`bash
npm install -g vercel
vercel
\`\`\`

## Documentation Structure

Write your documentation in \`edit/4.publish📚/\`:

- Markdown files (.md) become web pages
- Organize with folders for nested navigation
- Use relative links between documents

### Sidebar Configuration

The sidebar is automatically generated from \`edit/4.publish📚/sidebar-order.json\`.

**To add a new page to the sidebar:**

1. Create your markdown file in \`edit/4.publish📚/\`
   \`\`\`bash
   # Example: create new-feature.md
   \`\`\`

2. Edit \`edit/4.publish📚/sidebar-order.json\` to add the new page:
   \`\`\`json
   {
     "groups": [
       {
         "text": "Getting Started",
         "items": [
           { "file": "index", "text": "Introduction" },
           { "file": "new-feature", "text": "New Feature" }
         ]
       }
     ]
   }
   \`\`\`

3. Restart dev server (or rebuild):
   \`\`\`bash
   npm run dev
   \`\`\`

**For Claude Code users:**
When asked to add a new documentation page, Claude should:
1. Create the \`.md\` file in \`edit/4.publish📚/\`
2. Add an entry to \`sidebar-order.json\` with the appropriate file name and display text
3. The sidebar will be automatically regenerated on next build/dev

## Powered by

- [Eddie](https://github.com/yourname/eddie) - Documentation framework
- [VitePress](https://vitepress.dev/) - Static site generator
- [Obsidian](https://obsidian.md/) - Markdown editor
- [Claude Code](https://claude.com/claude-code) - AI assistant
- [OpenAI Embeddings](https://platform.openai.com/) - Vector search
`;
  fs.writeFileSync(path.join(projectDir, 'README.md'), readme);

  // Install dependencies
  console.log('\n📥 Installing dependencies...');
  try {
    execSync('npm install', { cwd: projectDir, stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
  }

  // Success message
  console.log(`\n✅ ${projectName} created successfully!\n`);
  console.log('Next steps:\n');
  console.log(`  1. cd ${projectName}`);
  console.log(`  2. cp .env.example .env`);
  console.log(`  3. Add your OPENAI_API_KEY to .env`);
  console.log(`  4. npm run dev\n`);
  console.log('To open with Obsidian:');
  console.log(`  - Obsidian → Open folder as vault → Select "${projectName}"\n`);
  console.log('Happy documenting! 📝\n');
}

// Parse command line arguments
const projectName = process.argv[2];

if (!projectName) {
  console.log('Usage: npx create-eddie <project-name>');
  console.log('\nExample:');
  console.log('  npx create-eddie my-docs');
  process.exit(1);
}

// Validate project name
if (!/^[a-z0-9-_]+$/i.test(projectName)) {
  console.error('❌ Error: Project name can only contain letters, numbers, hyphens, and underscores');
  process.exit(1);
}

createEddieProject(projectName);
