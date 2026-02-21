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
 * Get suggested filename from markdown content
 */
function getSuggestedFilename() {
    let defaultName = 'markdown-document';
    const firstHeading = markdownInput.value.match(/^#\s+(.+)$/m);
    if (firstHeading && firstHeading[1]) {
        defaultName = firstHeading[1]
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 50) || 'markdown-document';
    }
    return defaultName;
}

/**
 * Show custom filename dialog
 */
function showFilenameDialog() {
    return new Promise((resolve) => {
        const backdrop = document.createElement('div');
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.2s ease;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 90%;
            animation: slideUp 0.3s ease;
        `;

        const defaultName = getSuggestedFilename();

        modal.innerHTML = `
            <h2 style="margin: 0 0 1rem 0; color: #111827; font-size: 1.5rem; font-weight: 700;">
                💾 Save PDF As
            </h2>
            <p style="margin: 0 0 1.5rem 0; color: #6b7280; font-size: 0.95rem;">
                Enter a filename for your PDF document
            </p>
            <div style="margin-bottom: 1.5rem;">
                <input 
                    type="text" 
                    id="filename-input" 
                    value="${defaultName}"
                    style="
                        width: 100%;
                        padding: 0.75rem 1rem;
                        border: 2px solid #e5e7eb;
                        border-radius: 0.5rem;
                        font-size: 1rem;
                        font-family: inherit;
                        transition: all 0.2s;
                        outline: none;
                    "
                    placeholder="Enter filename..."
                />
                <div style="margin-top: 0.5rem; color: #9ca3af; font-size: 0.875rem;">
                    📄 .pdf extension will be added automatically
                </div>
            </div>
            <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
                <button 
                    id="cancel-btn"
                    style="
                        padding: 0.75rem 1.5rem;
                        background: #f3f4f6;
                        color: #374151;
                        border: none;
                        border-radius: 0.5rem;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                        font-family: inherit;
                    "
                >
                    Cancel
                </button>
                <button 
                    id="save-btn"
                    style="
                        padding: 0.75rem 1.5rem;
                        background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
                        color: white;
                        border: none;
                        border-radius: 0.5rem;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                        font-family: inherit;
                    "
                >
                    📥 Download PDF
                </button>
            </div>
        `;

        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);

        const input = modal.querySelector('#filename-input');
        const saveBtn = modal.querySelector('#save-btn');
        const cancelBtn = modal.querySelector('#cancel-btn');

        setTimeout(() => {
            input.focus();
            input.select();
        }, 100);

        saveBtn.onmouseenter = () => {
            saveBtn.style.transform = 'translateY(-2px)';
            saveBtn.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.3)';
        };
        saveBtn.onmouseleave = () => {
            saveBtn.style.transform = '';
            saveBtn.style.boxShadow = '';
        };

        cancelBtn.onmouseenter = () => cancelBtn.style.background = '#e5e7eb';
        cancelBtn.onmouseleave = () => cancelBtn.style.background = '#f3f4f6';

        input.onfocus = () => {
            input.style.borderColor = '#667EEA';
            input.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
        };
        input.onblur = () => {
            input.style.borderColor = '#e5e7eb';
            input.style.boxShadow = 'none';
        };

        const handleSave = () => {
            let filename = input.value.trim();
            if (!filename) filename = defaultName;
            filename = filename.replace(/\.pdf$/i, '').replace(/[^a-z0-9_\-\s]/gi, '-');
            backdrop.remove();
            resolve(filename);
        };

        const handleCancel = () => {
            backdrop.remove();
            resolve(null);
        };

        saveBtn.onclick = handleSave;
        cancelBtn.onclick = handleCancel;
        backdrop.onclick = (e) => {
            if (e.target === backdrop) handleCancel();
        };

        input.onkeydown = (e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
        };
    });
}

/**
 * Download PDF - Fixed and working
 */
/**
 * Download PDF - Fixed and working
 */
async function downloadPDF() {
    const markdownText = markdownInput.value;
    if (!markdownText.trim()) {
        showNotification('Please add some content before downloading', 'warning');
        return;
    }

    // Show filename dialog
    const filename = await showFilenameDialog() || getSuggestedFilename();

    // Show loading state
    const originalText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="spinner">
            <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
            <path d="M10 2 A8 8 0 0 1 18 10" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
        </svg>
        Generating...
    `;
    downloadBtn.disabled = true;

    try {
        const pageSize = pageSizeSelect.value;
        const orientation = orientationSelect.value;

        // Create a temporary container for PDF generation
        const element = document.createElement('div');
        element.className = 'pdf-container';
        element.style.padding = '40px';
        element.style.backgroundColor = '#ffffff';
        element.style.color = '#333';
        element.style.fontFamily = "'Inter', sans-serif";

        // Inject the content with print-specific styles
        element.innerHTML = `
            <style>
                .pdf-body { font-size: 14px; line-height: 1.6; color: #2a2a2a; }
                .pdf-body h1 { font-size: 24pt; color: #1a1a1a; border-bottom: 2px solid #667EEA; padding-bottom: 8px; margin-bottom: 20px; font-weight: 700; }
                .pdf-body h2 { font-size: 18pt; color: #1a1a1a; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 25px; font-weight: 600; }
                .pdf-body code { background: #f4f4f4; padding: 2px 5px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
                .pdf-body pre { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #e1e1e1; overflow: hidden; }
                .pdf-body table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .pdf-body th, .pdf-body td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                .pdf-body th { background: #f5f5f5; font-weight: 600; }
                .pdf-body blockquote { border-left: 4px solid #667EEA; background: #f9f9f9; padding: 10px 20px; margin: 15px 0; color: #555; }
                .pdf-body img { max-width: 100%; height: auto; border-radius: 8px; }
            </style>
            <div class="pdf-body">
                ${previewContent.innerHTML}
            </div>
        `;

        const opt = {
            margin: 10,
            filename: `${filename}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: pageSize, orientation: orientation },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        // Use html2pdf which is already loaded in index.html
        await html2pdf().set(opt).from(element).save();

        showNotification('✅ PDF downloaded successfully!', 'success');
    } catch (error) {
        console.error('PDF generation error:', error);
        showNotification('Failed to generate PDF. Please try again.', 'error');
    } finally {
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
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

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
        maxWidth: '350px'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3500);
}

// ===================================
// Keyboard Shortcuts
// ===================================
function handleKeyboardShortcuts(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        downloadPDF();
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearEditor();
    }

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
        if (savedPageSize) pageSizeSelect.value = savedPageSize;
        if (savedOrientation) orientationSelect.value = savedOrientation;
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
// Add CSS animations
// ===================================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    .spinner {
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// ===================================
// Initialize
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    updatePreview();

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

### Example Table

| Feature | Status |
|---------|--------|
| Markdown Support | ✅ |
| PDF Export | ✅ |
| Syntax Highlighting | ✅ |

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
