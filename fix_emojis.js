const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'Converter.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace mojibake emoji with correct Unicode
// Each wrong string maps to the correct emoji
const replacements = [
    // Technical Report: 📄 (file icon)
    [/icon:\s*'[^']*Technical[^']*'/g, null], // marker
];

// Read lines to find the exact broken strings
const lines = content.split('\n');
const fixedLines = lines.map(line => {
    if (!line.includes("icon:")) return line;

    // Replace any non-ASCII garbled icon strings with correct emojis
    if (line.includes('icon:') && lines.indexOf(line) !== -1) {
        const lineIdx = lines.indexOf(line);
        // Find which template this belongs to by looking at nearby lines
    }

    // Direct byte replacement: the broken strings contain specific multi-byte sequences
    // ðŸ"„ = 📄 (U+1F4C4 document)
    if (line.includes('\u00f0\u009f\u0093\u00a0') || line.includes('ðŸ"„')) {
        return line.replace(/ðŸ"„/g, '📄').replace(/\u00f0\u009f\u0093\u00a4/g, '📄');
    }
    return line;
});

// Simpler: just do string replacements on the raw content buffer
// The file has Windows-1252 interpreted UTF-8 bytes: 
// U+1F4C4 (📄) was stored as UTF-8 bytes F0 9F 93 84, read as latin1 -> ðŸ"„
// We need to find and replace these specific sequences

// Use regex on the raw content
const fixes = [
    [/icon: 'ð[^']{1,8}'(?=.*\n.*\n.*Technical Report|Technical Report(?:.|[\r\n]){0,200}icon)/s, "icon: '📄'"],
];

// Simple line-by-line approach using line numbers we know
const lineArray = content.split(/\r?\n/);

// From grep output: lines 360, 365, 370, 375, 380 have the broken icons
// Line 360: Technical Report icon -> 📄
// Line 365: Meeting Notes icon -> 📝  
// Line 370: README icon -> 📦
// Line 375: Research Paper icon -> 🔬
// Line 380: Project Proposal icon -> 🚀

const emojiMap = {
    359: '📄',  // 0-indexed = line 360
    364: '📝',  // line 365
    369: '📦',  // line 370
    374: '🔬',  // line 375
    379: '🚀',  // line 380
};

const fixedLineArray = lineArray.map((line, idx) => {
    const emoji = emojiMap[idx];
    if (emoji && line.includes("icon:")) {
        // Replace everything between the quotes after icon:
        return line.replace(/icon:\s*'[^']*'/, `icon: '${emoji}'`);
    }
    return line;
});

const fixed = fixedLineArray.join('\n');
fs.writeFileSync(filePath, fixed, 'utf8');
console.log('Done! Fixed emoji encodings.');

// Verify
const verify = fs.readFileSync(filePath, 'utf8');
const verifyLines = verify.split('\n');
[359, 364, 369, 374, 379].forEach(i => {
    console.log(`Line ${i + 1}: ${verifyLines[i].trim()}`);
});
