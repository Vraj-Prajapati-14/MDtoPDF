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
 * Download PDF - Canvas slicing approach (capture once, slice for pages)
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

    let cloneDiv = null;

    try {
        const pageSize = pageSizeSelect.value;
        const orientation = orientationSelect.value;

        console.log('Starting PDF generation with canvas slicing...');

        // Get the HTML content
        const htmlContent = marked.parse(markdownText);
        
        // Create a clean clone div
        cloneDiv = document.createElement('div');
        cloneDiv.innerHTML = htmlContent;
        cloneDiv.id = 'pdf-render-clone';
        
        // Apply comprehensive inline styles
        cloneDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 800px;
            padding: 40px;
            background: white;
            color: black;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            z-index: 999999;
            box-sizing: border-box;
        `;
        
        // Apply styles to all child elements
        const applyInlineStyles = (element) => {
            const tag = element.tagName;
            const styleMap = {
                'H1': 'font-size:28px;font-weight:700;margin:24px 0 16px 0;padding-bottom:8px;border-bottom:2px solid #333;color:#000;',
                'H2': 'font-size:24px;font-weight:700;margin:20px 0 12px 0;padding-bottom:6px;border-bottom:1px solid #666;color:#000;',
                'H3': 'font-size:20px;font-weight:700;margin:16px 0 10px 0;color:#000;',
                'H4': 'font-size:18px;font-weight:700;margin:14px 0 8px 0;color:#000;',
                'H5': 'font-size:16px;font-weight:700;margin:12px 0 6px 0;color:#000;',
                'H6': 'font-size:14px;font-weight:700;margin:10px 0 6px 0;color:#000;',
                'P': 'margin:0 0 12px 0;color:#000;line-height:1.6;',
                'UL': 'margin:0 0 12px 0;padding-left:30px;color:#000;',
                'OL': 'margin:0 0 12px 0;padding-left:30px;color:#000;',
                'LI': 'margin-bottom:6px;color:#000;',
                'PRE': 'background:#f5f5f5;border:1px solid #ddd;padding:12px;margin:12px 0;font-family:Courier,monospace;font-size:12px;white-space:pre-wrap;color:#000;',
                'CODE': 'font-family:Courier,monospace;font-size:12px;background:#f5f5f5;padding:2px 6px;color:#000;',
                'A': 'color:#0066cc;text-decoration:underline;',
                'STRONG': 'font-weight:700;color:#000;',
                'EM': 'font-style:italic;color:#000;',
                'TABLE': 'width:100%;border-collapse:collapse;margin:16px 0;font-size:13px;',
                'TH': 'border:1px solid #ccc;padding:8px 12px;text-align:left;color:#000;background:#e6e6e6;font-weight:700;',
                'TD': 'border:1px solid #ccc;padding:8px 12px;text-align:left;color:#000;',
                'BLOCKQUOTE': 'border-left:4px solid #666;padding:10px 10px 10px 16px;margin:12px 0;color:#555;font-style:italic;background:#fafafa;',
                'HR': 'border:none;border-top:1px solid #b4b4b4;margin:20px 0;'
            };
            
            if (styleMap[tag]) {
                element.style.cssText = (element.style.cssText || '') + styleMap[tag];
            }
            
            // Recursively apply to children
            Array.from(element.children).forEach(child => applyInlineStyles(child));
        };
        
        // Apply styles
        applyInlineStyles(cloneDiv);
        
        // Special handling for PRE CODE
        cloneDiv.querySelectorAll('pre code').forEach(code => {
            code.style.cssText = 'background:none;padding:0;color:#000;font-family:Courier,monospace;';
        });
        
        // Append to body
        document.body.appendChild(cloneDiv);
        
        const totalHeight = cloneDiv.scrollHeight;
        const totalWidth = cloneDiv.scrollWidth;
        
        console.log('Clone appended, dimensions:', totalWidth, 'x', totalHeight);
        
        // Wait for fonts and layout
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('Capturing entire document...');
        
        // Capture the ENTIRE content once with moderate scale
        const fullCanvas = await html2canvas(cloneDiv, {
            scale: 1.2,  // Moderate scale
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            width: totalWidth,
            height: totalHeight,
            windowWidth: totalWidth,
            windowHeight: totalHeight,
            scrollX: 0,
            scrollY: 0
        });
        
        console.log('Full canvas created:', fullCanvas.width, 'x', fullCanvas.height);
        
        // Create PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: pageSize,
            compress: true
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const contentWidth = pdfWidth - (2 * margin);
        const contentHeight = pdfHeight - (2 * margin);
        
        // Calculate dimensions
        const pdfWidthPx = (contentWidth / 25.4) * 96;  // Convert mm to pixels (96 DPI)
        const pdfHeightPx = (contentHeight / 25.4) * 96;
        
        // Scale factor from canvas to PDF
        const scale = fullCanvas.width / pdfWidthPx;
        const pageHeightInCanvasPx = pdfHeightPx * scale;
        
        console.log('Page height in canvas pixels:', pageHeightInCanvasPx);
        console.log('Total pages needed:', Math.ceil(fullCanvas.height / pageHeightInCanvasPx));
        
        // Slice the canvas and create pages
        let currentY = 0;
        let pageCount = 0;
        
        while (currentY < fullCanvas.height) {
            if (pageCount > 0) {
                pdf.addPage();
            }
            
            const sliceHeight = Math.min(pageHeightInCanvasPx, fullCanvas.height - currentY);
            
            console.log(`Creating page ${pageCount + 1}: slicing from y=${currentY} height=${sliceHeight}`);
            
            // Create a new canvas for this slice
            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = fullCanvas.width;
            sliceCanvas.height = sliceHeight;
            
            const sliceCtx = sliceCanvas.getContext('2d');
            
            // Draw the slice from the full canvas
            sliceCtx.drawImage(
                fullCanvas,
                0, currentY,  // Source x, y
                fullCanvas.width, sliceHeight,  // Source width, height
                0, 0,  // Destination x, y
                fullCanvas.width, sliceHeight  // Destination width, height
            );
            
            // Convert slice to image
            const imgData = sliceCanvas.toDataURL('image/png', 0.92);
            
            // Add to PDF
            const imgHeightMM = (sliceHeight / scale / 96) * 25.4;  // Convert back to mm
            
            pdf.addImage(
                imgData,
                'PNG',
                margin,
                margin,
                contentWidth,
                Math.min(imgHeightMM, contentHeight),
                undefined,
                'FAST'
            );
            
            console.log(`Page ${pageCount + 1} added`);
            
            pageCount++;
            currentY += sliceHeight;
            
            // Safety limit
            if (pageCount > 500) {
                console.warn('Page limit reached');
                break;
            }
        }

        console.log('PDF created with', pageCount, 'page(s)');

        pdf.save('markdown-document.pdf');
        showNotification('PDF downloaded successfully!', 'success');

    } catch (error) {
        console.error('PDF generation error:', error);
        showNotification('Error: ' + error.message, 'error');
    } finally {
        // Clean up
        if (cloneDiv && cloneDiv.parentNode) {
            document.body.removeChild(cloneDiv);
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
