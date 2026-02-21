# 🚀 Quick Start Guide - Markdown to PDF Converter

## What's New? ✨

Your Markdown to PDF converter has been **completely rewritten** with major improvements:

### ✅ Fixed Issues:
- **No more blank PDFs** - Reliable PDF generation using jsPDF + html2canvas
- **Removed confusing options** - Single "Download PDF" button (Print/Save removed)
- **Better formatting** - Professional typography and layout

### 🎉 New Features:
- **Mermaid Diagrams** - Full support for flowcharts, sequence diagrams, class diagrams, etc.
- **Image Embedding** - Properly embeds images in PDFs
- **Page Breaks** - Use `---` for manual page breaks
- **Professional Styling** - Clean, readable PDFs with proper formatting

## 🏃 Quick Test

### 1. Start the Development Server

```bash
npm run dev
```

Open http://localhost:3000

### 2. Try the Test File

1. Click **"Upload .md File"**
2. Select `TEST_COMPLETE.md` from the project root
3. See the preview with:
   - Formatted text
   - Code blocks
   - **Mermaid diagrams** (flowchart, sequence, class)
   - Tables
   - Images
4. Click **"Download PDF"**
5. Open the downloaded PDF - everything should be properly formatted!

## 📝 Creating Your First Document

### Example with Mermaid:

```markdown
# My Project Documentation

## Overview
This project demonstrates **Markdown to PDF** conversion.

## Architecture

\`\`\`mermaid
graph TD
    A[User Input] --> B[Markdown Parser]
    B --> C[HTML Renderer]
    C --> D[PDF Generator]
    D --> E[Download]
\`\`\`

## Features
- ✅ Real-time preview
- ✅ Mermaid diagrams
- ✅ Professional formatting

---

## Next Section
This appears on a new page!
```

### Steps:
1. Paste the above markdown in the editor
2. Watch the preview update in real-time
3. See the Mermaid diagram render automatically
4. Click "Download PDF"
5. Check the PDF - diagram is converted to an image!

## 🎨 Mermaid Diagram Examples

### Flowchart
````markdown
\`\`\`mermaid
graph LR
    A[Start] --> B[Process]
    B --> C{Decision}
    C -->|Yes| D[Success]
    C -->|No| E[Retry]
\`\`\`
````

### Sequence Diagram
````markdown
\`\`\`mermaid
sequenceDiagram
    User->>App: Click Download
    App->>Server: Generate PDF
    Server-->>App: PDF Ready
    App-->>User: Download File
\`\`\`
````

### Class Diagram
````markdown
\`\`\`mermaid
classDiagram
    class Document {
        +String title
        +String content
        +generatePDF()
    }
\`\`\`
````

## 🔧 Configuration Options

### Page Size
- **A4** (default) - 210mm × 297mm
- **Letter** - 8.5in × 11in
- **Legal** - 8.5in × 14in
- **A3** - 297mm × 420mm

### Orientation
- **Portrait** (default) - Vertical
- **Landscape** - Horizontal

## 💡 Tips & Tricks

### 1. Page Breaks
Use three dashes for a page break:
```markdown
Content on page 1

---

Content on page 2
```

### 2. Internal Links
Create a table of contents:
```markdown
## Table of Contents
- [Section 1](#section-1)
- [Section 2](#section-2)

## Section 1
Content here...

## Section 2
More content...
```

### 3. Images
Use public image URLs:
```markdown
![Description](https://example.com/image.png)
```

### 4. Code Blocks
Specify the language for syntax highlighting:
````markdown
\`\`\`javascript
function hello() {
    console.log("Hello!");
}
\`\`\`
````

### 5. Tables
Use proper markdown table syntax:
```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

## 🐛 Troubleshooting

### PDF is taking a long time to generate
- **Normal** for documents with many images/diagrams
- Wait for the "Generating..." message to complete

### Mermaid diagram shows an error
- Check your Mermaid syntax at https://mermaid.live
- Ensure the code block is marked as `mermaid`

### Images not showing in PDF
- Use publicly accessible URLs
- Check if images load in the preview first
- Some sites block image embedding (CORS)

## 📚 More Examples

Check these files in your project:
- `TEST_COMPLETE.md` - Full feature demonstration
- `STRESS_TEST_40_PAGES.md` - Large document test
- `README.md` - Complete documentation
- `CHANGES.md` - Technical details of changes

## 🎯 Next Steps

1. ✅ Test with `TEST_COMPLETE.md`
2. ✅ Create your own markdown document
3. ✅ Try different Mermaid diagrams
4. ✅ Experiment with page sizes and orientations
5. ✅ Share your PDFs!

## 📖 Full Documentation

For complete documentation, see `README.md` in the project root.

---

**Happy converting! 🎉**

If you encounter any issues, check the browser console for error messages.
