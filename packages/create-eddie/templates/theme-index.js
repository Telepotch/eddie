import DefaultTheme from 'vitepress/theme'
import { onMounted } from 'vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  setup() {
    onMounted(() => {
      console.log('🔧 Eddie theme loaded!')

      // Insert download button next to search button
      const insertDownloadButton = () => {
        if (document.querySelector('.download-button')) return

        // Find the VPNavBarSearch container (the wrapper around search button)
        const searchContainer = document.querySelector('.VPNavBarSearch')

        if (!searchContainer) {
          console.log('Search container not found yet')
          return
        }

        const btn = document.createElement('button')
        btn.className = 'download-button VPNavBarIconLink'
        btn.setAttribute('aria-label', 'Download')
        btn.innerHTML = `
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 20px; height: 20px; flex-shrink: 0;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <span class="download-text">Download</span>
        `

        btn.onclick = async () => {
          // Show download menu
          const menu = document.createElement('div')
          menu.className = 'download-menu'
          menu.innerHTML = `
            <button class="download-menu-item" data-action="current-md">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 18px; height: 18px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span>Markdown</span>
            </button>
            <button class="download-menu-item" data-action="current-pdf">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 18px; height: 18px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10h6M9 14h6"/>
              </svg>
              <span>PDF</span>
            </button>
            <button class="download-menu-item" data-action="current-docx">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 18px; height: 18px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 8h6"/>
              </svg>
              <span>Word</span>
            </button>
            <button class="download-menu-item" data-action="all">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 18px; height: 18px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              <span>All Pages (Markdown ZIP)</span>
            </button>
          `

          // Position menu below button (right-aligned to prevent cutoff)
          const rect = btn.getBoundingClientRect()
          menu.style.top = `${rect.bottom + 8}px`
          menu.style.right = `${window.innerWidth - rect.right}px`
          document.body.appendChild(menu)

          // Close menu on outside click
          const closeMenu = (e) => {
            if (!menu.contains(e.target) && e.target !== btn) {
              menu.remove()
              document.removeEventListener('click', closeMenu)
            }
          }
          setTimeout(() => document.addEventListener('click', closeMenu), 0)

          // Handle menu item clicks
          menu.querySelectorAll('.download-menu-item').forEach(item => {
            item.onclick = async () => {
              menu.remove()
              const action = item.dataset.action

              if (action === 'current-md') {
                await downloadCurrentPage('md')
              } else if (action === 'current-pdf') {
                await downloadCurrentPage('pdf')
              } else if (action === 'current-docx') {
                await downloadCurrentPage('docx')
              } else if (action === 'all') {
                await downloadAllPages()
              }
            }
          })
        }

        // Download current page
        async function downloadCurrentPage(format = 'md') {
          try {
            const path = window.location.pathname
            let mdPath = path.endsWith('/') ? path + 'index.md' : path + '.md'

            const response = await fetch(mdPath)
            if (!response.ok) throw new Error('File not found')

            const markdown = await response.text()
            const baseName = mdPath.split('/').pop().replace('.md', '')

            if (format === 'md') {
              // Markdown download
              const blob = new Blob([markdown], { type: 'text/markdown' })
              downloadFile(blob, `${baseName}.md`)
            } else if (format === 'pdf') {
              // PDF download
              await downloadAsPDF(markdown, baseName)
            } else if (format === 'docx') {
              // Word download
              await downloadAsWord(markdown, baseName)
            }
          } catch (error) {
            console.error('Download failed:', error)
            alert('ダウンロードに失敗しました')
          }
        }

        // Helper: Download file
        function downloadFile(blob, filename) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = filename
          a.click()
          URL.revokeObjectURL(url)
        }

        // Convert Markdown to PDF
        async function downloadAsPDF(markdown, filename) {
          // Load jsPDF from CDN
          if (!window.jspdf) {
            await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2/dist/jspdf.umd.min.js')
          }

          const { jsPDF } = window.jspdf
          const doc = new jsPDF()

          // Simple text layout (no formatting)
          const lines = doc.splitTextToSize(markdown, 180)
          doc.text(lines, 10, 10)

          doc.save(`${filename}.pdf`)
        }

        // Convert Markdown to Word
        async function downloadAsWord(markdown, filename) {
          // Load docx from CDN
          if (!window.docx) {
            await loadScript('https://cdn.jsdelivr.net/npm/docx@8/build/index.js')
          }

          const { Document, Packer, Paragraph, TextRun } = window.docx

          // Simple paragraph conversion
          const paragraphs = markdown.split('\n\n').map(text =>
            new Paragraph({
              children: [new TextRun(text)]
            })
          )

          const doc = new Document({
            sections: [{ children: paragraphs }]
          })

          const blob = await Packer.toBlob(doc)
          downloadFile(blob, `${filename}.docx`)
        }

        // Load external script
        function loadScript(src) {
          return new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = src
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
        }

        // Download all pages as ZIP
        async function downloadAllPages() {
          try {
            // Load JSZip from CDN
            if (!window.JSZip) {
              await new Promise((resolve, reject) => {
                const script = document.createElement('script')
                script.src = 'https://cdn.jsdelivr.net/npm/jszip@3/dist/jszip.min.js'
                script.onload = resolve
                script.onerror = reject
                document.head.appendChild(script)
              })
            }

            const zip = new window.JSZip()

            // Get all markdown links from sidebar
            const links = Array.from(document.querySelectorAll('.VPSidebar a'))
              .map(a => a.getAttribute('href'))
              .filter(href => href && !href.startsWith('http'))
              .map(href => href.endsWith('/') ? href + 'index.md' : href + '.md')

            // Add current page if not in list
            const currentPath = window.location.pathname
            const currentMd = currentPath.endsWith('/') ? currentPath + 'index.md' : currentPath + '.md'
            if (!links.includes(currentMd)) {
              links.push(currentMd)
            }

            // Fetch all markdown files
            let successCount = 0
            for (const mdPath of links) {
              try {
                const response = await fetch(mdPath)
                if (response.ok) {
                  const content = await response.text()
                  const fileName = mdPath.replace(/^\//, '').replace(/\//g, '_')
                  zip.file(fileName, content)
                  successCount++
                }
              } catch (e) {
                console.warn(`Failed to fetch ${mdPath}:`, e)
              }
            }

            if (successCount === 0) {
              alert('ダウンロード可能なファイルが見つかりませんでした')
              return
            }

            // Generate ZIP
            const zipBlob = await zip.generateAsync({ type: 'blob' })
            const url = URL.createObjectURL(zipBlob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'eddie-docs-all.zip'
            a.click()
            URL.revokeObjectURL(url)

            console.log(`✅ Downloaded ${successCount} files as ZIP`)
          } catch (error) {
            console.error('ZIP download failed:', error)
            alert('ZIPダウンロードに失敗しました')
          }
        }

        // Insert directly inside the navbar actions container
        const navbarActions = document.querySelector('.VPNavBar .content-body .content')
        if (navbarActions) {
          navbarActions.appendChild(btn)
          console.log('✅ Download button inserted into navbar actions')
        } else {
          // Fallback: insert after search container
          searchContainer.parentElement.insertBefore(btn, searchContainer.nextSibling)
          console.log('✅ Download button inserted after search container (fallback)')
        }
      }

      // Initial insert
      insertDownloadButton()

      // Watch for navigation changes (SPA)
      const observer = new MutationObserver(insertDownloadButton)
      observer.observe(document.body, { childList: true, subtree: true })
    })
  }
}
