'use client';

import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import { Download, Trash2, Upload, FileText } from 'lucide-react';

// Client-side only libraries
let jsPDF: any;
let html2canvas: any;
let mermaid: any;

if (typeof window !== 'undefined') {
    import('jspdf').then(module => { jsPDF = module.jsPDF; });
    import('html2canvas').then(module => { html2canvas = module.default; });
    import('mermaid').then(module => {
        mermaid = module.default;
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'Inter, Arial, sans-serif'
        });
    });
}

export default function Converter() {
    const [markdown, setMarkdown] = useState('');
    const [pageSize, setPageSize] = useState('a4');
    const [orientation, setOrientation] = useState('portrait');
    const [isGenerating, setIsGenerating] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [mermaidRendered, setMermaidRendered] = useState(false);

    // Custom marked renderer with Mermaid support
    const getParsedHtml = async (md: string) => {
        const renderer = new marked.Renderer();

        // Add IDs to headings for internal links
        renderer.heading = ({ text, depth, raw }) => {
            const id = raw.toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            return `<h${depth} id="${id}">${text}</h${depth}>`;
        };

        // Handle links
        renderer.link = ({ href, title, text }) => {
            const isInternal = href.startsWith('#');
            return `<a href="${href}" ${title ? `title="${title}"` : ''} class="${isInternal ? 'internal-link' : 'external-link'}">${text}</a>`;
        };

        // Handle code blocks - detect Mermaid
        renderer.code = ({ text, lang }) => {
            if (lang === 'mermaid') {
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                return `<div class="mermaid-diagram" id="${id}">${text}</div>`;
            }
            return `<pre><code class="language-${lang || ''}">${text}</code></pre>`;
        };

        // Handle images - ensure they're properly embedded
        renderer.image = ({ href, title, text }) => {
            return `<img src="${href}" alt="${text}" ${title ? `title="${title}"` : ''} crossorigin="anonymous" />`;
        };

        return marked.parse(md, { renderer }) as string;
    };

    // Render Mermaid diagrams
    const renderMermaidDiagrams = async () => {
        if (!mermaid || !previewRef.current) return;

        const diagrams = previewRef.current.querySelectorAll('.mermaid-diagram');

        for (let i = 0; i < diagrams.length; i++) {
            const diagram = diagrams[i] as HTMLElement;
            const code = diagram.textContent || '';
            const id = diagram.id;

            try {
                const { svg } = await mermaid.render(`mermaid-svg-${id}`, code);
                diagram.innerHTML = svg;
                diagram.classList.add('mermaid-rendered');
            } catch (error) {
                console.error('Mermaid rendering error:', error);
                diagram.innerHTML = `<pre style="color: red;">Error rendering diagram: ${error}</pre>`;
            }
        }
        setMermaidRendered(true);
    };

    // Initialize with sample content
    useEffect(() => {
        const saved = localStorage.getItem('markdownContent');
        if (saved) {
            setMarkdown(saved);
        } else {
            setMarkdown(`# Welcome to MarkdownPDF! 🎉

## Features

- ✨ **Real-time preview**: See changes as you type
- 🚀 **Lightning-fast**: Instant conversion to PDF
- 🔒 **Secure**: Everything stays in your browser
- 🎨 **Mermaid Support**: Create flowcharts and diagrams

## Example Code

\`\`\`javascript
function greet(name) {
    console.log(\`Hello, \${name}!\`);
}
\`\`\`

## Mermaid Diagram

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> A
\`\`\`

---

**Ready to start?** Edit this text or upload your own file!`);
        }
    }, []);

    // Update preview when markdown changes
    useEffect(() => {
        if (markdown) {
            localStorage.setItem('markdownContent', markdown);
            updatePreview();
        }
    }, [markdown]);

    const updatePreview = async () => {
        if (!previewRef.current) return;
        const html = await getParsedHtml(markdown);
        previewRef.current.innerHTML = html;

        // Render Mermaid diagrams after a short delay
        setTimeout(() => {
            renderMermaidDiagrams();
        }, 100);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setMarkdown(content);
        };
        reader.readAsText(file);
    };

    const downloadPDF = async () => {
        if (!markdown.trim() || !jsPDF) {
            alert('PDF libraries are still loading. Please try again in a moment.');
            return;
        }

        setIsGenerating(true);
        try {
            // Get filename from first heading
            let filename = 'document';
            const firstHeading = markdown.match(/^#\s+(.+)$/m);
            if (firstHeading && firstHeading[1]) {
                filename = firstHeading[1].trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50);
            }

            // Initialize PDF with proper settings
            const pdf = new jsPDF({
                orientation: orientation as any,
                unit: 'mm',
                format: pageSize,
                compress: true,
                putOnlyUsedFonts: true
            });

            // Page dimensions
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Professional margins (20mm = ~0.79 inches)
            const margin = {
                top: 20,
                right: 20,
                bottom: 25, // Extra space for footer
                left: 20
            };

            const contentWidth = pageWidth - margin.left - margin.right;
            let currentY = margin.top;
            let pageNumber = 1;

            // Helper function to add header
            const addHeader = () => {
                pdf.setFontSize(8);
                pdf.setTextColor(150, 150, 150);
                pdf.setFont('helvetica', 'normal');
                const headerText = firstHeading && firstHeading[1] ? firstHeading[1].substring(0, 60) : 'Document';
                pdf.text(headerText, margin.left, 12);
            };

            // Helper function to add footer with page number
            const addFooter = () => {
                pdf.setFontSize(8);
                pdf.setTextColor(150, 150, 150);
                pdf.setFont('helvetica', 'normal');
                const footerText = `Page ${pageNumber}`;
                const textWidth = pdf.getTextWidth(footerText);
                pdf.text(footerText, (pageWidth - textWidth) / 2, pageHeight - 10);
            };

            // Helper function to check if we need a new page
            const checkPageBreak = (requiredHeight: number) => {
                if (currentY + requiredHeight > pageHeight - margin.bottom) {
                    addFooter();
                    pdf.addPage();
                    pageNumber++;
                    currentY = margin.top;
                    addHeader();
                    currentY = margin.top + 10; // Space after header
                    return true;
                }
                return false;
            };

            // Add first page header
            addHeader();
            currentY = margin.top + 10;

            // Parse markdown into lines and process
            const lines = markdown.split('\n');
            let i = 0;
            let inCodeBlock = false;
            let codeBlockContent: string[] = [];
            let codeBlockLang = '';
            let inList = false;
            let listItems: string[] = [];
            let listType: 'ul' | 'ol' = 'ul';

            const renderText = (text: string, x: number, maxWidth: number): number => {
                // Handle bold and italic
                const parts: Array<{ text: string, bold: boolean, italic: boolean, code: boolean }> = [];
                let current = text;
                let buffer = '';

                while (current.length > 0) {
                    // Check for inline code
                    const codeMatch = current.match(/^`([^`]+)`/);
                    if (codeMatch) {
                        if (buffer) parts.push({ text: buffer, bold: false, italic: false, code: false });
                        parts.push({ text: codeMatch[1], bold: false, italic: false, code: true });
                        current = current.substring(codeMatch[0].length);
                        buffer = '';
                        continue;
                    }

                    // Check for bold
                    const boldMatch = current.match(/^\*\*([^*]+)\*\*/);
                    if (boldMatch) {
                        if (buffer) parts.push({ text: buffer, bold: false, italic: false, code: false });
                        parts.push({ text: boldMatch[1], bold: true, italic: false, code: false });
                        current = current.substring(boldMatch[0].length);
                        buffer = '';
                        continue;
                    }

                    // Check for italic
                    const italicMatch = current.match(/^\*([^*]+)\*/);
                    if (italicMatch) {
                        if (buffer) parts.push({ text: buffer, bold: false, italic: false, code: false });
                        parts.push({ text: italicMatch[1], bold: false, italic: true, code: false });
                        current = current.substring(italicMatch[0].length);
                        buffer = '';
                        continue;
                    }

                    buffer += current[0];
                    current = current.substring(1);
                }

                if (buffer) parts.push({ text: buffer, bold: false, italic: false, code: false });

                // Render parts
                let currentX = x;
                let lineHeight = 0;

                parts.forEach(part => {
                    if (part.code) {
                        pdf.setFont('courier', 'normal');
                        pdf.setFontSize(9);
                        pdf.setTextColor(199, 37, 78);
                    } else {
                        pdf.setFont('helvetica', part.bold ? 'bold' : (part.italic ? 'italic' : 'normal'));
                    }

                    const lines = pdf.splitTextToSize(part.text, maxWidth - (currentX - x));
                    lines.forEach((line: string, idx: number) => {
                        if (idx > 0) {
                            currentY += lineHeight || 5;
                            currentX = x;
                        }
                        pdf.text(line, currentX, currentY);
                        currentX += pdf.getTextWidth(line);
                        lineHeight = 5;
                    });
                });

                return lineHeight || 5;
            };

            while (i < lines.length) {
                let line = lines[i];

                // Handle code blocks
                if (line.trim().startsWith('```')) {
                    if (!inCodeBlock) {
                        inCodeBlock = true;
                        codeBlockLang = line.trim().substring(3);
                        codeBlockContent = [];
                    } else {
                        // Render code block
                        inCodeBlock = false;
                        const codeHeight = (codeBlockContent.length * 4.5) + 10;
                        checkPageBreak(codeHeight);

                        // Background
                        pdf.setFillColor(245, 245, 245);
                        pdf.rect(margin.left, currentY - 2, contentWidth, codeHeight, 'F');

                        // Left border
                        pdf.setDrawColor(102, 102, 102);
                        pdf.setLineWidth(1);
                        pdf.line(margin.left, currentY - 2, margin.left, currentY + codeHeight - 2);

                        // Code text
                        pdf.setFont('courier', 'normal');
                        pdf.setFontSize(8);
                        pdf.setTextColor(26, 26, 26);

                        codeBlockContent.forEach((codeLine, idx) => {
                            pdf.text(codeLine, margin.left + 5, currentY + (idx * 4.5) + 3);
                        });

                        currentY += codeHeight + 5;
                        codeBlockContent = [];
                    }
                    i++;
                    continue;
                }

                if (inCodeBlock) {
                    codeBlockContent.push(line);
                    i++;
                    continue;
                }

                // Handle headings
                if (line.match(/^#{1,6}\s/)) {
                    const level = line.match(/^#+/)?.[0].length || 1;
                    const text = line.replace(/^#+\s/, '').trim();

                    const sizes = [18, 14, 12, 11];
                    const fontSize = sizes[level - 1] || 10;

                    checkPageBreak(fontSize + 8);

                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(fontSize);
                    pdf.setTextColor(26, 26, 26);

                    const textLines = pdf.splitTextToSize(text, contentWidth);
                    textLines.forEach((textLine: string) => {
                        pdf.text(textLine, margin.left, currentY);
                        currentY += fontSize * 0.4;
                    });

                    // Underline for H1 and H2
                    if (level <= 2) {
                        pdf.setDrawColor(level === 1 ? 204 : 224, level === 1 ? 204 : 224, level === 1 ? 204 : 224);
                        pdf.setLineWidth(0.2);
                        pdf.line(margin.left, currentY + 1, pageWidth - margin.right, currentY + 1);
                    }

                    currentY += level === 1 ? 8 : 6;
                    i++;
                    continue;
                }

                // Handle horizontal rules (page breaks)
                if (line.trim() === '---') {
                    addFooter();
                    pdf.addPage();
                    pageNumber++;
                    currentY = margin.top;
                    addHeader();
                    currentY = margin.top + 10;
                    i++;
                    continue;
                }

                // Handle lists
                const ulMatch = line.match(/^(\s*)[-*+]\s+(.+)/);
                const olMatch = line.match(/^(\s*)\d+\.\s+(.+)/);

                if (ulMatch || olMatch) {
                    const indent = (ulMatch?.[1].length || olMatch?.[1].length || 0) / 2;
                    const text = ulMatch?.[2] || olMatch?.[2] || '';
                    const bullet = ulMatch ? '•' : `${i + 1}.`;

                    checkPageBreak(8);

                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(10);
                    pdf.setTextColor(44, 44, 44);

                    const bulletX = margin.left + (indent * 5);
                    pdf.text(bullet, bulletX, currentY);

                    const textLines = pdf.splitTextToSize(text, contentWidth - (indent * 5) - 8);
                    textLines.forEach((textLine: string, idx: number) => {
                        pdf.text(textLine, bulletX + 6, currentY + (idx * 5));
                    });

                    currentY += textLines.length * 5 + 2;
                    i++;
                    continue;
                }

                // Handle blockquotes
                if (line.trim().startsWith('>')) {
                    const text = line.replace(/^>\s*/, '');
                    checkPageBreak(10);

                    pdf.setFillColor(249, 249, 249);
                    const quoteHeight = 8;
                    pdf.rect(margin.left, currentY - 2, contentWidth, quoteHeight, 'F');

                    pdf.setDrawColor(102, 102, 102);
                    pdf.setLineWidth(1);
                    pdf.line(margin.left, currentY - 2, margin.left, currentY + quoteHeight - 2);

                    pdf.setFont('helvetica', 'italic');
                    pdf.setFontSize(10);
                    pdf.setTextColor(44, 44, 44);
                    pdf.text(text, margin.left + 5, currentY + 3);

                    currentY += quoteHeight + 3;
                    i++;
                    continue;
                }

                // Handle regular paragraphs
                if (line.trim()) {
                    checkPageBreak(10);

                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(10);
                    pdf.setTextColor(44, 44, 44);

                    const textLines = pdf.splitTextToSize(line, contentWidth);
                    textLines.forEach((textLine: string) => {
                        checkPageBreak(6);
                        renderText(textLine, margin.left, contentWidth);
                        currentY += 5;
                    });

                    currentY += 3;
                } else {
                    currentY += 3;
                }

                i++;
            }

            // Add final footer
            addFooter();

            // Save the PDF
            pdf.save(`${filename}.pdf`);

        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const clearEditor = () => {
        if (window.confirm('Are you sure you want to clear all contents?')) {
            setMarkdown('');
        }
    };

    return (
        <section className="main-section">
            <div className="container">
                {/* Controls */}
                <div className="controls-panel">
                    <div className="control-group">
                        <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary">
                            <Upload size={18} />
                            Upload .md File
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".md,.markdown,.txt"
                            hidden
                        />
                    </div>

                    <div className="control-group">
                        <label>Page Size:</label>
                        <select
                            value={pageSize}
                            onChange={(e) => setPageSize(e.target.value)}
                            className="select-input"
                        >
                            <option value="a4">A4</option>
                            <option value="letter">Letter</option>
                            <option value="legal">Legal</option>
                            <option value="a3">A3</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label>Orientation:</label>
                        <select
                            value={orientation}
                            onChange={(e) => setOrientation(e.target.value)}
                            className="select-input"
                        >
                            <option value="portrait">Portrait</option>
                            <option value="landscape">Landscape</option>
                        </select>
                    </div>

                    <div className="control-group" style={{ marginLeft: 'auto', gap: '8px' }}>
                        <button
                            onClick={downloadPDF}
                            className="btn btn-primary"
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <>
                                    <FileText size={18} className="spinner" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Download size={18} />
                                    Download PDF
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Editor and Preview */}
                <div className="editor-container">
                    <div className="editor-panel">
                        <div className="panel-header">
                            <h2>Markdown Editor</h2>
                            <button onClick={clearEditor} className="btn-icon" title="Clear editor">
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <textarea
                            value={markdown}
                            onChange={(e) => setMarkdown(e.target.value)}
                            className="markdown-textarea"
                            placeholder="# Start writing your markdown here..."
                        />
                    </div>

                    <div className="preview-panel">
                        <div className="panel-header">
                            <h2>PDF Preview</h2>
                        </div>
                        <div className="preview-wrapper">
                            <div
                                ref={previewRef}
                                className="preview-content pdf-preview"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                /* Controls */
                .controls-panel {
                    display: flex;
                    gap: var(--spacing-md);
                    flex-wrap: wrap;
                    align-items: center;
                    padding: var(--spacing-md);
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    margin-bottom: var(--spacing-lg);
                }
                .control-group {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xs);
                }
                .select-input {
                    padding: 0.5rem 1rem;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-sm);
                    color: var(--text-primary);
                    font-family: var(--font-primary);
                    font-size: 0.9rem;
                    cursor: pointer;
                }
                .editor-container {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--spacing-lg);
                    height: calc(100vh - 350px);
                    min-height: 600px;
                }
                .editor-panel, .preview-panel {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--spacing-md);
                    background: var(--bg-tertiary);
                    border-bottom: 1px solid var(--border-color);
                }
                .markdown-textarea {
                    flex: 1;
                    padding: var(--spacing-md);
                    background: var(--bg-primary);
                    border: none;
                    color: var(--text-primary);
                    font-family: var(--font-mono);
                    font-size: 0.95rem;
                    line-height: 1.6;
                    resize: none;
                }
                
                /* Preview Wrapper - Shows Page Boundaries */
                .preview-wrapper {
                    flex: 1;
                    overflow-y: auto;
                    background: #525252;
                    padding: 20px;
                }
                
                /* PDF Preview - Exact A4 Page Simulation */
                .pdf-preview {
                    width: 210mm;
                    min-height: 297mm;
                    margin: 0 auto;
                    padding: 25.4mm;
                    background: white;
                    box-shadow: 0 0 10px rgba(0,0,0,0.3);
                    font-family: 'Inter', Arial, sans-serif;
                    font-size: 10pt;
                    line-height: 1.4;
                    color: #2c2c2c;
                    box-sizing: border-box;
                }
                
                /* Preview Styles - Match PDF Output */
                .pdf-preview h1 {
                    font-size: 18pt;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin: 0 0 6pt 0;
                    padding-bottom: 2pt;
                    border-bottom: 0.5pt solid #cccccc;
                    line-height: 1.3;
                }
                
                .pdf-preview h2 {
                    font-size: 14pt;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin: 10pt 0 5pt 0;
                    padding-bottom: 2pt;
                    border-bottom: 0.5pt solid #e0e0e0;
                    line-height: 1.3;
                }
                
                .pdf-preview h3 {
                    font-size: 12pt;
                    font-weight: 600;
                    color: #2c2c2c;
                    margin: 8pt 0 4pt 0;
                    line-height: 1.3;
                }
                
                .pdf-preview h4 {
                    font-size: 11pt;
                    font-weight: 600;
                    color: #2c2c2c;
                    margin: 6pt 0 3pt 0;
                }
                
                .pdf-preview p {
                    margin: 0 0 5pt 0;
                    color: #2c2c2c;
                    line-height: 1.4;
                }
                
                .pdf-preview strong {
                    font-weight: 600;
                    color: #1a1a1a;
                }
                
                .pdf-preview a {
                    color: #0066cc;
                    text-decoration: underline;
                }
                
                .pdf-preview ul, .pdf-preview ol {
                    margin: 0 0 5pt 0;
                    padding-left: 20pt;
                }
                
                .pdf-preview li {
                    margin-bottom: 2pt;
                }
                
                .pdf-preview pre {
                    background-color: #f5f5f5;
                    border: 0.5pt solid #d0d0d0;
                    border-left: 2pt solid #666666;
                    border-radius: 2px;
                    padding: 8pt;
                    margin: 6pt 0;
                    font-family: 'Courier New', 'Consolas', monospace;
                    font-size: 8pt;
                    line-height: 1.4;
                    overflow-x: auto;
                }
                
                .pdf-preview code {
                    font-family: 'Courier New', 'Consolas', monospace;
                    background-color: #f0f0f0;
                    color: #c7254e;
                    padding: 1pt 3pt;
                    border-radius: 2px;
                    font-size: 9pt;
                }
                
                .pdf-preview pre code {
                    background: transparent;
                    padding: 0;
                    color: #1a1a1a;
                }
                
                .pdf-preview table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 8pt 0;
                    border: 0.5pt solid #cccccc;
                }
                
                
                .pdf-preview th {
                    background-color: #f0f0f0;
                    color: #1a1a1a;
                    font-weight: 600;
                    padding: 6pt 8pt;
                    border: 0.5pt solid #cccccc;
                    font-size: 9.5pt;
                    text-align: left;
                }
                
                .pdf-preview td {
                    padding: 6pt 8pt;
                    border: 0.5pt solid #d0d0d0;
                    font-size: 9.5pt;
                }
                
                .pdf-preview tbody tr:nth-child(even) {
                    background-color: #fafafa;
                }
                
                .pdf-preview blockquote {
                    border-left: 2pt solid #666666;
                    background-color: #f9f9f9;
                    padding: 8pt 10pt;
                    margin: 8pt 0;
                }
                
                .pdf-preview img {
                    max-width: 100%;
                    height: auto;
                    margin: 10pt auto;
                    display: block;
                }
                
                .pdf-preview hr {
                    border: none;
                    border-top: 0.5pt solid #cccccc;
                    margin: 16pt 0;
                }
                
                .pdf-preview .mermaid-diagram,
                .pdf-preview .mermaid-rendered {
                    margin: 10pt 0;
                    padding: 10pt;
                    text-align: center;
                    background-color: #fafafa;
                    border: 0.5pt solid #e0e0e0;
                }
                
                .spinner {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @media (max-width: 1024px) {
                    .editor-container {
                        grid-template-columns: 1fr;
                        height: auto;
                        min-height: 1000px;
                    }
                    .pdf-preview {
                        width: 100%;
                        min-height: auto;
                    }
                }
            `}</style>
        </section>
    );
}
