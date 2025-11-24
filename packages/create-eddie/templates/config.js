import { defineConfig } from 'vitepress'
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
  title: 'PROJECT_NAME',
  description: 'Documentation powered by Eddie',

  appearance: 'light', // Force light mode
  ignoreDeadLinks: true,

  markdown: {
    // Pre-process markdown to convert Obsidian hybrid links
    // [[text]](link) -> [text](link)
    async: true,

    // Simpler code block colors
    theme: 'min-light',

    config: (md) => {
      // Store original render method
      const originalRender = md.render.bind(md)

      // Override render to pre-process content
      md.render = function(src, env) {
        // Convert [[text]](link) to [text](link)
        const processed = src.replace(/\[\[([^\]]+)\]\]\(([^)]+)\)/g, '[$1]($2)')
        return originalRender(processed, env)
      }

      // Enable mermaid diagrams
      const defaultFence = md.renderer.rules.fence
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        const code = token.content.trim()
        const info = token.info ? md.utils.unescapeAll(token.info).trim() : ''

        if (info === 'mermaid') {
          return `<div class="mermaid">${code}</div>`
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

  // Vite configuration for asset handling
  vite: {
    assetsInclude: [
      '**/*.JPG',      // Uppercase extensions
      '**/*.jpg',
      '**/*.jpeg',
      '**/*.JPEG',
      '**/*.png',
      '**/*.PNG',
      '**/*.gif',
      '**/*.GIF',
      '**/*.webp',
      '**/*.WEBP',
      '**/*.svg',
      '**/*.SVG',
      '**/images/**',  // images directory
      '**/assets/**'   // assets directory
    ]
  },

  head: [
    // Load mermaid from CDN
    ['script', { src: 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js' }],
    ['script', {}, 'mermaid.initialize({ startOnLoad: true });']
  ],

  // Copy Markdown files to dist for download feature
  buildEnd: async (siteConfig) => {
    console.log('🔧 buildEnd hook: Copying Markdown files to dist...')

    // Get the source directory (PUBLISH_DIR placeholder will be replaced during project creation)
    const srcDir = path.resolve(__dirname, '../../PUBLISH_DIR')
    const outDir = siteConfig.outDir

    console.log('Source directory:', srcDir)
    console.log('Output directory:', outDir)

    // Find all .md files in the source directory (not recursive)
    const mdFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.md'))
    console.log('Found Markdown files:', mdFiles.length)

    // Copy each .md file to dist
    for (const file of mdFiles) {
      const srcPath = path.join(srcDir, file)
      const destPath = path.join(outDir, file)
      fs.copyFileSync(srcPath, destPath)
      console.log(`  ✅ Copied: ${file}`)
    }

    console.log(`✅ Copied ${mdFiles.length} Markdown files to dist/`)
  }
})
