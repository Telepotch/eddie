import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'PROJECT_NAME',
  description: 'Documentation powered by Eddie',

  ignoreDeadLinks: true,

  markdown: {
    config: (md) => {
      // Store original render method
      const originalRender = md.render.bind(md)

      // Override render to pre-process content
      md.render = function(src, env) {
        // Convert Obsidian hybrid links: [[text]](link) -> [text](link)
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
    sidebar: 'auto',

    search: {
      provider: 'local'
    }
  },

  head: [
    // Load mermaid from CDN
    ['script', { src: 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js' }],
    ['script', {}, 'mermaid.initialize({ startOnLoad: true });']
  ]
})
