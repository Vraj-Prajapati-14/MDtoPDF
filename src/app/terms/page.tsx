import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function TermsPage() {
    return (
        <main className="min-h-screen flex flex-col">
            <Header />

            <section className="hero">
                <div className="container">
                    <h1 className="hero-title">Terms of <span className="gradient-text">Service</span></h1>
                    <p className="hero-subtitle">Please read these terms carefully before using our service</p>
                    <p style={{ color: 'var(--text-tertiary)', marginTop: 'var(--spacing-sm)' }}>Last updated: Jan 06, 2026</p>
                </div>
            </section>

            <div className="legal-content">
                <article className="legal-section">
                    <h2>1. Acceptance of Terms</h2>
                    <p>By accessing and using MarkdownPDF ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.</p>
                </article>

                <article className="legal-section">
                    <h2>2. Description of Service</h2>
                    <p>MarkdownPDF provides a free, browser-based tool for converting Markdown documents to PDF format. The Service operates entirely within your web browser and does not require registration.</p>
                </article>

                <article className="legal-section">
                    <h2>3. Intellectual Property</h2>
                    <p>You retain all rights to the Markdown content and PDF files you create using the Service. We do not claim any ownership over your content.</p>
                </article>

                <article className="legal-section">
                    <h2>4. Privacy and Data</h2>
                    <p>Our Service is designed with privacy in mind. See our <Link href="/privacy">Privacy Policy</Link> for more details.</p>
                </article>

                <article className="legal-section">
                    <h2>5. Disclaimer</h2>
                    <p>The Service is provided "as is" without warranties of any kind. We do not warrant that the Service will be error-free or uninterrupted.</p>
                </article>

                <article className="legal-section">
                    <h2>6. Contact</h2>
                    <p>If you have any questions, please contact us at connect@markdownpdf.com or via our <Link href="/contact">Contact Page</Link>.</p>
                </article>
            </div>

            <Footer />
        </main>
    );
}
