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
    'edit/4.publish📚/.vitepress/theme',
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

  // Copy VitePress config from template
  console.log('⚙️  Creating VitePress config...');
  const configTemplatePath = path.join(__dirname, 'templates/config.js');
  let configContent = fs.readFileSync(configTemplatePath, 'utf-8');

  // Replace PROJECT_NAME placeholder
  configContent = configContent.replace(/PROJECT_NAME/g, projectName);

  fs.writeFileSync(
    path.join(projectDir, '.system/site-config/config.js'),
    configContent
  );

  // Copy theme files
  console.log('🎨 Creating theme files...');
  const themeIndexPath = path.join(__dirname, 'templates/theme-index.js');
  const customCssPath = path.join(__dirname, 'templates/custom.css');
  fs.copyFileSync(
    themeIndexPath,
    path.join(projectDir, 'edit/4.publish📚/.vitepress/theme/index.js')
  );
  fs.copyFileSync(
    customCssPath,
    path.join(projectDir, 'edit/4.publish📚/.vitepress/theme/custom.css')
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
