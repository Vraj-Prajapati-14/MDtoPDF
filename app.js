// ===================================
// Markdown to PDF Converter App
// ===================================

// Initialize marked.js options
marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: true,
    mangle: false,
    sanitize: false
});

// DOM Elements
const markdownInput = document.getElementById('markdown-input');
const previewContent = document.getElementById('preview-content');
const fileUpload = document.getElementById('file-upload');
const downloadBtn = document.getElementById('download-btn');
const clearBtn = document.getElementById('clear-btn');
const pageSizeSelect = document.getElementById('page-size');
const orientationSelect = document.getElementById('orientation');

// State
let debounceTimer;

// ===================================
// Core Functions
// ===================================

/**
 * Convert Markdown to HTML and update preview
 */
function updatePreview() {
    const markdownText = markdownInput.value;

    if (!markdownText.trim()) {
        previewContent.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;">Start typing to see preview...</p>';
        return;
    }

    try {
        const html = marked.parse(markdownText);
        previewContent.innerHTML = html;

        // Add syntax highlighting to code blocks
        highlightCodeBlocks();
    } catch (error) {
        console.error('Markdown parsing error:', error);
        previewContent.innerHTML = '<p style="color: #e74c3c;">Error parsing Markdown. Please check your syntax.</p>';
    }
}

/**
 * Simple syntax highlighting for code blocks
 */
function highlightCodeBlocks() {
    const codeBlocks = previewContent.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        // Basic syntax highlighting
        let code = block.textContent;

        // Highlight keywords
        code = code.replace(/\b(function|const|let|var|if|else|for|while|return|class|import|export|async|await)\b/g,
            '<span style="color: #c678dd;">$1</span>');

        // Highlight strings
        code = code.replace(/(['"`])(.*?)\1/g,
            '<span style="color: #98c379;">$1$2$1</span>');

        // Highlight numbers
        code = code.replace(/\b(\d+)\b/g,
            '<span style="color: #d19a66;">$1</span>');

        // Highlight comments
        code = code.replace(/(\/\/.*$)/gm,
            '<span style="color: #5c6370; font-style: italic;">$1</span>');

        block.innerHTML = code;
    });
}

/**
 * Debounced update to improve performance
 */
function debouncedUpdate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(updatePreview, 300);
}

/**
 * Handle file upload
 */
function handleFileUpload(event) {
    const file = event.target.files[0];

    if (!file) return;

    // Validate file type
    const validTypes = ['.md', '.markdown', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

    if (!validTypes.includes(fileExtension)) {
        alert('Please upload a valid Markdown file (.md, .markdown, or .txt)');
        return;
    }

    // Read file
    const reader = new FileReader();

    reader.onload = function (e) {
        markdownInput.value = e.target.result;
        updatePreview();
        showNotification('File loaded successfully!', 'success');
    };

    reader.onerror = function () {
        showNotification('Error reading file. Please try again.', 'error');
    };

    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
}

async function downloadPDF() {
    const markdownText = markdownInput.value;
    if (!markdownText.trim()) {
        showNotification('Please add some content before downloading', 'warning');
        return;
    }

    if (!previewContent.innerHTML || previewContent.innerHTML.includes('Start typing to see preview')) {
        showNotification('Please wait for preview to load', 'warning');
        return;
    }

    // Show loading state
    const originalText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="spinner">
            <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
            <path d="M10 2 A8 8 0 0 1 18 10" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
        </svg>
        Converting...
    `;
    downloadBtn.disabled = true;

    let tempContainer = null;
    let overlay = null;

    try {
        const pageSize = pageSizeSelect.value;
        const orientation = orientationSelect.value;
        const marginMm = 12; // Moderate margin

        // Determine Page Width in mm
        const pageSizes = {
            a4: 210,
            letter: 216,
            legal: 216,
            a3: 297
        };
        // If landscape, swapping width/height logic (roughly) implies the width is the larger dimension
        // Standard heights: A4=297, Letter=279, Legal=356, A3=420
        const pageHeights = {
            a4: 297,
            letter: 279,
            legal: 356,
            a3: 420
        };

        const baseWidth = pageSizes[pageSize];
        const baseHeight = pageHeights[pageSize];

        // Printable area calculation
        const pdfPageWidth = orientation === 'landscape' ? baseHeight : baseWidth;
        const printWidth = pdfPageWidth - (marginMm * 2);

        // 1. Create a "shadow" overlay
        overlay = document.createElement('div');
        overlay.id = 'pdf-overlay-root';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -9999;
            opacity: 0;
            overflow: auto;
            background-color: #ffffff;
        `;
        document.body.appendChild(overlay);

        // 2. Clone content
        tempContainer = previewContent.cloneNode(true);
        tempContainer.classList.add('pdf-content');

        // 3. Precise Width Control
        // Setting width to exactly the printable area ensures HTML text wrapping matches PDF render space exactly.
        // This prevents the "formatting drift" where text wraps differently in browser vs PDF.
        tempContainer.style.width = `${printWidth}mm`;
        tempContainer.style.maxWidth = `${printWidth}mm`;
        tempContainer.style.minWidth = `${printWidth}mm`;
        tempContainer.style.margin = '0 auto';
        tempContainer.style.padding = '0';
        tempContainer.style.height = 'auto';

        // Pre-process code blocks to prevent mid-line cutting
        // We wrap every line of code in a div with page-break-inside: avoid
        const codeBlocks = tempContainer.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            const rawHtml = block.innerHTML;
            // Split by newline while preserving the HTML formatting (simple approach)
            // Note: complex syntax highlighting spans might span across lines, usually marked.js/highlight.js handles this well,
            // but for safety we simply ensure block display for lines if possible.
            // A safer, robust way for raw text or simple spans:
            const lines = rawHtml.split(/\r\n|\r|\n/);
            if (lines.length > 1) {
                // We reconstruct the block as a stack of divs
                block.innerHTML = lines.map(line =>
                    // Empty lines need a space to be rendered
                    `<div class="code-line">${line || ' '}</div>`
                ).join('');
                block.classList.add('processed-code-block');
            }
        });

        // 4. Styles for the PDF content
        const style = document.createElement('style');
        style.innerHTML = `
            .pdf-content {
                font-family: Arial, sans-serif;
                font-size: 11pt; /* Slightly smaller for better fit */
                line-height: 1.5;
                color: #000000;
                background: #ffffff;
                box-sizing: border-box;
            }
            .pdf-content * {
                box-sizing: border-box;
                visibility: visible !important;
                max-width: 100% !important;
            }
            
            /* Typography */
            .pdf-content h1 { font-size: 24pt; border-bottom: 2px solid #333; margin-top: 0; padding-bottom: 5px; }
            .pdf-content h2 { font-size: 18pt; border-bottom: 1px solid #ccc; margin-top: 20px; padding-bottom: 5px; }
            .pdf-content h3 { font-size: 14pt; margin-top: 15px; }
            .pdf-content p { margin-bottom: 10px; text-align: justify; }
            
            /* Page Break Logic */
            .pdf-content h1, .pdf-content h2, .pdf-content h3 {
                page-break-after: avoid;
                page-break-inside: avoid;
            }
            
            /* Critical fix for code line cutting */
            .pdf-content pre {
                background: #f6f8fa;
                border: 1px solid #d0d7de;
                padding: 12px;
                border-radius: 4px;
                margin-bottom: 1em;
                font-family: Consolas, "Courier New", monospace;
                font-size: 10pt;
                page-break-inside: auto; /* Allow the container to break */
            }
            
            .pdf-content code {
                white-space: pre-wrap !important;
                word-wrap: break-word !important;
                display: block; /* Important for the line divs to stack */
            }

            .pdf-content .code-line {
                page-break-inside: avoid; /* Never break inside a single line of code */
                display: block;
                width: 100%;
            }

            .pdf-content blockquote {
                border-left: 4px solid #007bff;
                padding-left: 10px;
                color: #555;
                font-style: italic;
                margin: 10px 0;
                page-break-inside: avoid;
            }
            
            .pdf-content table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
                page-break-inside: auto; /* Allow tables to break */
            }
            .pdf-content th, .pdf-content td {
                border: 1px solid #dfe2e5;
                padding: 6px 13px;
                vertical-align: top;
            }
            .pdf-content tr {
                background-color: #fff;
                border-top: 1px solid #c6cbd1;
                page-break-inside: avoid; /* Don't break single rows */
            }
            .pdf-content img {
                page-break-inside: avoid;
                max-width: 100%;
                height: auto;
            }
        `;
        overlay.appendChild(style);
        overlay.appendChild(tempContainer);

        // Allow layout settle
        await new Promise(resolve => setTimeout(resolve, 150));

        // 5. PDF Generation Configuration
        const opt = {
            margin: marginMm,
            filename: 'markdown.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                scrollY: 0,
                // Ensure we capture the overlay specifically
                windowWidth: overlay.offsetWidth,
                windowHeight: overlay.scrollHeight,
                onclone: (clonedDoc) => {
                    const clonedOverlay = clonedDoc.getElementById('pdf-overlay-root');
                    if (clonedOverlay) {
                        clonedOverlay.style.opacity = '1';
                        clonedOverlay.style.zIndex = '99999';
                        clonedOverlay.style.position = 'relative';
                        clonedOverlay.style.height = 'auto';
                        clonedOverlay.style.overflow = 'visible';
                    }
                }
            },
            jsPDF: {
                unit: 'mm',
                format: pageSize,
                orientation: orientation
            },
            pagebreak: { mode: ['css', 'legacy'] }
        };

        await html2pdf().set(opt).from(tempContainer).save();
        showNotification('PDF downloaded successfully!', 'success');

    } catch (error) {
        console.error('PDF generation error:', error);
        showNotification('Error generating PDF. Please try again.', 'error');
    } finally {
        if (overlay && overlay.parentNode) {
            document.body.removeChild(overlay);
        }
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
    }
}

/**
 * Clear editor
 */
function clearEditor() {
    if (markdownInput.value.trim() && !confirm('Are you sure you want to clear all content?')) {
        return;
    }

    markdownInput.value = '';
    updatePreview();
    markdownInput.focus();
    showNotification('Editor cleared', 'info');
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '0.5rem',
        backgroundColor: type === 'success' ? '#10b981' :
            type === 'error' ? '#ef4444' :
                type === 'warning' ? '#f59e0b' : '#3b82f6',
        color: 'white',
        fontWeight: '500',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        zIndex: '10000',
        animation: 'slideInRight 0.3s ease',
        maxWidth: '300px'
    });

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===================================
// Keyboard Shortcuts
// ===================================
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + S: Download PDF
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        downloadPDF();
    }

    // Ctrl/Cmd + K: Clear editor
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearEditor();
    }

    // Tab: Insert tab character
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = markdownInput.selectionStart;
        const end = markdownInput.selectionEnd;
        const value = markdownInput.value;

        markdownInput.value = value.substring(0, start) + '    ' + value.substring(end);
        markdownInput.selectionStart = markdownInput.selectionEnd = start + 4;
    }
}

// ===================================
// Local Storage
// ===================================
function saveToLocalStorage() {
    try {
        localStorage.setItem('markdownContent', markdownInput.value);
        localStorage.setItem('pageSize', pageSizeSelect.value);
        localStorage.setItem('orientation', orientationSelect.value);
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadFromLocalStorage() {
    try {
        const savedContent = localStorage.getItem('markdownContent');
        const savedPageSize = localStorage.getItem('pageSize');
        const savedOrientation = localStorage.getItem('orientation');

        if (savedContent) {
            markdownInput.value = savedContent;
            updatePreview();
        }

        if (savedPageSize) {
            pageSizeSelect.value = savedPageSize;
        }

        if (savedOrientation) {
            orientationSelect.value = savedOrientation;
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
}

// ===================================
// Event Listeners
// ===================================
markdownInput.addEventListener('input', () => {
    debouncedUpdate();
    saveToLocalStorage();
});

markdownInput.addEventListener('keydown', handleKeyboardShortcuts);

fileUpload.addEventListener('change', handleFileUpload);

downloadBtn.addEventListener('click', downloadPDF);

clearBtn.addEventListener('click', clearEditor);

pageSizeSelect.addEventListener('change', saveToLocalStorage);

orientationSelect.addEventListener('change', saveToLocalStorage);

// ===================================
// Add CSS animations for notifications
// ===================================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .spinner {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
`;
document.head.appendChild(style);

// ===================================
// Initialize
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    updatePreview();

    // Set default content if empty
    if (!markdownInput.value.trim()) {
        markdownInput.value = `# Welcome to MarkdownPDF! 🎉

## What is this?

MarkdownPDF is a **free**, **fast**, and **secure** online tool to convert Markdown to PDF instantly.

### Features

- ✨ Real-time preview
- 🚀 Lightning-fast conversion
- 🔒 100% private (everything happens in your browser)
- 📱 Works on all devices
- 🎨 Beautiful formatting

### How to use

1. Type or paste your Markdown content
2. See the live preview on the right
3. Click "Download PDF" when ready

### Example Code

\`\`\`javascript
function greet(name) {
    console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

### Keyboard Shortcuts

- **Ctrl/Cmd + S**: Download PDF
- **Ctrl/Cmd + K**: Clear editor
- **Tab**: Insert indentation

---

**Ready to create your document?** Start editing this text or upload your own .md file!`;
        updatePreview();
    }

    console.log('%c🚀 MarkdownPDF Ready!', 'color: #667EEA; font-size: 16px; font-weight: bold;');
    console.log('%cKeyboard shortcuts: Ctrl/Cmd+S (Download), Ctrl/Cmd+K (Clear)', 'color: #999;');
});
