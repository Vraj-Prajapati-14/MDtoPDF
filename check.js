const fs = require('fs');
const c = fs.readFileSync('src/components/Converter.tsx', 'utf8');

const alertCount = (c.match(/alert\(/g) || []).length;
console.log('alert() calls remaining:', alertCount);
console.log('toast.warning present:', c.includes('toast.warning'));
console.log('toast.error present:', c.includes('toast.error'));
console.log('td forced white bg:', c.includes('background-color: #ffffff !important'));
console.log('preview uses minHeight (JSX):', c.includes('minHeight: `${previewHeight}mm`'));
console.log('preview still uses height (JSX):', c.includes('height: `${previewHeight}mm`'));
console.log('pdf-preview min-height:100% still present:', c.includes('min-height: 100%'));
console.log('previewPageRef present:', c.includes('previewPageRef'));
