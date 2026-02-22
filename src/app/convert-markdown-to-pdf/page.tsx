import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SeoLandingPage from '@/components/SeoLandingPage';

const title = 'Convert Markdown to PDF';
const subtitle = 'Convert Markdown to PDF in seconds with precise formatting, tables, and Mermaid diagram support.';

const features = [
    { title: 'One-Click Export', description: 'Paste Markdown, preview the output, and export instantly.' },
    { title: 'Diagram Support', description: 'Mermaid diagrams render as images inside the PDF.' },
    { title: 'Layout Consistency', description: 'Margins, fonts, and headings are tuned for professional results.' }
];

const faq = [
    { question: 'How do I convert Markdown to PDF?', answer: 'Paste your Markdown or upload a file, then click Download PDF.' },
    { question: 'Can I add a custom filename?', answer: 'Yes. Enter your preferred name before exporting.' },
    { question: 'Is this tool safe for private docs?', answer: 'Yes. The conversion happens locally in your browser.' }
];

const internalLinks = [
    { href: '/', label: 'Convert Now' },
    { href: '/guide', label: 'Conversion Guide' },
    { href: '/features', label: 'Format Options' },
    { href: '/contact', label: 'Contact' }
];

export const metadata: Metadata = {
    title: 'Convert Markdown to PDF | MarkdownPDF',
    description: 'Convert Markdown to PDF with high-quality formatting, Mermaid diagrams, and flexible export settings.',
    alternates: {
        canonical: '/convert-markdown-to-pdf'
    }
};

export default function ConvertMarkdownToPdfPage() {
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer
            }
        }))
    };

    return (
        <main className="min-h-screen flex flex-col">
            <Header />
            <SeoLandingPage title={title} subtitle={subtitle} features={features} faq={faq} internalLinks={internalLinks} />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <Footer />
        </main>
    );
}
