import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <main className="min-h-screen flex flex-col">
            <Header />

            <section className="hero">
                <div className="container">
                    <h1 className="hero-title">Privacy <span className="gradient-text">Policy</span></h1>
                    <p className="hero-subtitle">Your privacy is our top priority</p>
                    <p style={{ color: 'var(--text-tertiary)', marginTop: 'var(--spacing-sm)' }}>Last updated: Jan 06, 2026</p>
                </div>
            </section>

            <div className="legal-content">
                <div className="highlight-box">
                    <h3 style={{ color: 'var(--primary-color)', margin: '0 0 var(--spacing-sm) 0', display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={20} /> Privacy First Approach</h3>
                    <p style={{ margin: 0, color: 'var(--text-primary)' }}>
                        <strong>All processing happens locally in your browser. Your documents never leave your device. We don't collect, store, or transmit your content.</strong>
                    </p>
                </div>

                <article className="legal-section">
                    <h2>1. Introduction</h2>
                    <p>Welcome to MarkdownPDF. We are committed to protecting your privacy and ensuring the security of your data. This Privacy Policy explains how we handle information when you use our Markdown to PDF conversion tool.</p>
                </article>

                <article className="legal-section">
                    <h2>2. Information We DON'T Collect</h2>
                    <p>Unlike most web services, MarkdownPDF is designed with privacy at its core:</p>
                    <ul style={{ marginLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                        <li>We do NOT collect your Markdown content</li>
                        <li>We do NOT store your PDF files</li>
                        <li>We do NOT track your document content</li>
                        <li>We do NOT upload your files to any server</li>
                        <li>We do NOT require registration or login</li>
                    </ul>
                </article>

                <article className="legal-section">
                    <h2>3. How Our Service Works</h2>
                    <p>MarkdownPDF operates entirely in your web browser. All Markdown parsing happens on your device, and PDF generation occurs locally. Your documents never leave your computer.</p>
                </article>

                <article className="legal-section">
                    <h2>4. Local Storage</h2>
                    <p>We use your browser's local storage to enhance your experience by storing your Markdown content (auto-save feature) and your preferences (page size, orientation). This data is stored only on YOUR device, and we cannot access it.</p>
                </article>

                <article className="legal-section">
                    <h2>5. Contact Us</h2>
                    <p>If you have questions about this Privacy Policy, please contact us at connect@markdownpdf.com or via our <Link href="/contact">Contact Page</Link>.</p>
                </article>
            </div>

            <Footer />
        </main>
    );
}
