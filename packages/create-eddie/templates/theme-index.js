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
          console.log('📥 Download button clicked')
          console.log('Current URL:', window.location.href)
          console.log('Pathname:', window.location.pathname)

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
              console.log('🔽 Menu item clicked:', action)

              if (action === 'current-md') {
                console.log('🔽 Starting Markdown download')
                await downloadCurrentPage('md')
              } else if (action === 'current-pdf') {
                console.log('🔽 Starting PDF download')
                await downloadCurrentPage('pdf')
              } else if (action === 'current-docx') {
                console.log('🔽 Starting Word download')
                await downloadCurrentPage('docx')
              } else if (action === 'all') {
                console.log('🔽 Starting ZIP download (all pages)')
                await downloadAllPages()
              }
            }
          })
        }

        // Download current page
        async function downloadCurrentPage(format = 'md') {
          console.log(`📄 downloadCurrentPage called with format: ${format}`)

          try {
            const path = window.location.pathname
            console.log('Current path:', path)

            // Convert path to .md file path
            let mdPath = path
              .replace(/\.html$/, '')  // Remove .html if present
              .replace(/\/$/, '')      // Remove trailing / if present

            // Add .md extension if not present
            if (!mdPath.endsWith('.md')) {
              mdPath = mdPath + '.md'
            }

            // Handle root path
            if (mdPath === '.md') {
              mdPath = '/index.md'
            }

            console.log('Converted mdPath:', mdPath)
            console.log('About to fetch:', mdPath)

            const response = await fetch(mdPath)
            console.log('Fetch response status:', response.status)
            console.log('Fetch response ok:', response.ok)
            console.log('Fetch response URL:', response.url)

            if (!response.ok) {
              console.error('❌ Fetch failed:', response.status, response.statusText)
              throw new Error('File not found')
            }

            const markdown = await response.text()
            console.log('✅ Markdown fetched successfully')
            console.log('Markdown length:', markdown.length)
            console.log('First 100 chars:', markdown.substring(0, 100))

            // Extract title from markdown (first # heading) or fall back to path-based name
            let baseName = mdPath.split('/').pop().replace('.md', '')
            const titleMatch = markdown.match(/^#\s+(.+)$/m)
            if (titleMatch) {
              baseName = titleMatch[1].trim()
                .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s-]/g, '') // Remove special chars
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .toLowerCase()
              console.log('📝 Extracted title from markdown:', titleMatch[1])
            }
            console.log('Base filename:', baseName)

            if (format === 'md') {
              console.log('💾 Creating Markdown blob')
              const blob = new Blob([markdown], { type: 'text/markdown' })
              downloadFile(blob, `${baseName}.md`)
              console.log('✅ Markdown download triggered')
            } else if (format === 'pdf') {
              console.log('📑 Starting PDF generation')
              await downloadAsPDF(markdown, baseName)
            } else if (format === 'docx') {
              console.log('📘 Starting Word generation')
              await downloadAsWord(markdown, baseName)
            }
          } catch (error) {
            console.error('❌ Download failed:', error)
            console.error('Error name:', error.name)
            console.error('Error message:', error.message)
            console.error('Error stack:', error.stack)
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
          console.log('📑 downloadAsPDF called')
          console.log('Markdown length:', markdown.length)
          console.log('Filename:', filename)

          try {
            // Load marked.js for proper Markdown parsing
            if (typeof marked === 'undefined') {
              console.log('⬇️ Loading marked.js library...')
              await loadScript('https://cdn.jsdelivr.net/npm/marked@16.3.0/lib/marked.umd.js')
              console.log('✅ marked.js loaded')
              console.log('marked object:', typeof marked)
            } else {
              console.log('✅ marked.js already loaded')
            }

            // Load html2pdf for PDF generation
            if (!window.html2pdf) {
              console.log('⬇️ Loading html2pdf library...')
              await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js')
              console.log('✅ html2pdf loaded')
            } else {
              console.log('✅ html2pdf already loaded')
            }

            // Convert markdown to HTML using marked (preserves structure)
            console.log('🔄 Converting markdown to HTML with marked.js')
            console.log('Calling marked.parse()...')
            const htmlContent = marked.parse(markdown)
            console.log('HTML content length:', htmlContent.length)

            // Create styled container
            const element = document.createElement('div')
            element.innerHTML = htmlContent
            element.style.fontFamily = 'Arial, sans-serif'
            element.style.fontSize = '11pt'
            element.style.lineHeight = '1.6'
            element.style.color = '#333'

            // Apply heading styles with page break control
            const style = document.createElement('style')
            style.textContent = `
              @page {
                margin: 20mm;
              }

              body {
                font-size: 11pt;
                line-height: 1.6;
              }

              h1 {
                font-size: 20pt;
                font-weight: bold;
                margin-top: 24pt;
                margin-bottom: 12pt;
                page-break-before: always;
                page-break-after: avoid;
              }

              h1:first-child {
                page-break-before: avoid;
              }

              h2 {
                font-size: 16pt;
                font-weight: bold;
                margin-top: 18pt;
                margin-bottom: 10pt;
                page-break-after: avoid;
              }

              h3 {
                font-size: 13pt;
                font-weight: bold;
                margin-top: 14pt;
                margin-bottom: 8pt;
                page-break-after: avoid;
              }

              h4 {
                font-size: 11pt;
                font-weight: bold;
                margin-top: 12pt;
                margin-bottom: 6pt;
                page-break-after: avoid;
              }

              p {
                margin: 10pt 0;
                orphans: 3;
                widows: 3;
              }

              code {
                background-color: #f5f5f5;
                padding: 2pt 4pt;
                font-family: 'Courier New', monospace;
                font-size: 10pt;
              }

              pre {
                background-color: #f5f5f5;
                padding: 12pt;
                border: 1pt solid #ddd;
                font-family: 'Courier New', monospace;
                font-size: 9pt;
                line-height: 1.4;
                page-break-inside: avoid;
                overflow-x: auto;
                white-space: pre-wrap;
                word-wrap: break-word;
              }

              blockquote {
                border-left: 3pt solid #ccc;
                padding-left: 12pt;
                margin: 12pt 0;
                color: #666;
                font-style: italic;
                page-break-inside: avoid;
              }

              ul, ol {
                margin: 10pt 0;
                padding-left: 24pt;
              }

              li {
                margin: 6pt 0;
              }

              table {
                border-collapse: collapse;
                margin: 12pt 0;
                page-break-inside: avoid;
              }

              th, td {
                border: 1pt solid #ddd;
                padding: 8pt;
                text-align: left;
              }

              th {
                background-color: #f5f5f5;
                font-weight: bold;
              }

              img {
                max-width: 100%;
                page-break-inside: avoid;
              }
            `
            element.appendChild(style)

            console.log('🖨️ Generating PDF with proper margins and page breaks...')
            const pdfOptions = {
              margin: [20, 20, 20, 20],  // top, right, bottom, left (mm)
              filename: `${filename}.pdf`,
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true
              },
              jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
              },
              pagebreak: {
                mode: 'css'  // Use CSS page-break properties only (avoid-all causes blank pages)
              }
            }

            await window.html2pdf().set(pdfOptions).from(element).save()
            console.log('✅ PDF saved:', `${filename}.pdf`)
          } catch (error) {
            console.error('❌ PDF generation failed:', error)
            console.error('Error stack:', error.stack)
            alert('PDF generation failed. Please try downloading as Markdown instead.')
          }
        }

        // Convert Markdown to Word
        async function downloadAsWord(markdown, filename) {
          console.log('📘 downloadAsWord called')
          console.log('Markdown length:', markdown.length)
          console.log('Filename:', filename)

          try {
            // Load marked.js for proper Markdown parsing
            if (typeof marked === 'undefined') {
              console.log('⬇️ Loading marked.js library...')
              await loadScript('https://cdn.jsdelivr.net/npm/marked@16.3.0/lib/marked.umd.js')
              console.log('✅ marked.js loaded')
              console.log('marked object:', typeof marked)
            } else {
              console.log('✅ marked.js already loaded')
            }

            // Load html-docx-js from CDN (simpler, browser-friendly)
            if (!window.htmlDocx) {
              console.log('⬇️ Loading html-docx-js library...')
              await loadScript('https://cdn.jsdelivr.net/npm/html-docx-js@0.3.1/dist/html-docx.js')
              console.log('✅ html-docx-js loaded')
            } else {
              console.log('✅ html-docx-js already loaded')
            }

            // Convert markdown to HTML using marked (preserves heading structure)
            console.log('🔄 Converting markdown to HTML with marked.js')
            console.log('Calling marked.parse()...')
            const bodyContent = marked.parse(markdown)
            console.log('Parsed HTML length:', bodyContent.length)

            // Create full HTML document with styles for Word
            // html-docx-js will convert <h1> to Word "Heading 1" style, <h2> to "Heading 2", etc.
            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.6; }
    h1 { font-size: 20pt; font-weight: bold; margin-top: 24pt; margin-bottom: 12pt; }
    h2 { font-size: 16pt; font-weight: bold; margin-top: 18pt; margin-bottom: 10pt; }
    h3 { font-size: 14pt; font-weight: bold; margin-top: 14pt; margin-bottom: 8pt; }
    h4 { font-size: 12pt; font-weight: bold; margin-top: 12pt; margin-bottom: 6pt; }
    p { margin: 10pt 0; }
    code { background-color: #f4f4f4; padding: 2pt 4pt; font-family: Consolas, monospace; }
    pre { background-color: #f4f4f4; padding: 10pt; border: 1pt solid #ddd; font-family: Consolas, monospace; }
    blockquote { border-left: 4pt solid #ddd; padding-left: 12pt; margin: 10pt 0; color: #666; }
    ul, ol { margin: 10pt 0; padding-left: 24pt; }
    li { margin: 6pt 0; }
    table { border-collapse: collapse; margin: 10pt 0; }
    th, td { border: 1pt solid #ddd; padding: 8pt; }
  </style>
</head>
<body>
${bodyContent}
</body>
</html>
`
            console.log('Full HTML document length:', htmlContent.length)

            console.log('📝 Converting HTML to Word document (h1→見出し1, h2→見出し2)')
            const converted = window.htmlDocx.asBlob(htmlContent)
            console.log('Word blob size:', converted.size)

            downloadFile(converted, `${filename}.docx`)
            console.log('✅ Word saved with structured headings:', `${filename}.docx`)
          } catch (error) {
            console.error('❌ Word generation failed:', error)
            console.error('Error stack:', error.stack)
            alert('Word generation failed. Please try downloading as Markdown instead.')
          }
        }

        // Load external script
        function loadScript(src) {
          console.log('📥 loadScript:', src)
          return new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = src
            script.onload = () => {
              console.log('✅ Script loaded successfully:', src)
              resolve()
            }
            script.onerror = (error) => {
              console.error('❌ Script load failed:', src, error)
              reject(error)
            }
            document.head.appendChild(script)
          })
        }

        // Download all pages as ZIP
        async function downloadAllPages() {
          console.log('📦 downloadAllPages called')

          try {
            // Load JSZip from CDN
            if (!window.JSZip) {
              console.log('⬇️ Loading JSZip library...')
              await loadScript('https://cdn.jsdelivr.net/npm/jszip@3/dist/jszip.min.js')
              console.log('✅ JSZip loaded')
            } else {
              console.log('✅ JSZip already loaded')
            }

            const zip = new window.JSZip()
            console.log('📦 ZIP instance created')

            // Get all markdown links from sidebar
            const links = Array.from(document.querySelectorAll('.VPSidebar a'))
              .map(a => a.getAttribute('href'))
              .filter(href => href && !href.startsWith('http'))
              .map(href => {
                // Convert .html to .md (replace, not append)
                if (href.endsWith('.html')) {
                  return href.replace(/\.html$/, '.md')
                } else if (href.endsWith('/')) {
                  return href + 'index.md'
                } else {
                  return href + '.md'
                }
              })

            console.log('Found sidebar links:', links.length)
            console.log('Links:', links)

            // Add current page if not in list
            const currentPath = window.location.pathname
            const currentMd = currentPath.endsWith('/') ? currentPath + 'index.md' : currentPath + '.md'
            if (!links.includes(currentMd)) {
              links.push(currentMd)
              console.log('Added current page:', currentMd)
            }

            console.log('Total links to fetch:', links.length)

            // Fetch all markdown files
            let successCount = 0
            for (const mdPath of links) {
              try {
                console.log(`Fetching: ${mdPath}`)
                const response = await fetch(mdPath)
                console.log(`Response for ${mdPath}: ${response.status}`)
                if (response.ok) {
                  const content = await response.text()
                  const fileName = mdPath.replace(/^\//, '').replace(/\//g, '_')
                  zip.file(fileName, content)
                  successCount++
                  console.log(`✅ Added to ZIP: ${fileName}`)
                } else {
                  console.warn(`❌ Failed to fetch ${mdPath}: ${response.status}`)
                }
              } catch (e) {
                console.warn(`❌ Exception fetching ${mdPath}:`, e)
              }
            }

            console.log(`Total files successfully fetched: ${successCount}/${links.length}`)

            if (successCount === 0) {
              console.error('❌ No files could be downloaded')
              alert('ダウンロード可能なファイルが見つかりませんでした')
              return
            }

            // Generate ZIP
            console.log('📦 Generating ZIP file...')
            const zipBlob = await zip.generateAsync({ type: 'blob' })
            console.log('ZIP blob size:', zipBlob.size)

            const url = URL.createObjectURL(zipBlob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'eddie-docs-all.zip'
            a.click()
            URL.revokeObjectURL(url)

            console.log(`✅ Downloaded ${successCount} files as ZIP`)
          } catch (error) {
            console.error('❌ ZIP download failed:', error)
            console.error('Error stack:', error.stack)
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
