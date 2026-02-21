const fs = require('fs');
const path = require('path');

const generateContent = () => {
    let content = '# MarkdownPDF Detailed Stress Test\n\n';
    content += '> This document is designed to test headings, table search, internal links, page breaks, and large document performance.\n\n';

    content += '## Table of Contents\n\n';
    for (let i = 1; i <= 40; i++) {
        // We use a simple ID format that matches our heading generation
        content += `${i}. [Chapter ${i}: Strategic Analysis](#chapter-${i})\n`;
    }
    content += '\n---\n\n';

    for (let i = 1; i <= 40; i++) {
        content += `# Chapter ${i}: Strategic Analysis\n\n`;
        content += `This is section ${i}. You can return to the [Table of Contents](#table-of-contents) at any time.\n\n`;

        content += '## Performance Metrix\n\n';
        content += 'Below is a data table showing the theoretical performance metrics for this specific chapter.\n\n';

        content += '| Metric Name | Current Value | Target Goal | Status |\n';
        content += '| :--- | :--- | :--- | :--- |\n';
        content += `| Rendering Speed | ${50 + i}ms | < 100ms | ✅ |\n`;
        content += `| Memory Load | ${10 + i / 2}MB | < 50MB | ✅ |\n`;
        content += `| Page Depth | Level ${i} | N/A | Active |\n\n`;

        content += '### Implementation Details\n\n';
        content += 'The following code demonstrates how this section would be initialized in a high-performance environment:\n\n';
        content += '```javascript\n';
        content += `function initSection${i}() {\n`;
        content += `  const sectionId = 'chapter-${i}';\n`;
        content += `  console.log(\`Initializing \${sectionId}...\`);\n`;
        content += '  return true;\n';
        content += '}\n';
        content += '```\n\n';

        content += '--- \n\n'; // This triggers a page break in our app
    }

    return content;
};

const outputFile = path.join(process.cwd(), 'STRESS_TEST_40_PAGES.md');
fs.writeFileSync(outputFile, generateContent());
console.log(`Successfully updated stress test file: ${outputFile}`);
