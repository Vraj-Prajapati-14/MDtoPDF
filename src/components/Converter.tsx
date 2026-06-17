'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { marked } from 'marked';
import { useToast } from '@/context/ToastContext';
import {
    Download, Trash2, Upload, FileText, Type, Heading, Table2, Layout,
    FileSignature, PanelBottom, Hash, Bold, Italic, Strikethrough,
    Heading1, Heading2, Heading3, Link2, Image as ImageIcon, Code, Code2,
    Quote, List, ListOrdered, Minus, ClipboardCopy, Check, AlignLeft,
    ZoomIn, ZoomOut, Search, Replace, LayoutTemplate, X, ChevronDown
} from 'lucide-react';

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

// Codepoint-to-replacement map for non-Latin-1 chars jsPDF cannot render.
// All values are ASCII; built from numeric codepoints to avoid encoding issues.
const _PDF_CHAR_MAP: Record<number, string> = (() => {
    const m: Record<number, string> = {};
    // Box-drawing horizontal lines (U+2500-U+257A range) -> '-'
    for (const cp of [0x2500,0x2501,0x2504,0x2505,0x2508,0x2509,0x254C,0x254D,0x2574,0x2576,0x2578,0x257A]) m[cp] = '-';
    // Double horizontal (U+2550) -> '='
    m[0x2550] = '=';
    // Box-drawing vertical lines (U+2502-U+257B range) -> '|'
    for (const cp of [0x2502,0x2503,0x2506,0x2507,0x250A,0x250B,0x254E,0x254F,0x2551,0x2575,0x2577,0x2579,0x257B]) m[cp] = '|';
    // Remaining box-drawing block (U+2500-U+257F): corners and junctions -> '+'
    for (let cp = 0x2500; cp <= 0x257F; cp++) if (!m[cp]) m[cp] = '+';
    // Arrows: rupee, right-arrow, left-arrow, up-arrow, down-arrow
    m[0x20B9] = 'Rs.'; m[0x2192] = '->'; m[0x2190] = '<-'; m[0x2191] = '^'; m[0x2193] = 'v';
    // Checkmarks and crosses
    m[0x2713] = '[/]'; m[0x2714] = '[/]'; m[0x2611] = '[/]';
    m[0x2717] = '[x]'; m[0x2718] = '[x]';
    // Typographic single/double quotes -> straight ASCII
    m[0x2018] = "'"; m[0x2019] = "'"; m[0x201C] = '"'; m[0x201D] = '"';
    // En dash, em dash, ellipsis
    m[0x2013] = '-'; m[0x2014] = '--'; m[0x2026] = '...';
    return m;
})();

const sanitizeForPdf = (text: string): string =>
    [...text].map(ch => {
        const cp = ch.codePointAt(0) as number;
        return cp <= 0xFF ? ch : (_PDF_CHAR_MAP[cp] ?? '');
    }).join('');

// Matches box-drawing (U+2500-U+257F) or arrows (U+2190-U+21FF) at runtime
const _DIAGRAM_RE = (function() {
    const s = String.fromCharCode;
    return new RegExp("[" + s(0x2500) + "-" + s(0x257F) + s(0x2190) + "-" + s(0x21FF) + "]");
})();
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
    const toast = useToast();
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
    const [isCopied, setIsCopied] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showFindReplace, setShowFindReplace] = useState(false);
    const [findText, setFindText] = useState('');
    const [replaceText, setReplaceText] = useState('');
    const [showTemplates, setShowTemplates] = useState(false);
    const [previewZoom, setPreviewZoom] = useState(75);
    const previewRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const findInputRef = useRef<HTMLInputElement>(null);

    const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
    const charCount = markdown.length;
    const lineCount = markdown.split('\n').length;

    const findMatchCount = findText
        ? (markdown.match(new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length
        : 0;

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

        const cleanMd = md.replace(/^\s+/, '');
        return marked.parse(cleanMd, { renderer, gfm: true, breaks: true }) as string;
    };

    const renderMermaidDiagrams = async () => {
        if (!mermaid || !previewRef.current) return;

        const diagrams = previewRef.current.querySelectorAll('.mermaid-diagram');
        for (let i = 0; i < diagrams.length; i++) {
            const diagram = diagrams[i] as HTMLElement;
            if (diagram.classList.contains('mermaid-rendered')) continue;
            const code = diagram.textContent || '';
            const id = diagram.id;

            try {
                const { svg } = await mermaid.render(`mermaid-svg-${id}`, code);

                // Helper: SVG element -> PNG data URL
                const svgToPng = (svgEl: SVGElement, scale = 3): Promise<string> =>
                    new Promise((resolve, reject) => {
                        const bbox = svgEl.getBoundingClientRect();
                        const w = Math.max(bbox.width, 200);
                        const h = Math.max(bbox.height, 100);
                        const canvas = document.createElement('canvas');
                        canvas.width = w * scale;
                        canvas.height = h * scale;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return reject('no ctx');
                        ctx.scale(scale, scale);
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, w, h);
                        const blob = new Blob([new XMLSerializer().serializeToString(svgEl)], { type: 'image/svg+xml;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const img = new Image();
                        img.onload = () => { ctx.drawImage(img, 0, 0); URL.revokeObjectURL(url); resolve(canvas.toDataURL('image/png')); };
                        img.onerror = () => { URL.revokeObjectURL(url); reject('img load error'); };
                        img.src = url;
                    });

                // Build wrapper
                const wrapper = document.createElement('div');
                wrapper.className = 'mermaid-wrapper';

                const svgContainer = document.createElement('div');
                svgContainer.className = 'mermaid-svg-container';
                svgContainer.innerHTML = svg;

                // Action bar
                const actions = document.createElement('div');
                actions.className = 'mermaid-actions';

                // Save as PNG
                const saveBtn = document.createElement('button');
                saveBtn.className = 'mermaid-action-btn';
                saveBtn.textContent = '⬇ Save PNG';
                saveBtn.title = 'Download diagram as PNG';
                saveBtn.onclick = async () => {
                    try {
                        const svgEl = svgContainer.querySelector('svg') as SVGElement | null;
                        if (!svgEl) return;
                        const dataUrl = await svgToPng(svgEl, 3);
                        const a = document.createElement('a');
                        a.download = `mermaid-diagram-${i + 1}.png`;
                        a.href = dataUrl;
                        a.click();
                    } catch (e) { console.error('Save PNG error:', e); }
                };

                // Copy image
                const copyBtn = document.createElement('button');
                copyBtn.className = 'mermaid-action-btn';
                copyBtn.textContent = '⧉ Copy';
                copyBtn.title = 'Copy diagram to clipboard as PNG';
                copyBtn.onclick = async () => {
                    try {
                        const svgEl = svgContainer.querySelector('svg') as SVGElement | null;
                        if (!svgEl) return;
                        const dataUrl = await svgToPng(svgEl, 2);
                        const res = await fetch(dataUrl);
                        const blob = await res.blob();
                        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                        copyBtn.textContent = '✓ Copied!';
                        setTimeout(() => { copyBtn.textContent = '⧉ Copy'; }, 2000);
                    } catch (e) {
                        copyBtn.textContent = '✗ Failed';
                        setTimeout(() => { copyBtn.textContent = '⧉ Copy'; }, 2000);
                    }
                };

                actions.appendChild(saveBtn);
                actions.appendChild(copyBtn);
                wrapper.appendChild(svgContainer);
                wrapper.appendChild(actions);

                diagram.innerHTML = '';
                diagram.appendChild(wrapper);
                diagram.classList.add('mermaid-rendered');
            } catch (error) {
                console.error('Mermaid rendering error:', error);
                diagram.innerHTML = '<pre style="color:#e53e3e;padding:10px;background:#fff5f5;border-left:3px solid #e53e3e;border-radius:4px;">⚠ Error rendering diagram — check your Mermaid syntax.</pre>';
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
            setLastSaved(new Date());
            updatePreview();
        }
    }, [markdown, pageSize, orientation, fontFamily, baseFontSize, headerEnabled, headerText, footerEnabled, footerText, showPageNumbers]);

    const insertFormat = useCallback((before: string, after = '', placeholder = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = markdown.slice(start, end);
        const insertText = selectedText || placeholder;
        const newText = markdown.slice(0, start) + before + insertText + after + markdown.slice(end);
        setMarkdown(newText);
        // Restore cursor after state update
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + before.length + insertText.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    }, [markdown]);

    const insertAtLineStart = useCallback((prefix: string, placeholder = 'Text here') => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const lineStart = markdown.lastIndexOf('\n', start - 1) + 1;
        const existingLine = markdown.slice(lineStart, start);
        const hasPrefix = existingLine.startsWith(prefix);
        let newText: string;
        let newCursor: number;
        if (hasPrefix) {
            // Toggle off
            newText = markdown.slice(0, lineStart) + existingLine.slice(prefix.length) + markdown.slice(start);
            newCursor = start - prefix.length;
        } else {
            newText = markdown.slice(0, lineStart) + prefix + (existingLine || placeholder) + markdown.slice(start);
            newCursor = start + prefix.length;
        }
        setMarkdown(newText);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newCursor, newCursor);
        }, 0);
    }, [markdown]);

    const copyToClipboard = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(markdown);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
            toast.success('Copied!', 'Markdown content copied to clipboard');
        } catch {
            // fallback
            const ta = document.createElement('textarea');
            ta.value = markdown;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
            toast.success('Copied!', 'Markdown content copied to clipboard');
        }
    }, [markdown, toast]);

    const insertTable = useCallback(() => {
        const table = `\n| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Cell 1 | Cell 2 | Cell 3 |\n| Cell 4 | Cell 5 | Cell 6 |\n`;
        const textarea = textareaRef.current;
        if (!textarea) return;
        const pos = textarea.selectionStart;
        const newText = markdown.slice(0, pos) + table + markdown.slice(pos);
        setMarkdown(newText);
        setTimeout(() => textarea.focus(), 0);
    }, [markdown]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        // Tab â†’ indent with 2 spaces
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const indent = '  ';
            const newText = markdown.slice(0, start) + indent + markdown.slice(end);
            setMarkdown(newText);
            setTimeout(() => textarea.setSelectionRange(start + 2, start + 2), 0);
            return;
        }

        if (!e.ctrlKey && !e.metaKey) return;

        switch (e.key.toLowerCase()) {
            case 'b':
                e.preventDefault();
                insertFormat('**', '**', 'bold text');
                break;
            case 'i':
                e.preventDefault();
                insertFormat('*', '*', 'italic text');
                break;
            case 'k':
                e.preventDefault();
                insertFormat('[', '](url)', 'link text');
                break;
            case 'h':
                e.preventDefault();
                setShowFindReplace(prev => !prev);
                setTimeout(() => findInputRef.current?.focus(), 50);
                break;
            case 'z':
                // allow native undo
                break;
        }
    }, [markdown, insertFormat]);

    const handleEditorDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        if (!file.name.match(/\.(md|markdown|txt)$/i)) {
            toast.error('Invalid file type', 'Please drop a .md, .markdown, or .txt file.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target?.result as string;
            setMarkdown(content);
            toast.success('File loaded', `"${file.name}" has been opened in the editor.`);
        };
        reader.readAsText(file);
    }, [toast]);

    const handleFindReplace = useCallback(() => {
        if (!findText) return;
        const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const newText = markdown.replace(new RegExp(escaped, 'gi'), replaceText);
        setMarkdown(newText);
    }, [markdown, findText, replaceText]);

    const TEMPLATES: { label: string; icon: string; content: string }[] = [
        {
            label: 'Technical Report',
            icon: '📄',
            content: `# Technical Report\n\n**Author:** Your Name  \n**Date:** ${new Date().toLocaleDateString()}  \n**Version:** 1.0\n\n---\n\n## Executive Summary\n\nA brief overview of the report's purpose and key findings.\n\n## Introduction\n\nBackground information and context for the report.\n\n## Methodology\n\nDescribe the methods used to gather data and conduct analysis.\n\n## Results\n\n| Metric | Value | Notes |\n| --- | --- | --- |\n| Item 1 | â€” | â€” |\n| Item 2 | â€” | â€” |\n\n## Conclusion\n\nSummarize the findings and recommendations.\n\n## References\n\n1. Reference one\n2. Reference two\n`
        },
        {
            label: 'Meeting Notes',
            icon: '📝',
            content: `# Meeting Notes\n\n**Date:** ${new Date().toLocaleDateString()}  \n**Attendees:** Name 1, Name 2  \n**Facilitator:** Name\n\n---\n\n## Agenda\n\n1. Topic One\n2. Topic Two\n3. Action Items\n\n## Discussion\n\n### Topic One\n\nKey points discussed...\n\n### Topic Two\n\nKey points discussed...\n\n## Action Items\n\n| # | Task | Owner | Due Date |\n| --- | --- | --- | --- |\n| 1 | Task description | Owner | Date |\n| 2 | Task description | Owner | Date |\n\n## Next Meeting\n\n**Date:** TBD  \n**Location:** TBD\n`
        },
        {
            label: 'README',
            icon: '📦',
            content: `# Project Name\n\n> A short description of what this project does.\n\n![License](https://img.shields.io/badge/license-MIT-blue)\n\n## Features\n\n- âœ… Feature one\n- âœ… Feature two\n- âœ… Feature three\n\n## Installation\n\n\`\`\`bash\nnpm install your-package\n\`\`\`\n\n## Usage\n\n\`\`\`javascript\nconst pkg = require('your-package');\npkg.doSomething();\n\`\`\`\n\n## Contributing\n\nPull requests are welcome. For major changes, please open an issue first.\n\n## License\n\n[MIT](LICENSE)\n`
        },
        {
            label: 'Research Paper',
            icon: '🔬',
            content: `# Research Paper Title\n\n**Abstract:** A concise summary of the research, including the problem, methodology, results, and conclusion.\n\n---\n\n## 1. Introduction\n\nContext and motivation for the research.\n\n## 2. Literature Review\n\nReview of existing work in the field.\n\n## 3. Methodology\n\nDetailed description of the research approach.\n\n## 4. Results\n\nPresentation of findings with data and analysis.\n\n## 5. Discussion\n\nInterpretation of results and implications.\n\n## 6. Conclusion\n\nSummary of findings and future directions.\n\n## References\n\n- Author, A. (Year). *Title*. Publisher.\n- Author, B. (Year). *Title*. Journal, Vol(No), pp.\n`
        },
        {
            label: 'Project Proposal',
            icon: '🚀',
            content: `# Project Proposal: [Project Title]\n\n**Prepared by:** Your Name  \n**Date:** ${new Date().toLocaleDateString()}\n\n---\n\n## Problem Statement\n\nDescribe the problem this project aims to solve.\n\n## Proposed Solution\n\nOutline the proposed approach and solution.\n\n## Scope\n\n- **In scope:** What will be done\n- **Out of scope:** What will not be done\n\n## Timeline\n\n| Phase | Description | Duration |\n| --- | --- | --- |\n| Phase 1 | Planning | 2 weeks |\n| Phase 2 | Development | 4 weeks |\n| Phase 3 | Testing | 1 week |\n\n## Budget\n\n| Item | Cost |\n| --- | --- |\n| Item 1 | $0 |\n| Total | $0 |\n\n## Success Criteria\n\n1. Criterion one\n2. Criterion two\n`
        }
    ];

    const applyTemplate = useCallback(async (content: string) => {
        if (markdown.trim()) {
            const ok = await toast.confirm('This will replace your current content. Are you sure you want to continue?');
            if (!ok) return;
        }
        setMarkdown(content);
        setShowTemplates(false);
        toast.success('Template applied', 'Your editor has been loaded with the template.');
    }, [markdown, toast]);

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
            toast.warning('Still loading', 'PDF libraries are still loading. Please try again in a moment.');
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
            const baseLineHeight = baseFontSize * 0.53;
            const shouldRenderHeader = headerEnabled;
            const shouldRenderFooter = footerEnabled || showPageNumbers;

            const headerTextValue = headerText.trim() || (firstHeading?.text ? firstHeading.text.substring(0, 60) : 'Document');

            // --- TRACK FIRST CONTENT ---
            let isFirstContent = true;

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
                const lineHeight = options.size * 0.53;
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
                        const safePart = sanitizeForPdf(part);
                        const partWidth = pdf.getTextWidth(safePart);
                        if (currentX + partWidth > xStart + maxWidth) {
                            ensureLineSpace(lineHeight);
                            currentY += lineHeight;
                            currentX = xStart;
                        }
                        pdf.text(safePart, currentX, currentY);
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
                            const safePart = sanitizeForPdf(part);
                            const partWidth = pdf.getTextWidth(safePart);
                            if (currentX + partWidth > xStart + maxWidth) {
                                ensureLineSpace(lineHeight);
                                currentY += lineHeight;
                                currentX = xStart;
                            }
                            pdf.text(safePart, currentX, currentY);
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
                const rawText = token.text || '';
                // Paragraphs containing box-drawing or arrow chars are ASCII-art diagrams
                if (_DIAGRAM_RE.test(rawText)) {
                    let rendered = false;
                    const el = document.createElement('div');
                    el.style.cssText = [
                        'position:fixed',
                        'left:-9999px',
                        'top:0',
                        'background:#f5f5f5',
                        'padding:10px 14px',
                        'font-family:"Courier New",Courier,monospace',
                        'font-size:11.5px',
                        'line-height:1.5',
                        'white-space:pre',
                        'width:780px',
                        'color:#1a1a1a',
                        'border-left:3px solid #666666',
                        'box-sizing:border-box',
                    ].join(';');
                    el.textContent = rawText;
                    document.body.appendChild(el);
                    try {
                        const canvas = await html2canvas(el, { scale: 2, logging: false, backgroundColor: '#f5f5f5' });
                        const imgData = canvas.toDataURL('image/png');
                        const imgWidth = contentWidth;
                        const imgHeight = (canvas.height / canvas.width) * imgWidth;
                        checkPageBreak(imgHeight + 5);
                        pdf.addImage(imgData, 'PNG', margin.left, currentY - 2, imgWidth, imgHeight);
                        currentY += imgHeight + 5;
                        rendered = true;
                    } catch {
                        // fall through to normal paragraph rendering
                    } finally {
                        document.body.removeChild(el);
                    }
                    if (rendered) return;
                }
                ensureLineSpace(baseLineHeight);
                const inlineTokens = token.tokens || [];
                if (inlineTokens.length) {
                    await renderInlineTokens(inlineTokens);
                } else {
                    await drawWrappedText(rawText, { font: fontFamily, style: 'normal', size: baseFontSize, color: [44, 44, 44] });
                    currentY += baseLineHeight * 0.6;
                }
            };

            const renderHeading = async (token: any) => {
                const level = token.depth || 1;
                const sizeMap = [baseFontSize + 6, baseFontSize + 3.5, baseFontSize + 2, baseFontSize + 1, baseFontSize, baseFontSize - 0.5];
                const fontSize = Math.max(8.5, sizeMap[level - 1] || baseFontSize);
                checkPageBreak(fontSize * 1.2);
                await drawWrappedText(token.text || '', { font: fontFamily, style: 'bold', size: fontSize, color: [26, 26, 26] });
                // drawWrappedText always adds fontSize*0.53 trailing; pull that back so
                // headings don't accumulate huge gaps — then add a tighter explicit bottom.
                currentY -= fontSize * 0.3;
                if (level === 1) {
                    pdf.setDrawColor(204, 204, 204);
                    pdf.setLineWidth(0.2);
                    pdf.line(margin.left, currentY + 1, pageWidth - margin.right, currentY + 1);
                }
                currentY += level <= 2 ? baseLineHeight * 0.65 : baseLineHeight * 0.45;
            };

            const renderCodeBlock = async (token: any) => {
                const code = token.text || '';

                // Code blocks with Unicode (box-drawing, arrows, etc.) are rendered
                // as images so the browser's monospace font handles all glyphs natively
                if (/[^\x00-\xFF]/.test(code)) {
                    let rendered = false;
                    const el = document.createElement('div');
                    el.style.cssText = [
                        'position:fixed',
                        'left:-9999px',
                        'top:0',
                        'background:#f5f5f5',
                        'padding:10px 14px',
                        'font-family:"Courier New",Courier,monospace',
                        'font-size:11.5px',
                        'line-height:1.5',
                        'white-space:pre',
                        'width:780px',
                        'color:#1a1a1a',
                        'border-left:3px solid #666666',
                        'box-sizing:border-box',
                    ].join(';');
                    el.textContent = code;
                    document.body.appendChild(el);
                    try {
                        const canvas = await html2canvas(el, { scale: 2, logging: false, backgroundColor: '#f5f5f5' });
                        const imgData = canvas.toDataURL('image/png');
                        const imgWidth = contentWidth;
                        const imgHeight = (canvas.height / canvas.width) * imgWidth;
                        checkPageBreak(imgHeight + 5);
                        pdf.addImage(imgData, 'PNG', margin.left, currentY - 2, imgWidth, imgHeight);
                        currentY += imgHeight + 5;
                        rendered = true;
                    } catch {
                        // fall through to ASCII text rendering below
                    } finally {
                        document.body.removeChild(el);
                    }
                    if (rendered) return;
                    // html2canvas failed — continue to text path with ASCII sanitization
                }

                const rawLines = code.split('\n');
                const lines = rawLines.map((l: string) => sanitizeForPdf(l));

                // Auto-scale font so the widest line fits within the content area
                let codeFontSize = Math.max(4.5, baseFontSize - 1);
                pdf.setFont('courier', 'normal');
                pdf.setFontSize(codeFontSize);
                const availableCodeWidth = contentWidth - 10;
                const maxLineW = lines.reduce((max: number, l: string) => {
                    const w = l.length > 0 ? pdf.getTextWidth(l) : 0;
                    return w > max ? w : max;
                }, 0);
                if (maxLineW > availableCodeWidth && maxLineW > 0) {
                    codeFontSize = Math.max(4.5, codeFontSize * (availableCodeWidth / maxLineW));
                    pdf.setFontSize(codeFontSize);
                }

                const lineHeight = codeFontSize * 0.55;
                const blockHeight = lines.length * lineHeight + 8;
                checkPageBreak(Math.min(blockHeight, pageHeight - margin.top - margin.bottom - 10));
                pdf.setFillColor(245, 245, 245);
                pdf.rect(margin.left, currentY - 2, contentWidth, blockHeight, 'F');
                pdf.setDrawColor(102, 102, 102);
                pdf.setLineWidth(1);
                pdf.line(margin.left, currentY - 2, margin.left, currentY + blockHeight - 2);
                pdf.setFont('courier', 'normal');
                pdf.setFontSize(codeFontSize);
                pdf.setTextColor(26, 26, 26);
                lines.forEach((line: string, idx: number) => {
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
                    // If the diagram is relatively small (less than 1/3 of the page) or 
                    // if it's only slightly larger than the available space, scale it down.
                    // Otherwise, move it to the next page to maintain readability.
                    const isSmallDiagram = renderHeight < (pageHeight / 3);
                    const threshold = isSmallDiagram ? 2.5 : 1.8;
                    
                    if (renderHeight > availableHeight * threshold) {
                        checkPageBreak(renderHeight + 6);
                    } else {
                        renderHeight = Math.max(availableHeight, 15); // Don't scale below 15mm
                        renderWidth = renderHeight / aspectRatio;
                        // Center it again after scaling
                        if (renderWidth > maxDiagramWidth) {
                            renderWidth = maxDiagramWidth;
                            renderHeight = renderWidth * aspectRatio;
                        }
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
                // Extract text from token objects (marked v4+ returns objects with .text)
                const extractCellText = (cell: any): string => {
                    if (typeof cell === 'string') return cell;
                    // Prefer tokens — marked v4+ stores raw markdown in cell.text ("**bold**")
                    // but the parsed inline tokens contain clean text
                    if (cell && cell.tokens && cell.tokens.length > 0) {
                        const fromToks = (toks: any[]): string =>
                            toks.map((t: any) =>
                                t.tokens && t.tokens.length > 0 ? fromToks(t.tokens) : (t.text || t.raw || '')
                            ).join('');
                        return fromToks(cell.tokens);
                    }
                    if (cell && typeof cell.text === 'string') return cell.text;
                    return String(cell ?? '');
                };

                const rawHeaders = token.header || [];
                const rawRows = token.rows || [];
                const headers: string[] = rawHeaders.map(extractCellText);
                const rows: string[][] = rawRows.map((row: any[]) => row.map(extractCellText));

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
                    pdf.setFont(fontFamily as any, bold ? 'bold' : 'normal');
                    pdf.setFontSize(fontSize);

                    const rowHeight = measureRowHeight(row);
                    row.forEach((cell, colIndex) => {
                        const x = margin.left + colIndex * colWidth;
                        const lines = pdf.splitTextToSize(sanitizeForPdf(cell || ''), colWidth - 4);
                        // Re-apply fill + draw + text colors per cell to avoid jsPDF state bleed
                        pdf.setFillColor(style.fill[0], style.fill[1], style.fill[2]);
                        pdf.setDrawColor(style.border[0], style.border[1], style.border[2]);
                        pdf.rect(x, y, colWidth, rowHeight, 'FD');
                        pdf.setTextColor(style.text[0], style.text[1], style.text[2]);
                        lines.forEach((line: string, lineIdx: number) => {
                            pdf.text(line, x + 2, y + rowPadding + (lineIdx + 1) * lineHeight);
                        });
                    });
                    return rowHeight;
                };

                const headerHeight = measureRowHeight(headers);
                checkPageBreak(headerHeight + 4);
                let rowY = currentY;
                const headerRowHeight = drawRow(headers, rowY, theme.header, true);
                rowY += headerRowHeight;

                rows.forEach((row: string[], idx: number) => {
                    const rowHeight = measureRowHeight(row);
                    if (checkPageBreak(rowHeight + 2)) {
                        rowY = currentY; // sync after page break to avoid blank pages
                    }
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
                    if (!isFirstContent) {
                        currentY += baseLineHeight * 0.55;
                    }
                    continue;
                }
                isFirstContent = false;
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
                        await renderCodeBlock(token);
                    }
                    continue;
                }
                if (token.type === 'blockquote') {
                    renderBlockquote(token);
                    continue;
                }
                if (token.type === 'hr') {
                    // Only draw the hr line when comfortably away from the bottom margin.
                    // If we're near the bottom, the footer already has its own separator line â€”
                    // drawing here too would create a distracting double-line just above the footer.
                    const nearBottom = currentY > pageHeight - margin.bottom - 18;
                    if (!nearBottom) {
                        ensureLineSpace(6);
                        pdf.setDrawColor(180, 180, 180);
                        pdf.setLineWidth(0.3);
                        pdf.line(margin.left, currentY, pageWidth - margin.right, currentY);
                    }
                    currentY += baseLineHeight * 0.55;
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
            toast.success('Downloaded!', `${filename}.pdf has been saved.`);
        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error('Generation failed', 'Failed to generate PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const clearEditor = () => {
        toast.confirm('Are you sure you want to clear all contents? This cannot be undone.').then(ok => {
            if (ok) setMarkdown('');
        });
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

                    {/* Template Picker */}
                    <div className="control-group" style={{ position: 'relative' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowTemplates(prev => !prev)}
                            title="Insert a starter template"
                        >
                            <LayoutTemplate size={16} />
                            Templates
                            <ChevronDown size={14} style={{ marginLeft: 2 }} />
                        </button>
                        {showTemplates && (
                            <div className="template-dropdown">
                                {TEMPLATES.map((t, i) => (
                                    <button
                                        key={i}
                                        className="template-item"
                                        onClick={() => applyTemplate(t.content)}
                                    >
                                        <span className="template-icon">{t.icon}</span>
                                        <span>{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Find & Replace toggle */}
                    <div className="control-group">
                        <button
                            className={`btn btn-secondary ${showFindReplace ? 'active-btn' : ''}`}
                            onClick={() => {
                                setShowFindReplace(prev => !prev);
                                setTimeout(() => findInputRef.current?.focus(), 50);
                            }}
                            title="Find & Replace (Ctrl+H)"
                        >
                            <Search size={16} />
                            Find
                        </button>
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
                            <h2>
                                <AlignLeft size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                                Markdown Editor
                            </h2>
                            <div className="editor-header-actions">
                                <span className="word-count">
                                    {wordCount} words Â· {charCount} chars Â· {lineCount} lines
                                </span>
                                {lastSaved && (
                                    <span className="autosave-label">âœ“ Saved</span>
                                )}
                                <button
                                    onClick={copyToClipboard}
                                    className="btn-icon"
                                    title={isCopied ? 'Copied!' : 'Copy markdown to clipboard'}
                                >
                                    {isCopied ? <Check size={16} color="#4ade80" /> : <ClipboardCopy size={16} />}
                                </button>
                                <button onClick={clearEditor} className="btn-icon" title="Clear editor">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Markdown Toolbar */}
                        <div className="md-toolbar">
                            <div className="toolbar-group">
                                <button className="toolbar-btn" title="Bold (Ctrl+B)" onClick={() => insertFormat('**', '**', 'bold text')}>
                                    <Bold size={14} />
                                </button>
                                <button className="toolbar-btn" title="Italic (Ctrl+I)" onClick={() => insertFormat('*', '*', 'italic text')}>
                                    <Italic size={14} />
                                </button>
                                <button className="toolbar-btn" title="Strikethrough" onClick={() => insertFormat('~~', '~~', 'strikethrough')}>
                                    <Strikethrough size={14} />
                                </button>
                            </div>
                            <div className="toolbar-divider" />
                            <div className="toolbar-group">
                                <button className="toolbar-btn" title="Heading 1" onClick={() => insertAtLineStart('# ', 'Heading 1')}>
                                    <Heading1 size={14} />
                                </button>
                                <button className="toolbar-btn" title="Heading 2" onClick={() => insertAtLineStart('## ', 'Heading 2')}>
                                    <Heading2 size={14} />
                                </button>
                                <button className="toolbar-btn" title="Heading 3" onClick={() => insertAtLineStart('### ', 'Heading 3')}>
                                    <Heading3 size={14} />
                                </button>
                            </div>
                            <div className="toolbar-divider" />
                            <div className="toolbar-group">
                                <button className="toolbar-btn" title="Inline Code" onClick={() => insertFormat('`', '`', 'code')}>
                                    <Code size={14} />
                                </button>
                                <button className="toolbar-btn" title="Code Block" onClick={() => insertFormat('```\n', '\n```', 'code here')}>
                                    <Code2 size={14} />
                                </button>
                                <button className="toolbar-btn" title="Blockquote" onClick={() => insertAtLineStart('> ', 'Quote text')}>
                                    <Quote size={14} />
                                </button>
                            </div>
                            <div className="toolbar-divider" />
                            <div className="toolbar-group">
                                <button className="toolbar-btn" title="Unordered List" onClick={() => insertAtLineStart('- ', 'List item')}>
                                    <List size={14} />
                                </button>
                                <button className="toolbar-btn" title="Ordered List" onClick={() => insertAtLineStart('1. ', 'List item')}>
                                    <ListOrdered size={14} />
                                </button>
                            </div>
                            <div className="toolbar-divider" />
                            <div className="toolbar-group">
                                <button className="toolbar-btn" title="Link" onClick={() => insertFormat('[', '](url)', 'link text')}>
                                    <Link2 size={14} />
                                </button>
                                <button className="toolbar-btn" title="Image" onClick={() => insertFormat('![', '](image-url)', 'alt text')}>
                                    <ImageIcon size={14} />
                                </button>
                                <button className="toolbar-btn" title="Table" onClick={insertTable}>
                                    <Table2 size={14} />
                                </button>
                                <button className="toolbar-btn" title="Horizontal Rule" onClick={() => insertAtLineStart('---', '')}>
                                    <Minus size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Find & Replace Panel */}
                        {showFindReplace && (
                            <div className="find-replace-panel">
                                <div className="find-row">
                                    <Search size={13} />
                                    <input
                                        ref={findInputRef}
                                        type="text"
                                        className="find-input"
                                        placeholder="Find..."
                                        value={findText}
                                        onChange={(e) => setFindText(e.target.value)}
                                    />
                                    {findText && (
                                        <span className="match-count">
                                            {findMatchCount} match{findMatchCount !== 1 ? 'es' : ''}
                                        </span>
                                    )}
                                </div>
                                <div className="find-row">
                                    <Replace size={13} />
                                    <input
                                        type="text"
                                        className="find-input"
                                        placeholder="Replace with..."
                                        value={replaceText}
                                        onChange={(e) => setReplaceText(e.target.value)}
                                    />
                                    <button
                                        className="btn btn-secondary find-replace-btn"
                                        onClick={handleFindReplace}
                                        disabled={!findText}
                                    >
                                        Replace All
                                    </button>
                                    <button
                                        className="btn-icon find-close"
                                        onClick={() => setShowFindReplace(false)}
                                        title="Close"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div
                            className={`editor-drop-zone ${isDragging ? 'dragging' : ''}`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleEditorDrop}
                        >
                            {isDragging && (
                                <div className="drop-overlay">
                                    <Upload size={32} />
                                    <span>Drop your .md file here</span>
                                </div>
                            )}
                            <textarea
                                ref={textareaRef}
                                value={markdown}
                                onChange={(e) => setMarkdown(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="markdown-textarea"
                                placeholder="# Start writing your markdown here...&#10;&#10;Use the toolbar above to format your text, or type Markdown directly.&#10;Tip: Drag & drop a .md file onto the editor to open it."
                                spellCheck={false}
                            />
                        </div>
                    </div>

                    <div className="preview-panel">
                        <div className="panel-header">
                            <h2>PDF Preview</h2>
                            <div className="preview-controls">
                                <button
                                    className="btn-icon"
                                    title="Zoom out"
                                    onClick={() => setPreviewZoom(z => Math.max(40, z - 10))}
                                >
                                    <ZoomOut size={15} />
                                </button>
                                <span className="zoom-label">{previewZoom}%</span>
                                <button
                                    className="btn-icon"
                                    title="Zoom in"
                                    onClick={() => setPreviewZoom(z => Math.min(150, z + 10))}
                                >
                                    <ZoomIn size={15} />
                                </button>
                                <button
                                    className="btn-icon"
                                    title="Reset zoom"
                                    onClick={() => setPreviewZoom(75)}
                                    style={{ fontSize: '0.7rem', width: '28px', fontWeight: 700 }}
                                >
                                    1:1
                                </button>
                            </div>
                        </div>
                        <div className="preview-wrapper">
                            <div style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: 'top center', transition: 'transform 0.2s ease' }}>
                                <div
                                    className="preview-page"
                                    style={{
                                        width: `${previewWidth}mm`,
                                        minHeight: `${previewHeight}mm`,
                                        fontFamily: previewFont,
                                        fontSize: `${baseFontSize}pt`,
                                        ['--preview-base-size' as any]: `${baseFontSize}pt`,
                                        // Dynamic Table Theme Colors
                                        ['--table-header-bg' as any]: `rgb(${TABLE_THEMES[tableTheme].header.fill.join(',')})`,
                                        ['--table-header-text' as any]: `rgb(${TABLE_THEMES[tableTheme].header.text.join(',')})`,
                                        ['--table-header-border' as any]: `rgb(${TABLE_THEMES[tableTheme].header.border.join(',')})`,
                                        ['--table-row-even-bg' as any]: `rgb(${TABLE_THEMES[tableTheme].rowEven.fill.join(',')})`,
                                        ['--table-row-odd-bg' as any]: `rgb(${TABLE_THEMES[tableTheme].rowOdd.fill.join(',')})`,
                                        ['--table-row-text' as any]: `rgb(${TABLE_THEMES[tableTheme].rowEven.text.join(',')})`,
                                        ['--table-row-border' as any]: `rgb(${TABLE_THEMES[tableTheme].rowEven.border.join(',')})`
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
            </div>

            {/* All layout styles moved to globals.css for SSR-safe rendering */}
        </section>
    );
}
