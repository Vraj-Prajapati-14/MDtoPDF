import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function GuidePage() {
    return (
        <main className="min-h-screen flex flex-col">
            <Header />

            <section className="hero">
                <div className="container">
                    <h1 className="hero-title">Complete <span className="gradient-text">Guide</span></h1>
                    <p className="hero-subtitle">Everything you need to know about converting Markdown to PDF</p>
                </div>
            </section>

            <div className="guide-content">
                <article className="guide-section">
                    <h2>Getting Started</h2>
                    <p>MarkdownPDF is a free, browser-based tool that converts Markdown documents to professionally
                        formatted PDF files. No installation, no registration, and completely private.</p>

                    <h3>Quick Start</h3>
                    <ol style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginLeft: '1.5rem' }}>
                        <li>Open the <Link href="/">converter page</Link></li>
                        <li>Type or paste your Markdown content in the left editor</li>
                        <li>See the live preview on the right</li>
                        <li>Customize page size and orientation if needed</li>
                        <li>Click "Download PDF" to save your document</li>
                    </ol>

                    <div className="tip-box">
                        <strong>💡 Pro Tip:</strong> Your work is automatically saved in your browser. You can close the tab
                        and come back later without losing your progress!
                    </div>
                </article>

                <article className="guide-section">
                    <h2>Markdown Syntax Guide</h2>
                    <h3>Headings</h3>
                    <p>Create headings using the # symbol. More # symbols = smaller heading.</p>
                    <div className="code-example">
                        # Heading 1<br />
                        ## Heading 2<br />
                        ### Heading 3
                    </div>

                    <h3>Text Formatting</h3>
                    <div className="code-example">
                        **Bold text**<br />
                        *Italic text*<br />
                        ***Bold and italic***<br />
                        ~~Strikethrough~~<br />
                        `Inline code`
                    </div>

                    <h3>Lists</h3>
                    <p>Create unordered lists with -, *, or +. Create ordered lists with numbers.</p>
                    <div className="code-example">
                        - Item 1<br />
                        - Item 2<br />
                        1. First item<br />
                        2. Second item
                    </div>

                    <h3>Links and Images</h3>
                    <div className="code-example">
                        [Link text](https://example.com)<br />
                        ![Alt text](image-url.jpg)
                    </div>

                    <h3>Code Blocks</h3>
                    <p>Use triple backticks for code blocks.</p>
                    <div className="code-example" style={{ whiteSpace: 'pre' }}>
                        {`\`\`\`javascript
function greet(name) {
    console.log(\`Hello, \${name}!\`);
}
\`\`\``}
                    </div>
                </article>

                <article className="guide-section">
                    <h2>Best Practices</h2>
                    <h3>1. Use Proper Heading Hierarchy</h3>
                    <p>Start with H1 for the title, then use H2 for main sections, H3 for subsections, etc.</p>

                    <h3>2. Preview Before Downloading</h3>
                    <p>Always check the live preview to ensure your document looks exactly how you want it.</p>
                </article>
            </div>

            <Footer />
        </main>
    );
}
