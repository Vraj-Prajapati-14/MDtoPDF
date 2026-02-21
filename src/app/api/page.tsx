import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ApiPage() {
    return (
        <main className="min-h-screen flex flex-col">
            <Header />

            <section className="hero">
                <div className="container">
                    <h1 className="hero-title">API <span className="gradient-text">Documentation</span></h1>
                    <p className="hero-subtitle">Integrate Markdown to PDF conversion into your own applications</p>
                </div>
            </section>

            <div className="api-content">
                <div className="note-box">
                    <h3 style={{ color: '#3b82f6', margin: '0 0 var(--spacing-sm) 0' }}>📘 Client-Side Library</h3>
                    <p style={{ margin: 0, color: 'var(--text-primary)' }}>
                        MarkdownPDF operates entirely in the browser. Below is documentation for integrating similar functionality into your own apps using JavaScript.
                    </p>
                </div>

                <article className="api-section">
                    <h2>Getting Started</h2>
                    <p>To integrate Markdown to PDF conversion, you'll need the following libraries:</p>

                    <div className="code-block">
                        <pre>{`<!-- Markdown Parser -->
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

<!-- PDF Generator -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>`}</pre>
                    </div>

                    <h3>Basic Usage</h3>
                    <div className="code-block">
                        <pre>{`const markdownText = '# Hello World\\n\\nThis is **bold** text.';
const html = marked.parse(markdownText);

const element = document.createElement('div');
element.innerHTML = html;

html2pdf()
    .set({
        margin: 10,
        filename: 'document.pdf',
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    })
    .from(element)
    .save();`}</pre>
                    </div>
                </article>

                <article className="api-section">
                    <h2>Configuration Options</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Option</th>
                                <th>Type</th>
                                <th>Default</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>margin</code></td>
                                <td>number</td>
                                <td>10</td>
                                <td>Page margins in mm</td>
                            </tr>
                            <tr>
                                <td><code>filename</code></td>
                                <td>string</td>
                                <td>'doc.pdf'</td>
                                <td>Output filename</td>
                            </tr>
                            <tr>
                                <td><code>jsPDF.format</code></td>
                                <td>string</td>
                                <td>'a4'</td>
                                <td>Page format (a4, letter, etc)</td>
                            </tr>
                        </tbody>
                    </table>
                </article>

                <div className="warning-box">
                    <h3 style={{ color: '#f59e0b', margin: '0 0 var(--spacing-sm) 0' }}>⚠️ Important Notes</h3>
                    <ul style={{ margin: 0, color: 'var(--text-primary)' }}>
                        <li>All processing happens client-side in the browser.</li>
                        <li>Large documents may take longer to process.</li>
                        <li>Images must be CORS-enabled or base64 encoded.</li>
                    </ul>
                </div>
            </div>

            <Footer />
        </main>
    );
}
