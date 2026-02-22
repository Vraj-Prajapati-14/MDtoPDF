import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SeoLandingPage from '@/components/SeoLandingPage';

const title = 'Markdown to PDF Converter';
const subtitle = 'Convert Markdown to PDF instantly with professional formatting, Mermaid diagram support, and customizable layout settings.';

const features = [
    { title: 'Professional Layout', description: 'Clean headings, tables, and code blocks rendered with consistent spacing.' },
    { title: 'Mermaid Diagrams', description: 'Mermaid blocks render as JPG images inside the final PDF.' },
    { title: 'Privacy First', description: 'All conversion happens in your browser with no uploads.' }
];

const faq = [
    { question: 'Can I convert Markdown to PDF for free?', answer: 'Yes. The tool is free to use and works entirely in your browser.' },
    { question: 'Does the PDF keep selectable text?', answer: 'Yes. The PDF is text-based so content remains selectable and searchable.' },
    { question: 'Do Mermaid diagrams export correctly?', answer: 'Yes. Mermaid code blocks are converted to JPG images and embedded in the PDF.' }
];

const internalLinks = [
    { href: '/', label: 'MD to PDF Tool' },
    { href: '/guide', label: 'User Guide' },
    { href: '/features', label: 'Features' },
    { href: '/markdown-syntax', label: 'Markdown Syntax' }
];

export const metadata: Metadata = {
    title: 'Markdown to PDF Converter | MarkdownPDF',
    description: 'Convert Markdown to PDF with professional formatting, Mermaid diagrams, and fast client-side processing.',
    alternates: {
        canonical: '/markdown-to-pdf'
    }
};

export default function MarkdownToPdfPage() {
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
