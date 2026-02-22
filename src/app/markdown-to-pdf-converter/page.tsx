import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SeoLandingPage from '@/components/SeoLandingPage';

const title = 'Markdown to PDF Converter';
const subtitle = 'A full-featured Markdown to PDF converter with export controls for headers, footers, and typography.';

const features = [
    { title: 'Export Controls', description: 'Enable headers, footers, and page numbers to match your style guide.' },
    { title: 'Text-First PDFs', description: 'Keep text selectable with clean typography and consistent margins.' },
    { title: 'Readable Code Blocks', description: 'Code blocks render with a subtle background and monospace font.' }
];

const faq = [
    { question: 'Can I change the font size?', answer: 'Yes. Choose a base font size that fits your document.' },
    { question: 'Does the converter support tables?', answer: 'Yes. Tables are rendered with clear borders and optional striping.' },
    { question: 'Is page size configurable?', answer: 'Yes. Select A4, Letter, Legal, or A3 with portrait or landscape.' }
];

const internalLinks = [
    { href: '/', label: 'Open the Converter' },
    { href: '/features', label: 'Export Features' },
    { href: '/examples', label: 'Example Documents' },
    { href: '/guide', label: 'Step-by-Step Guide' }
];

export const metadata: Metadata = {
    title: 'Markdown to PDF Converter | MarkdownPDF',
    description: 'Convert Markdown to PDF with professional formatting, optional headers and footers, and precise layout control.',
    alternates: {
        canonical: '/markdown-to-pdf-converter'
    }
};

export default function MarkdownToPdfConverterPage() {
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
