'use client';

import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import { Download, Trash2, Upload, FileText, Type, Heading, Table2, Layout, FileSignature, PanelBottom, Hash } from 'lucide-react';

let jsPDF: any;
let mermaid: any;
let html2canvas: any;

const emojiCache = new Map<string, { dataUrl: string; width: number; height: number }>();

const PAGE_SIZES: Record<string, { width: number; height: number }> = {
    a4: { width: 210, height: 297 },
    letter: { width: 216, height: 279 },
    legal: { width: 216, height: 356 },
    a3: { width: 297, height: 420 }
};

const FONT_LABELS: Record<string, string> = {
    helvetica: 'Helvetica, Arial, sans-serif',
    times: '"Times New Roman", Times, serif',
    courier: '"Courier New", Courier, monospace'
};

const TABLE_THEMES = {
    light: {
        header: { fill: [240, 240, 240], text: [26, 26, 26], border: [204, 204, 204] },
        rowEven: { fill: [250, 250, 250], text: [44, 44, 44], border: [224, 224, 224] },
        rowOdd: { fill: [255, 255, 255], text: [44, 44, 44], border: [224, 224, 224] }
    },
    striped: {
        header: { fill: [228, 235, 245], text: [26, 26, 26], border: [190, 200, 210] },
        rowEven: { fill: [246, 250, 255], text: [44, 44, 44], border: [220, 230, 240] },
        rowOdd: { fill: [255, 255, 255], text: [44, 44, 44], border: [220, 230, 240] }
    },
    minimal: {
        header: { fill: [255, 255, 255], text: [26, 26, 26], border: [210, 210, 210] },
        rowEven: { fill: [255, 255, 255], text: [44, 44, 44], border: [230, 230, 230] },
        rowOdd: { fill: [255, 255, 255], text: [44, 44, 44], border: [230, 230, 230] }
    }
};


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

type TableTheme = keyof typeof TABLE_THEMES;

export default function Converter() {
    const [markdown, setMarkdown] = useState('');
    const [pageSize, setPageSize] = useState('a4');
    const [orientation, setOrientation] = useState('portrait');
    const [isGenerating, setIsGenerating] = useState(false);
    const [headerEnabled, setHeaderEnabled] = useState(false);
    const [footerEnabled, setFooterEnabled] = useState(true);
    const [headerText, setHeaderText] = useState('');
    const [footerText, setFooterText] = useState('MarkdownPDF');
    const [showPageNumbers, setShowPageNumbers] = useState(false);
    const [fontFamily, setFontFamily] = useState('helvetica');
    const [baseFontSize, setBaseFontSize] = useState(10);
    const [tableTheme, setTableTheme] = useState<TableTheme>('light');
    const [customFilename, setCustomFilename] = useState('');
    const previewRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getPageDimensions = () => {
        const size = PAGE_SIZES[pageSize] || PAGE_SIZES.a4;
        if (orientation === 'landscape') {
            return { width: size.height, height: size.width };
        }
        return size;
    };

    const sanitizeFilename = (value: string) => {
        const cleaned = value
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        return cleaned || 'document';
    };

    const getParsedHtml = async (md: string) => {
        const renderer = new marked.Renderer();

        renderer.heading = ({ text, depth, raw }) => {
            const id = raw.toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            return `<h${depth} id="${id}">${text}</h${depth}>`;
        };

        renderer.link = ({ href, title, text }) => {
            const isInternal = href.startsWith('#');
            return `<a href="${href}" ${title ? `title="${title}"` : ''} class="${isInternal ? 'internal-link' : 'external-link'}">${text}</a>`;
        };

        renderer.code = ({ text, lang }) => {
            if (lang === 'mermaid') {
                const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
                return `<div class="mermaid-diagram" id="${id}">${text}</div>`;
            }
            return `<pre><code class="language-${lang || ''}">${text}</code></pre>`;
        };

        renderer.image = ({ href, title, text }) => {
            return `<img src="${href}" alt="${text}" ${title ? `title="${title}"` : ''} crossorigin="anonymous" />`;
        };

        return marked.parse(md, { renderer, gfm: true, breaks: true }) as string;
    };

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
                diagram.innerHTML = '<pre style="color: red;">Error rendering diagram</pre>';
            }
        }
    };

    useEffect(() => {
        const saved = localStorage.getItem('markdownContent');
        if (saved) {
            setMarkdown(saved);
        } else {
            setMarkdown(`# Welcome to MarkdownPDF

## Features

- Real-time preview while you type
- Fast, client-side conversion
- Mermaid diagrams and tables

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

Ready to start? Edit this text or upload your own file.`);
        }
    }, []);

    useEffect(() => {
        if (markdown) {
            localStorage.setItem('markdownContent', markdown);
            updatePreview();
        }
    }, [markdown, pageSize, orientation, fontFamily, baseFontSize, headerEnabled, headerText, footerEnabled, footerText, showPageNumbers]);

    const updatePreview = async () => {
        if (!previewRef.current) return;
        const html = await getParsedHtml(markdown);
        previewRef.current.innerHTML = html;
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

    const renderMermaidToImage = async (code: string) => {
        if (!mermaid || !html2canvas) return null;
        try {
            const id = `mermaid-pdf-${Math.random().toString(36).slice(2, 9)}`;
            const { svg } = await mermaid.render(id, code);
            if (!svg) return null;

            const container = document.createElement('div');
            container.style.cssText = 'position:fixed;left:-9999px;top:0;background:#ffffff;padding:20px;z-index:-1;';
            container.innerHTML = svg;
            document.body.appendChild(container);

            const svgEl = container.querySelector('svg');
            if (svgEl) {
                svgEl.style.background = '#ffffff';
                const minW = 600;
                const currentW = svgEl.getBoundingClientRect().width;
                if (currentW < minW) {
                    svgEl.style.width = `${minW}px`;
                    svgEl.style.height = 'auto';
                }
            }

            await new Promise(r => setTimeout(r, 150));

            const canvas = await html2canvas(container, {
                backgroundColor: '#ffffff',
                scale: 3,
                useCORS: true,
                logging: false,
                removeContainer: false,
            });

            document.body.removeChild(container);

            const dataUrl = canvas.toDataURL('image/png');
            const width = canvas.width;
            const height = canvas.height;
            return { dataUrl, width, height, format: 'PNG' };
        } catch (error) {
            console.error('Mermaid rendering error:', error);
            return null;
        }
    };

    const loadImageToDataUrl = async (url: string) => {
        try {
            let imageSource = url;
            if (!url.startsWith('data:')) {
                const response = await fetch(url, { mode: 'cors' });
                if (!response.ok) {
                    throw new Error('Image fetch error');
                }
                const blob = await response.blob();
                imageSource = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = () => reject(new Error('Image read error'));
                    reader.readAsDataURL(blob);
                });
            }

            const img = new Image();
            img.src = imageSource;
            await new Promise((resolve, reject) => {
                img.onload = () => resolve(true);
                img.onerror = () => reject(new Error('Image load error'));
            });
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            return { dataUrl, width: img.width, height: img.height, format: 'PNG' };
        } catch (error) {
            console.error('Image load error:', error);
            return null;
        }
    };

    const emojiRegex = /\p{Extended_Pictographic}/gu;

    const splitTextWithEmoji = (text: string) => {
        const parts: Array<{ type: 'text' | 'emoji'; value: string }> = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;
        emojiRegex.lastIndex = 0;
        while ((match = emojiRegex.exec(text)) !== null) {
            const idx = match.index;
            if (idx > lastIndex) {
                parts.push({ type: 'text', value: text.slice(lastIndex, idx) });
            }
            parts.push({ type: 'emoji', value: match[0] });
            lastIndex = idx + match[0].length;
        }
        if (lastIndex < text.length) {
            parts.push({ type: 'text', value: text.slice(lastIndex) });
        }
        return parts;
    };

    const emojiToCodepoints = (emoji: string) => {
        const codepoints: string[] = [];
        for (const char of emoji) {
            const cp = char.codePointAt(0);
            if (cp) {
                codepoints.push(cp.toString(16));
            }
        }
        return codepoints.join('-');
    };

    const loadEmojiImage = async (emoji: string) => {
        if (emojiCache.has(emoji)) {
            return emojiCache.get(emoji) || null;
        }
        try {
            const codepoints = emojiToCodepoints(emoji);
            if (!codepoints) return null;
            const url = `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/${codepoints}.png`;
            const response = await fetch(url);
            if (!response.ok) return null;
            const blob = await response.blob();
            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(new Error('Failed to read emoji'));
                reader.readAsDataURL(blob);
            });
            const entry = { dataUrl, width: 72, height: 72 };
            emojiCache.set(emoji, entry);
            return entry;
        } catch (error) {
            console.error('Emoji load error:', error);
            return null;
        }
    };

    const downloadPDF = async () => {
        if (!markdown.trim() || !jsPDF) {
            alert('PDF libraries are still loading. Please try again in a moment.');
            return;
        }

        setIsGenerating(true);
        try {
            const tokens = marked.lexer(markdown, { gfm: true, breaks: true });
            const firstHeading = tokens.find((token: any) => token.type === 'heading') as any;
            const defaultName = firstHeading?.text ? sanitizeFilename(firstHeading.text) : 'document';
            const filename = customFilename.trim() ? sanitizeFilename(customFilename) : defaultName;

            const pdf = new jsPDF({
                orientation: orientation as any,
                unit: 'mm',
                format: pageSize,
                compress: true,
                putOnlyUsedFonts: true
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = { top: 20, right: 20, bottom: 25, left: 20 };
            const contentWidth = pageWidth - margin.left - margin.right;
            let currentY = margin.top;
            let pageNumber = 1;
            const baseLineHeight = baseFontSize * 0.5;
            const shouldRenderHeader = headerEnabled;
            const shouldRenderFooter = footerEnabled || showPageNumbers;

            const headerTextValue = headerText.trim() || (firstHeading?.text ? firstHeading.text.substring(0, 60) : 'Document');

            const addHeader = () => {
                if (!shouldRenderHeader) return;
                const headerY = 12;
                pdf.setFontSize(8.5);
                pdf.setTextColor(120, 120, 120);
                pdf.setFont(fontFamily as any, 'normal');
                pdf.text(headerTextValue, margin.left, headerY);
                pdf.setDrawColor(200, 200, 200);
                pdf.setLineWidth(0.3);
                pdf.line(margin.left, headerY + 3, pageWidth - margin.right, headerY + 3);
            };

            const addFooter = () => {
                if (!shouldRenderFooter) return;
                pdf.setFontSize(8);
                pdf.setTextColor(150, 150, 150);
                pdf.setFont(fontFamily as any, 'normal');

                const footerY = pageHeight - 10;
                const pageText = `Page ${pageNumber}`;
                pdf.setDrawColor(200, 200, 200);
                pdf.setLineWidth(0.3);
                pdf.line(margin.left, footerY - 4, pageWidth - margin.right, footerY - 4);

                if (footerEnabled && footerText && showPageNumbers) {
                    pdf.text(footerText, margin.left, footerY);
                    const pageTextWidth = pdf.getTextWidth(pageText);
                    pdf.text(pageText, pageWidth - margin.right - pageTextWidth, footerY);
                    return;
                }

                const singleText = footerEnabled && footerText ? footerText : pageText;
                const textWidth = pdf.getTextWidth(singleText);
                pdf.text(singleText, (pageWidth - textWidth) / 2, footerY);
            };

            const checkPageBreak = (requiredHeight: number) => {
                if (currentY + requiredHeight > pageHeight - margin.bottom) {
                    addFooter();
                    pdf.addPage();
                    pageNumber++;
                    currentY = margin.top;
                    addHeader();
                    if (shouldRenderHeader) {
                        currentY = margin.top + 10;
                    }
                    return true;
                }
                return false;
            };

            const ensureLineSpace = (height: number) => {
                if (checkPageBreak(height)) {
                    return;
                }
            };

            const drawWrappedText = async (
                text: string,
                options: { font: string; style: string; size: number; color: number[] },
                xStart = margin.left,
                maxWidth = contentWidth
            ) => {
                if (!text) return;
                const lineHeight = options.size * 0.5;
                let currentX = xStart;

                const renderEmoji = async (emoji: string) => {
                    const emojiImage = await loadEmojiImage(emoji);
                    const emojiSize = Math.max(3.5, options.size * 0.45);
                    if (currentX + emojiSize > xStart + maxWidth) {
                        ensureLineSpace(lineHeight);
                        currentY += lineHeight;
                        currentX = xStart;
                    }
                    if (emojiImage) {
                        pdf.addImage(emojiImage.dataUrl, 'PNG', currentX, currentY - emojiSize * 0.75, emojiSize, emojiSize);
                        currentX += emojiSize;
                    }
                };

                const segments = splitTextWithEmoji(text);
                for (const segment of segments) {
                    if (segment.type === 'emoji') {
                        await renderEmoji(segment.value);
                        continue;
                    }

                    pdf.setFont(options.font as any, options.style as any);
                    pdf.setFontSize(options.size);
                    pdf.setTextColor(options.color[0], options.color[1], options.color[2]);
                    const parts = segment.value.split(/(\s+)/);
                    parts.forEach((part) => {
                        if (!part) return;
                        const partWidth = pdf.getTextWidth(part);
                        if (currentX + partWidth > xStart + maxWidth) {
                            ensureLineSpace(lineHeight);
                            currentY += lineHeight;
                            currentX = xStart;
                        }
                        pdf.text(part, currentX, currentY);
                        currentX += partWidth;
                    });
                }
                currentY += lineHeight;
            };

            const flattenInlineTokens = (tokens: any[]): any[] => {
                const result: any[] = [];
                for (const token of tokens) {
                    if ((token.type === 'text' || token.type === 'paragraph') && token.tokens && token.tokens.length > 0) {
                        result.push(...flattenInlineTokens(token.tokens));
                    } else if (token.type === 'strong' && token.tokens && token.tokens.length > 0) {
                        for (const inner of token.tokens) {
                            result.push({ ...inner, type: 'strong', text: inner.text || inner.raw || '' });
                        }
                    } else if (token.type === 'em' && token.tokens && token.tokens.length > 0) {
                        for (const inner of token.tokens) {
                            result.push({ ...inner, type: 'em', text: inner.text || inner.raw || '' });
                        }
                    } else {
                        result.push(token);
                    }
                }
                return result;
            };

            const renderInlineTokens = async (inlineTokens: any[], xStart = margin.left, maxWidth = contentWidth) => {
                let currentX = xStart;
                const lineHeight = baseLineHeight;
                const emit = async (text: string, style: { font: string; style: string; size: number; color: number[] }) => {
                    if (!text) return;
                    const segments = splitTextWithEmoji(text);
                    for (const segment of segments) {
                        if (segment.type === 'emoji') {
                            const emojiImage = await loadEmojiImage(segment.value);
                            const emojiSize = Math.max(3.5, baseFontSize * 0.45);
                            if (currentX + emojiSize > xStart + maxWidth) {
                                ensureLineSpace(lineHeight);
                                currentY += lineHeight;
                                currentX = xStart;
                            }
                            if (emojiImage) {
                                pdf.addImage(emojiImage.dataUrl, 'PNG', currentX, currentY - emojiSize * 0.75, emojiSize, emojiSize);
                                currentX += emojiSize;
                            }
                            continue;
                        }

                        pdf.setFont(style.font as any, style.style as any);
                        pdf.setFontSize(style.size);
                        pdf.setTextColor(style.color[0], style.color[1], style.color[2]);
                        const parts = segment.value.split(/(\s+)/);
                        parts.forEach((part) => {
                            if (!part) return;
                            const partWidth = pdf.getTextWidth(part);
                            if (currentX + partWidth > xStart + maxWidth) {
                                ensureLineSpace(lineHeight);
                                currentY += lineHeight;
                                currentX = xStart;
                            }
                            pdf.text(part, currentX, currentY);
                            currentX += partWidth;
                        });
                    }
                };

                const flat = flattenInlineTokens(inlineTokens);
                for (const token of flat) {
                    const text = token.text || token.raw || '';
                    switch (token.type) {
                        case 'strong':
                            await emit(text, { font: fontFamily, style: 'bold', size: baseFontSize, color: [26, 26, 26] });
                            break;
                        case 'em':
                            await emit(text, { font: fontFamily, style: 'italic', size: baseFontSize, color: [44, 44, 44] });
                            break;
                        case 'codespan':
                            await emit(text, { font: 'courier', style: 'normal', size: baseFontSize - 1, color: [199, 37, 78] });
                            break;
                        case 'link':
                            await emit(text, { font: fontFamily, style: 'normal', size: baseFontSize, color: [0, 102, 204] });
                            break;
                        case 'text':
                        default:
                            await emit(text, { font: fontFamily, style: 'normal', size: baseFontSize, color: [44, 44, 44] });
                            break;
                    }
                }
                currentY += baseLineHeight * 0.6;
            };

            const renderParagraph = async (token: any) => {
                ensureLineSpace(baseLineHeight);
                const inlineTokens = token.tokens || [];
                if (inlineTokens.length) {
                    await renderInlineTokens(inlineTokens);
                } else {
                    await drawWrappedText(token.text || '', { font: fontFamily, style: 'normal', size: baseFontSize, color: [44, 44, 44] });
                    currentY += baseLineHeight * 0.6;
                }
            };

            const renderHeading = async (token: any) => {
                const level = token.depth || 1;
                const sizeMap = [baseFontSize + 8, baseFontSize + 4, baseFontSize + 2, baseFontSize + 1, baseFontSize, baseFontSize - 1];
                const fontSize = Math.max(9, sizeMap[level - 1] || baseFontSize);
                const spacing = fontSize * 0.6;
                checkPageBreak(fontSize + spacing);
                await drawWrappedText(token.text || '', { font: fontFamily, style: 'bold', size: fontSize, color: [26, 26, 26] });
                if (level <= 2) {
                    pdf.setDrawColor(204, 204, 204);
                    pdf.setLineWidth(0.2);
                    pdf.line(margin.left, currentY + 1, pageWidth - margin.right, currentY + 1);
                }
                currentY += spacing;
            };

            const renderCodeBlock = (token: any) => {
                const code = token.text || '';
                const lines = code.split('\n');
                const lineHeight = (baseFontSize - 1) * 0.55;
                const blockHeight = lines.length * lineHeight + 8;
                checkPageBreak(blockHeight);
                pdf.setFillColor(245, 245, 245);
                pdf.rect(margin.left, currentY - 2, contentWidth, blockHeight, 'F');
                pdf.setDrawColor(102, 102, 102);
                pdf.setLineWidth(1);
                pdf.line(margin.left, currentY - 2, margin.left, currentY + blockHeight - 2);
                pdf.setFont('courier', 'normal');
                pdf.setFontSize(baseFontSize - 1);
                pdf.setTextColor(26, 26, 26);
                lines.forEach((line, idx) => {
                    pdf.text(line, margin.left + 5, currentY + (idx * lineHeight) + 3);
                });
                currentY += blockHeight + 5;
            };

            const renderMermaidBlock = async (token: any) => {
                const result = await renderMermaidToImage(token.text || '');
                if (!result) return;

                const renderScale = 3;
                const pxToMm = 0.264583;
                const actualWidthMm = (result.width / renderScale) * pxToMm;
                const actualHeightMm = (result.height / renderScale) * pxToMm;
                const aspectRatio = actualHeightMm / actualWidthMm;

                const maxDiagramWidth = contentWidth * 0.75;
                let renderWidth = Math.min(maxDiagramWidth, actualWidthMm);
                let renderHeight = renderWidth * aspectRatio;

                const availableHeight = pageHeight - margin.bottom - currentY - 6;
                if (renderHeight > availableHeight) {
                    if (renderHeight > availableHeight * 1.5) {
                        checkPageBreak(renderHeight + 6);
                    } else {
                        renderHeight = availableHeight;
                        renderWidth = renderHeight / aspectRatio;
                    }
                }

                const xOffset = margin.left + (contentWidth - renderWidth) / 2;
                pdf.addImage(result.dataUrl, 'PNG', xOffset, currentY, renderWidth, renderHeight);
                currentY += renderHeight + 4;
            };

            const renderList = async (token: any) => {
                const isOrdered = token.ordered;
                const items = token.items || [];
                const indent = 6;
                for (let index = 0; index < items.length; index += 1) {
                    const item = items[index];
                    checkPageBreak(baseLineHeight * 2);
                    const bullet = isOrdered ? `${index + 1}.` : '\u2022';
                    pdf.setFont(fontFamily as any, 'normal');
                    pdf.setFontSize(baseFontSize);
                    pdf.setTextColor(44, 44, 44);
                    pdf.text(bullet, margin.left, currentY);
                    const itemTokens = item.tokens || [];
                    if (itemTokens.length) {
                        await renderInlineTokens(itemTokens, margin.left + indent, contentWidth - indent);
                    } else {
                        const itemText = item.text || '';
                        await drawWrappedText(
                            itemText,
                            { font: fontFamily, style: 'normal', size: baseFontSize, color: [44, 44, 44] },
                            margin.left + indent,
                            contentWidth - indent
                        );
                    }
                    currentY += baseLineHeight * 0.3;
                }
            };

            const renderBlockquote = (token: any) => {
                const text = token.text || '';
                const quoteHeight = baseLineHeight * 2;
                checkPageBreak(quoteHeight + 4);
                pdf.setFillColor(249, 249, 249);
                pdf.rect(margin.left, currentY - 2, contentWidth, quoteHeight, 'F');
                pdf.setDrawColor(102, 102, 102);
                pdf.setLineWidth(1);
                pdf.line(margin.left, currentY - 2, margin.left, currentY + quoteHeight - 2);
                pdf.setFont(fontFamily as any, 'italic');
                pdf.setFontSize(baseFontSize);
                pdf.setTextColor(44, 44, 44);
                const lines = pdf.splitTextToSize(text, contentWidth - 8);
                lines.forEach((line: string, idx: number) => {
                    pdf.text(line, margin.left + 5, currentY + (idx * baseLineHeight));
                });
                currentY += lines.length * baseLineHeight + 4;
            };

            const renderTable = (token: any) => {
                const theme = TABLE_THEMES[tableTheme];
                const headers = token.header || [];
                const rows = token.rows || [];
                if (!headers.length) return;
                const colCount = headers.length;
                const colWidth = contentWidth / colCount;
                const rowPadding = 2;
                const fontSize = Math.max(8, baseFontSize - 1);
                const lineHeight = fontSize * 0.55;

                const measureRowHeight = (row: string[]) => {
                    const heights = row.map(cell => {
                        const lines = pdf.splitTextToSize(cell || '', colWidth - 4);
                        return lines.length * lineHeight + rowPadding * 2;
                    });
                    return Math.max(...heights);
                };

                const drawRow = (row: string[], y: number, style: { fill: number[]; text: number[]; border: number[] }, bold = false) => {
                    pdf.setFillColor(style.fill[0], style.fill[1], style.fill[2]);
                    pdf.setDrawColor(style.border[0], style.border[1], style.border[2]);
                    pdf.setFont(fontFamily as any, bold ? 'bold' : 'normal');
                    pdf.setFontSize(fontSize);
                    pdf.setTextColor(style.text[0], style.text[1], style.text[2]);

                    row.forEach((cell, colIndex) => {
                        const x = margin.left + colIndex * colWidth;
                        const lines = pdf.splitTextToSize(cell || '', colWidth - 4);
                        const rowHeight = measureRowHeight(row);
                        pdf.rect(x, y, colWidth, rowHeight, 'FD');
                        lines.forEach((line: string, lineIdx: number) => {
                            pdf.text(line, x + 2, y + rowPadding + (lineIdx + 1) * lineHeight);
                        });
                    });
                    return measureRowHeight(row);
                };

                const headerHeight = measureRowHeight(headers);
                checkPageBreak(headerHeight + 4);
                let rowY = currentY;
                const headerRowHeight = drawRow(headers, rowY, theme.header, true);
                rowY += headerRowHeight;

                rows.forEach((row: string[], idx: number) => {
                    const rowHeight = measureRowHeight(row);
                    checkPageBreak(rowHeight + 2);
                    const style = idx % 2 === 0 ? theme.rowOdd : theme.rowEven;
                    drawRow(row, rowY, style, false);
                    rowY += rowHeight;
                    currentY = rowY;
                });

                currentY += baseLineHeight;
            };

            addHeader();
            if (shouldRenderHeader) {
                currentY = margin.top + 10;
            }

            for (const token of tokens) {
                if (token.type === 'space') {
                    currentY += baseLineHeight;
                    continue;
                }
                if (token.type === 'heading') {
                    await renderHeading(token);
                    continue;
                }
                if (token.type === 'paragraph') {
                    await renderParagraph(token);
                    continue;
                }
                if (token.type === 'list') {
                    await renderList(token);
                    continue;
                }
                if (token.type === 'code') {
                    if (token.lang === 'mermaid') {
                        await renderMermaidBlock(token);
                    } else {
                        renderCodeBlock(token);
                    }
                    continue;
                }
                if (token.type === 'blockquote') {
                    renderBlockquote(token);
                    continue;
                }
                if (token.type === 'hr') {
                    addFooter();
                    pdf.addPage();
                    pageNumber++;
                    currentY = margin.top;
                    addHeader();
                    if (shouldRenderHeader) {
                        currentY = margin.top + 10;
                    }
                    continue;
                }
                if (token.type === 'table') {
                    renderTable(token);
                    continue;
                }
                if (token.type === 'image') {
                    const result = await loadImageToDataUrl(token.href || '');
                    if (result) {
                        const maxWidth = contentWidth * 0.9;
                        const computeSize = (availableHeight: number) => {
                            const scale = Math.min(maxWidth / result.width, availableHeight / result.height, 1);
                            return {
                                renderWidth: result.width * scale,
                                renderHeight: result.height * scale
                            };
                        };

                        let availableHeight = pageHeight - margin.bottom - currentY - 8;
                        let { renderWidth, renderHeight } = computeSize(availableHeight);

                        if (currentY + renderHeight > pageHeight - margin.bottom) {
                            checkPageBreak(renderHeight + 8);
                            availableHeight = pageHeight - margin.bottom - currentY - 8;
                            ({ renderWidth, renderHeight } = computeSize(availableHeight));
                        }

                        const xOffset = margin.left + (contentWidth - renderWidth) / 2;
                        const format = result.format || 'PNG';
                        pdf.addImage(result.dataUrl, format, xOffset, currentY + 2, renderWidth, renderHeight);
                        currentY += renderHeight + 8;
                    }
                }
            }

            addFooter();
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

    const { width: previewWidth, height: previewHeight } = getPageDimensions();
    const footerPreviewText = footerEnabled && footerText ? footerText : '';
    const footerRight = showPageNumbers ? 'Page 1' : '';
    const footerDisplay = footerPreviewText && footerRight ? 'split' : 'center';
    const previewFont = FONT_LABELS[fontFamily] || FONT_LABELS.helvetica;
    const previewHeaderText = headerEnabled
        ? (headerText.trim() || markdown.match(/^#\s+(.+)$/m)?.[1] || 'Document')
        : '';

    return (
        <section className="main-section">
            <div className="container">
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
                        <label htmlFor="filename">
                            <FileSignature size={14} />
                            Filename:
                        </label>
                        <input
                            id="filename"
                            type="text"
                            className="text-input"
                            placeholder="Use default title"
                            value={customFilename}
                            onChange={(e) => setCustomFilename(e.target.value)}
                        />
                    </div>

                    <div className="control-group">
                        <label htmlFor="pageSize">
                            <Layout size={14} />
                            Page Size:
                        </label>
                        <select
                            id="pageSize"
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
                        <label htmlFor="orientation">
                            <Layout size={14} />
                            Orientation:
                        </label>
                        <select
                            id="orientation"
                            value={orientation}
                            onChange={(e) => setOrientation(e.target.value)}
                            className="select-input"
                        >
                            <option value="portrait">Portrait</option>
                            <option value="landscape">Landscape</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label htmlFor="fontFamily">
                            <Type size={14} />
                            Font:
                        </label>
                        <select
                            id="fontFamily"
                            value={fontFamily}
                            onChange={(e) => setFontFamily(e.target.value)}
                            className="select-input"
                        >
                            <option value="helvetica">Helvetica</option>
                            <option value="times">Times</option>
                            <option value="courier">Courier</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label htmlFor="baseFontSize">
                            <Type size={14} />
                            Base Size:
                        </label>
                        <select
                            id="baseFontSize"
                            value={baseFontSize}
                            onChange={(e) => setBaseFontSize(Number(e.target.value))}
                            className="select-input"
                        >
                            <option value={9}>9 pt</option>
                            <option value={10}>10 pt</option>
                            <option value={11}>11 pt</option>
                            <option value={12}>12 pt</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label htmlFor="tableTheme">
                            <Table2 size={14} />
                            Table Theme:
                        </label>
                        <select
                            id="tableTheme"
                            value={tableTheme}
                            onChange={(e) => setTableTheme(e.target.value as TableTheme)}
                            className="select-input"
                        >
                            <option value="light">Light</option>
                            <option value="striped">Striped</option>
                            <option value="minimal">Minimal</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label htmlFor="headerEnabled">
                            <Heading size={14} />
                            Header:
                        </label>
                        <input
                            id="headerEnabled"
                            type="checkbox"
                            checked={headerEnabled}
                            onChange={(e) => setHeaderEnabled(e.target.checked)}
                        />
                        <input
                            type="text"
                            className="text-input"
                            value={headerText}
                            onChange={(e) => setHeaderText(e.target.value)}
                            placeholder="Header text"
                        />
                    </div>

                    <div className="control-group">
                        <label htmlFor="footerEnabled">
                            <PanelBottom size={14} />
                            Footer:
                        </label>
                        <input
                            id="footerEnabled"
                            type="checkbox"
                            checked={footerEnabled}
                            onChange={(e) => setFooterEnabled(e.target.checked)}
                        />
                        <input
                            type="text"
                            className="text-input"
                            value={footerText}
                            onChange={(e) => setFooterText(e.target.value)}
                            placeholder="Footer text"
                        />
                    </div>

                    <div className="control-group">
                        <label htmlFor="showPageNumbers">
                            <Hash size={14} />
                            Page #:
                        </label>
                        <input
                            id="showPageNumbers"
                            type="checkbox"
                            checked={showPageNumbers}
                            onChange={(e) => setShowPageNumbers(e.target.checked)}
                        />
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
                                className="preview-page"
                                style={{
                                    width: `${previewWidth}mm`,
                                    height: `${previewHeight}mm`,
                                    fontFamily: previewFont,
                                    fontSize: `${baseFontSize}pt`,
                                    ['--preview-base-size' as any]: `${baseFontSize}pt`
                                }}
                            >
                                {headerEnabled && (
                                    <div className="preview-header">
                                        {previewHeaderText}
                                    </div>
                                )}
                                <div
                                    ref={previewRef}
                                    className="preview-content pdf-preview"
                                    style={{
                                        paddingTop: headerEnabled ? '30mm' : '20mm',
                                        paddingRight: '20mm',
                                        paddingBottom: '25mm',
                                        paddingLeft: '20mm'
                                    }}
                                />
                                {(footerEnabled || showPageNumbers) && (
                                    <div className={`preview-footer ${footerDisplay}`}>
                                        <span>{footerPreviewText}</span>
                                        {footerDisplay === 'split' && <span>{footerRight}</span>}
                                        {footerDisplay === 'center' && !footerPreviewText && <span>{footerRight}</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
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
                    flex-wrap: wrap;
                }
                .control-group label {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    font-weight: 600;
                }
                .control-group input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    accent-color: var(--primary-color);
                }
                .select-input,
                .text-input {
                    padding: 0.5rem 1rem;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-sm);
                    color: var(--text-primary);
                    font-family: var(--font-primary);
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: border-color var(--transition-fast), background var(--transition-fast);
                }
                .select-input:focus,
                .text-input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    background: rgba(255, 255, 255, 0.06);
                }
                .text-input {
                    min-width: 160px;
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
                .preview-wrapper {
                    flex: 1;
                    overflow-y: auto;
                    background: #525252;
                    padding: 20px;
                }
                .preview-page {
                    margin: 0 auto;
                    background: white;
                    box-shadow: 0 0 10px rgba(0,0,0,0.3);
                    position: relative;
                    box-sizing: border-box;
                    max-width: 100%;
                }
                .preview-header,
                .preview-footer {
                    position: absolute;
                    left: 20mm;
                    right: 20mm;
                    color: #999;
                    font-size: 8pt;
                }
                .preview-header {
                    top: 10mm;
                }
                .preview-footer {
                    bottom: 10mm;
                    display: flex;
                    justify-content: center;
                }
                .preview-footer.split {
                    justify-content: space-between;
                }
                .pdf-preview {
                    padding: 0;
                    background: white;
                    font-size: var(--preview-base-size, 10pt);
                    line-height: 1.5;
                    color: #2c2c2c;
                    box-sizing: border-box;
                    min-height: 100%;
                }
                .pdf-preview h1 {
                    font-size: calc(var(--preview-base-size, 10pt) + 8pt);
                    font-weight: 700;
                    color: #1a1a1a;
                    margin: 0 0 6pt 0;
                    padding-bottom: 2pt;
                    border-bottom: 0.5pt solid #cccccc;
                    line-height: 1.3;
                }
                .pdf-preview h2 {
                    font-size: calc(var(--preview-base-size, 10pt) + 4pt);
                    font-weight: 600;
                    color: #1a1a1a;
                    margin: 10pt 0 5pt 0;
                    padding-bottom: 2pt;
                    border-bottom: 0.5pt solid #e0e0e0;
                    line-height: 1.3;
                }
                .pdf-preview h3 {
                    font-size: calc(var(--preview-base-size, 10pt) + 2pt);
                    font-weight: 600;
                    color: #2c2c2c;
                    margin: 8pt 0 4pt 0;
                    line-height: 1.3;
                }
                .pdf-preview h4 {
                    font-size: calc(var(--preview-base-size, 10pt) + 1pt);
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
                    .preview-page {
                        width: 100% !important;
                        height: auto !important;
                    }
                    .preview-header,
                    .preview-footer {
                        position: relative;
                        left: 0;
                        right: 0;
                        padding: 0 1.5rem;
                    }
                    .preview-header {
                        padding-top: 1rem;
                    }
                    .preview-footer {
                        padding-bottom: 1rem;
                    }
                }
            `}</style>
        </section>
    );
}
