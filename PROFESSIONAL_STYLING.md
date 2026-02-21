# Professional PDF Styling Guide

## 🎨 What's New in Your PDFs

Your Markdown to PDF converter now generates **publication-quality** PDFs with professional styling!

## ✨ Professional Features

### 1. **Typography**
- **Font Family**: Inter (modern, professional sans-serif)
- **Code Font**: JetBrains Mono (optimized for readability)
- **Font Sizes**:
  - H1: 28pt (bold, with blue underline)
  - H2: 20pt (semi-bold, with gray underline)
  - H3: 16pt (semi-bold)
  - H4: 14pt (semi-bold)
  - Body: 11pt (comfortable reading size)
  - Code: 9.5pt (monospace)

### 2. **Margins & Layout**
- **Top/Bottom Margins**: 25mm (professional spacing)
- **Left/Right Margins**: 20mm (optimal for binding)
- **Line Height**: 1.7 (excellent readability)
- **Letter Spacing**: Optimized for headings

### 3. **Color Scheme**
- **Headings**: Dark slate colors (#0f172a, #1e293b, #334155)
- **Body Text**: Neutral dark (#334155)
- **Links**: Professional blue (#2563eb) with subtle underline
- **Code**: Red accent (#dc2626) on light gray background
- **Tables**: Blue gradient headers (#3b82f6 to #2563eb)

### 4. **Visual Elements**

#### Headings
- **H1**: 3pt blue bottom border (#3b82f6)
- **H2**: 2pt gray bottom border (#e2e8f0)
- **All headings**: Page-break-after: avoid (never orphaned)

#### Code Blocks
- **Background**: Subtle gradient (light blue-gray)
- **Border**: 1pt gray with 4pt blue left accent
- **Shadow**: Soft drop shadow for depth
- **Border Radius**: 6px (modern, rounded corners)

#### Tables
- **Headers**: Blue gradient background with white text
- **Rows**: Alternating light gray (#f8fafc) for even rows
- **Borders**: Clean 1pt borders
- **Shadow**: Subtle shadow for elevation
- **Border Radius**: 8px (rounded corners)

#### Blockquotes
- **Left Border**: 4pt blue accent
- **Background**: Gradient from light blue to white
- **Style**: Italic text
- **Shadow**: Very subtle for depth

#### Images
- **Sizing**: Max-width 100%, auto height
- **Margin**: 20pt top/bottom, centered
- **Border Radius**: 8px (rounded corners)
- **Shadow**: Medium drop shadow

#### Mermaid Diagrams
- **Container**: Light gradient background
- **Border**: 1pt gray border
- **Padding**: 20pt all around
- **Shadow**: Soft shadow for elevation
- **Alignment**: Centered

### 5. **Page Break Intelligence**

#### Automatic Prevention:
- **Headings**: Never break after headings (orphan prevention)
- **Tables**: Keep entire table on one page
- **Code Blocks**: Keep entire block on one page
- **Blockquotes**: Keep entire quote on one page
- **Images**: Keep entire image on one page
- **Mermaid Diagrams**: Keep entire diagram on one page

#### Manual Control:
- **Horizontal Rule (`---`)**: Forces a page break

#### Orphan/Widow Control:
- Minimum 3 lines at top/bottom of pages
- Headings stay with following content

### 6. **Quality Settings**
- **Canvas Scale**: 2.5x (high resolution)
- **Image Quality**: 98% JPEG (near-lossless)
- **PDF Compression**: Enabled
- **Font Rendering**: Optimized with antialiasing

## 📊 Visual Comparison

### Before (Basic):
```
Plain black text
Times New Roman font
No margins
Simple borders
No shadows
Basic layout
```

### After (Professional):
```
✓ Inter font family (modern)
✓ Professional color palette
✓ 25mm/20mm margins
✓ Gradient backgrounds
✓ Drop shadows
✓ Rounded corners
✓ Smart page breaks
✓ Publication-quality layout
```

## 🎯 Example Styling

### Heading Hierarchy
```
# Main Title (28pt, blue underline, bold)
## Section Title (20pt, gray underline, semi-bold)
### Subsection (16pt, semi-bold)
#### Minor Heading (14pt, semi-bold)
```

### Code Block
```javascript
// Gradient background
// Blue left accent border
// Soft shadow
// Rounded corners
function example() {
    return "Beautiful code!";
}
```

### Table
```
┌─────────────────────────────────┐
│ Blue Gradient Header (white)   │
├─────────────────────────────────┤
│ Row 1 (white background)        │
│ Row 2 (light gray background)   │
│ Row 3 (white background)        │
└─────────────────────────────────┘
```

### Blockquote
```
│ "This is a professional quote"
│ - Italic text
│ - Blue left border
│ - Gradient background
│ - Soft shadow
```

## 🚀 How to Use

1. **Write your markdown** as usual
2. **Click "Download PDF"**
3. **Get a professional PDF** with all styling applied automatically!

## 💡 Pro Tips

### For Best Results:

1. **Use Proper Heading Hierarchy**
   ```markdown
   # Document Title (only one H1)
   ## Main Sections (H2)
   ### Subsections (H3)
   #### Details (H4)
   ```

2. **Add Page Breaks Strategically**
   ```markdown
   ## End of Section
   
   ---
   
   ## New Section (starts on new page)
   ```

3. **Use Tables for Data**
   ```markdown
   | Column 1 | Column 2 |
   |----------|----------|
   | Data     | Data     |
   ```

4. **Include Mermaid Diagrams**
   ````markdown
   ```mermaid
   graph TD
       A[Start] --> B[End]
   ```
   ````

5. **Add Blockquotes for Emphasis**
   ```markdown
   > Important note or quote
   ```

## 📐 Technical Specifications

### Page Sizes Supported:
- **A4**: 210mm × 297mm
- **Letter**: 215.9mm × 279.4mm
- **Legal**: 215.9mm × 355.6mm
- **A3**: 297mm × 420mm

### Margins:
- **Top**: 25mm
- **Right**: 20mm
- **Bottom**: 25mm
- **Left**: 20mm

### Font Sizes:
- **H1**: 28pt
- **H2**: 20pt
- **H3**: 16pt
- **H4**: 14pt
- **H5/H6**: 12pt
- **Body**: 11pt
- **Code**: 9.5-10pt

### Colors:
- **Primary Blue**: #3b82f6
- **Dark Blue**: #2563eb
- **Dark Text**: #0f172a - #334155
- **Light Gray**: #f8fafc
- **Border Gray**: #cbd5e1

## 🎨 Design Philosophy

The new PDF styling follows these principles:

1. **Readability First**: Comfortable font sizes and line heights
2. **Visual Hierarchy**: Clear distinction between heading levels
3. **Professional Appearance**: Modern colors and subtle effects
4. **Print-Ready**: Proper margins and page breaks
5. **Consistency**: Uniform styling throughout
6. **Accessibility**: High contrast and clear typography

## 🔍 Quality Checklist

Your PDFs now have:
- ✅ Professional typography (Inter font)
- ✅ Proper margins (25mm/20mm)
- ✅ Smart page breaks
- ✅ Gradient backgrounds
- ✅ Drop shadows
- ✅ Rounded corners
- ✅ High resolution (2.5x scale)
- ✅ Color-coded elements
- ✅ Orphan/widow prevention
- ✅ Publication-quality output

---

**Your PDFs are now ready for professional use!** 🎉

Try downloading `TEST_COMPLETE.md` or `EXAMPLE.md` to see the beautiful results!
