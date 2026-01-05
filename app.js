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

/**
 * Download PDF - Professional print method with modern styling
 */
async function downloadPDF() {
    const markdownText = markdownInput.value;
    if (!markdownText.trim()) {
        showNotification('Please add some content before downloading', 'warning');
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

    try {
        const pageSize = pageSizeSelect.value;
        const orientation = orientationSelect.value;

        console.log('Starting professional PDF generation...');

        // Get the HTML content
        const htmlContent = marked.parse(markdownText);
        
        // Create print window with professional styling
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        
        if (!printWindow) {
            throw new Error('Please allow pop-ups for this site to generate PDFs');
        }
        
        // Write complete HTML document with modern, professional CSS
        printWindow.document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Document</title>
    <style>
        /* ==========================================
           PRINT SETTINGS
           ========================================== */
        @media print {
            @page {
                size: ${pageSize} ${orientation};
                margin: 20mm 18mm;
            }
            
            body {
                margin: 0;
                padding: 0;
            }
            
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
            
            a {
                color: #2563eb !important;
                text-decoration: underline !important;
            }
            
            /* Prevent page breaks in inappropriate places */
            h1, h2, h3, h4, h5, h6 {
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
            }
            
            pre, blockquote, table {
                page-break-inside: avoid !important;
            }
            
            img {
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
            }
        }
        
        /* ==========================================
           BASE STYLES
           ========================================== */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.7;
            color: #1a1a1a;
            background: #ffffff;
            max-width: 100%;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        /* ==========================================
           HEADINGS - Modern & Professional
           ========================================== */
        h1 {
            font-size: 28pt;
            font-weight: 800;
            margin: 0 0 24pt 0;
            padding: 0 0 16pt 0;
            color: #111827;
            line-height: 1.2;
            border-bottom: 3pt solid #2563eb;
            letter-spacing: -0.02em;
            page-break-after: avoid;
        }
        
        h2 {
            font-size: 22pt;
            font-weight: 700;
            margin: 28pt 0 16pt 0;
            padding: 0 0 12pt 0;
            color: #1f2937;
            line-height: 1.3;
            border-bottom: 2pt solid #e5e7eb;
            letter-spacing: -0.01em;
            page-break-after: avoid;
        }
        
        h3 {
            font-size: 18pt;
            font-weight: 700;
            margin: 24pt 0 14pt 0;
            color: #374151;
            line-height: 1.3;
            letter-spacing: -0.01em;
            page-break-after: avoid;
        }
        
        h4 {
            font-size: 15pt;
            font-weight: 600;
            margin: 20pt 0 12pt 0;
            color: #4b5563;
            line-height: 1.4;
            page-break-after: avoid;
        }
        
        h5 {
            font-size: 13pt;
            font-weight: 600;
            margin: 18pt 0 10pt 0;
            color: #6b7280;
            line-height: 1.4;
            page-break-after: avoid;
        }
        
        h6 {
            font-size: 11pt;
            font-weight: 600;
            margin: 16pt 0 8pt 0;
            color: #9ca3af;
            line-height: 1.4;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            page-break-after: avoid;
        }
        
        /* ==========================================
           PARAGRAPHS & TEXT
           ========================================== */
        p {
            margin: 0 0 12pt 0;
            color: #374151;
            line-height: 1.7;
            orphans: 3;
            widows: 3;
        }
        
        strong, b {
            font-weight: 700;
            color: #111827;
        }
        
        em, i {
            font-style: italic;
            color: #4b5563;
        }
        
        /* ==========================================
           LISTS - Clean & Organized
           ========================================== */
        ul, ol {
            margin: 0 0 14pt 0;
            padding-left: 28pt;
        }
        
        li {
            margin-bottom: 8pt;
            color: #374151;
            line-height: 1.7;
        }
        
        li:last-child {
            margin-bottom: 0;
        }
        
        ul li {
            list-style-type: disc;
        }
        
        ul ul li {
            list-style-type: circle;
        }
        
        ul ul ul li {
            list-style-type: square;
        }
        
        ol {
            counter-reset: item;
        }
        
        ol li {
            list-style-type: decimal;
        }
        
        /* ==========================================
           CODE BLOCKS - Syntax Highlighted Style
           ========================================== */
        pre {
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            border: 1pt solid #e5e7eb;
            border-left: 4pt solid #3b82f6;
            border-radius: 6pt;
            padding: 14pt 16pt;
            margin: 16pt 0;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Consolas', monospace;
            font-size: 9.5pt;
            line-height: 1.6;
            white-space: pre-wrap;
            word-wrap: break-word;
            color: #1f2937;
            overflow-x: auto;
            page-break-inside: avoid;
            box-shadow: 0 2pt 4pt rgba(0, 0, 0, 0.05);
        }
        
        code {
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Consolas', monospace;
            font-size: 9.5pt;
            background: #f3f4f6;
            padding: 2pt 6pt;
            color: #dc2626;
            border-radius: 3pt;
            border: 1pt solid #e5e7eb;
            font-weight: 500;
        }
        
        pre code {
            background: transparent;
            padding: 0;
            color: #1f2937;
            border: none;
            font-size: 9.5pt;
            font-weight: 400;
        }
        
        /* ==========================================
           TABLES - Modern Professional Design
           ========================================== */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 18pt 0;
            font-size: 10pt;
            background: #ffffff;
            border-radius: 8pt;
            overflow: hidden;
            box-shadow: 0 2pt 8pt rgba(0, 0, 0, 0.08);
            page-break-inside: avoid;
        }
        
        thead {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }
        
        th {
            padding: 12pt 16pt;
            text-align: left;
            color: #ffffff;
            font-weight: 700;
            font-size: 10pt;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border: none;
        }
        
        tbody tr {
            border-bottom: 1pt solid #e5e7eb;
        }
        
        tbody tr:nth-child(even) {
            background: #f9fafb;
        }
        
        tbody tr:hover {
            background: #f3f4f6;
        }
        
        tbody tr:last-child {
            border-bottom: none;
        }
        
        td {
            padding: 12pt 16pt;
            text-align: left;
            color: #374151;
            border: none;
        }
        
        /* ==========================================
           LINKS - Clickable & Styled
           ========================================== */
        a {
            color: #2563eb;
            text-decoration: none;
            font-weight: 500;
            border-bottom: 1pt solid #93c5fd;
            padding-bottom: 1pt;
            transition: all 0.2s ease;
        }
        
        a:hover {
            color: #1d4ed8;
            border-bottom-color: #2563eb;
        }
        
        /* ==========================================
           BLOCKQUOTES - Beautiful Callouts
           ========================================== */
        blockquote {
            position: relative;
            border-left: 4pt solid #3b82f6;
            padding: 14pt 18pt 14pt 22pt;
            margin: 16pt 0;
            background: linear-gradient(to right, #eff6ff 0%, #ffffff 100%);
            color: #1e40af;
            font-style: italic;
            border-radius: 0 6pt 6pt 0;
            box-shadow: 0 2pt 4pt rgba(0, 0, 0, 0.05);
        }
        
        blockquote p {
            color: #1e40af;
            margin-bottom: 8pt;
        }
        
        blockquote p:last-child {
            margin-bottom: 0;
        }
        
        /* ==========================================
           HORIZONTAL RULES
           ========================================== */
        hr {
            border: none;
            height: 2pt;
            background: linear-gradient(to right, transparent, #e5e7eb, transparent);
            margin: 24pt 0;
        }
        
        /* ==========================================
           IMAGES
           ========================================== */
        img {
            max-width: 100%;
            height: auto;
            border-radius: 6pt;
            box-shadow: 0 4pt 12pt rgba(0, 0, 0, 0.1);
            margin: 16pt 0;
            display: block;
        }
        
        /* ==========================================
           TABLE OF CONTENTS - Special Styling
           ========================================== */
        h2:first-of-type + ul,
        h1:first-of-type + ul {
            background: #f9fafb;
            padding: 20pt;
            border-radius: 8pt;
            border: 1pt solid #e5e7eb;
            margin: 20pt 0;
        }
        
        /* Style TOC links specifically */
        ul li a[href^="#"] {
            color: #3b82f6;
            font-weight: 500;
            border-bottom: 1pt dotted #93c5fd;
            padding: 2pt 0;
        }
        
        ul li a[href^="#"]:hover {
            color: #1d4ed8;
            border-bottom-style: solid;
        }
        
        /* ==========================================
           UTILITY CLASSES
           ========================================== */
        .page-break {
            page-break-after: always;
        }
        
        /* ==========================================
           FIRST PAGE SPECIAL STYLING
           ========================================== */
        h1:first-child {
            margin-top: 0;
            padding-top: 0;
        }
    </style>
</head>
<body>
${htmlContent}
<script>
    // Auto-trigger print dialog after content loads
    window.onload = function() {
        // Small delay to ensure fonts and styles are loaded
        setTimeout(function() {
            window.print();
            // Note: Window will close automatically after print dialog is dismissed
            window.onafterprint = function() {
                setTimeout(function() {
                    window.close();
                }, 500);
            };
        }, 800);
    };
<\/script>
</body>
</html>
        `);
        
        printWindow.document.close();
        
        console.log('Professional PDF print window opened');
        showNotification('Print dialog opened! Save as PDF to download.', 'success');

    } catch (error) {
        console.error('PDF generation error:', error);
        showNotification('Error: ' + error.message, 'error');
    } finally {
        // Reset button after a delay
        setTimeout(() => {
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        }, 2000);
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
