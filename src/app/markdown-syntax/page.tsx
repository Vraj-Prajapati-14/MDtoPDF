import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SyntaxPage() {
    return (
        <main className="min-h-screen flex flex-col">
            <Header />

            <section className="hero">
                <div className="container">
                    <h1 className="hero-title">Markdown <span className="gradient-text">Syntax Reference</span></h1>
                    <p className="hero-subtitle">Complete guide to Markdown formatting with examples</p>
                </div>
            </section>

            <div className="syntax-content">
                <article className="syntax-section">
                    <h2>Headings</h2>
                    <div className="syntax-grid">
                        <div className="syntax-example">
                            <h4>Markdown</h4>
                            <pre>{`# Heading 1
## Heading 2
### Heading 3
#### Heading 4`}</pre>
                        </div>
                        <div className="syntax-result">
                            <h4>Result</h4>
                            <h1 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>Heading 1</h1>
                            <h2 style={{ fontSize: '1.25rem', margin: '0.5rem 0' }}>Heading 2</h2>
                            <h3 style={{ fontSize: '1.1rem', margin: '0.5rem 0' }}>Heading 3</h3>
                        </div>
                    </div>
                </article>

                <article className="syntax-section">
                    <h2>Text Formatting</h2>
                    <div className="syntax-grid">
                        <div className="syntax-example">
                            <h4>Markdown</h4>
                            <pre>{`**Bold text**
*Italic text*
***Bold and italic***
~~Strikethrough~~
\`Inline code\``}</pre>
                        </div>
                        <div className="syntax-result">
                            <h4>Result</h4>
                            <p><strong>Bold text</strong></p>
                            <p><em>Italic text</em></p>
                            <p><strong><em>Bold and italic</em></strong></p>
                            <p><del>Strikethrough</del></p>
                            <p><code>Inline code</code></p>
                        </div>
                    </div>
                </article>

                <article className="syntax-section">
                    <h2>Lists</h2>
                    <div className="syntax-grid">
                        <div className="syntax-example">
                            <h4>Markdown</h4>
                            <pre>{`- Item 1
- Item 2
  - Nested item
1. First item
2. Second item`}</pre>
                        </div>
                        <div className="syntax-result">
                            <h4>Result</h4>
                            <ul style={{ marginLeft: '1.2rem' }}>
                                <li>Item 1</li>
                                <li>Item 2
                                    <ul style={{ marginLeft: '1.2rem' }}><li>Nested item</li></ul>
                                </li>
                            </ul>
                            <ol style={{ marginLeft: '1.2rem', marginTop: '0.5rem' }}>
                                <li>First item</li>
                                <li>Second item</li>
                            </ol>
                        </div>
                    </div>
                </article>

                <article className="syntax-section">
                    <h2>Tables</h2>
                    <div className="syntax-example">
                        <h4>Markdown</h4>
                        <pre>{`| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |`}</pre>
                    </div>
                    <div className="syntax-result" style={{ marginTop: 'var(--spacing-md)' }}>
                        <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #ddd' }}>
                            <thead>
                                <tr style={{ background: '#f5f5f5' }}>
                                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Header 1</th>
                                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Header 2</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>Cell 1</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>Cell 2</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </article>
            </div>

            <Footer />
        </main>
    );
}
