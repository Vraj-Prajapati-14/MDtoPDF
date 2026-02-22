import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SeoLandingPage from '@/components/SeoLandingPage';

const title = 'Markdown to PDF Online';
const subtitle = 'Use the online Markdown to PDF tool to generate clean, shareable PDFs without installing anything.';

const features = [
    { title: 'No Installation', description: 'Open the tool in your browser and export PDFs instantly.' },
    { title: 'Live Preview', description: 'See the PDF layout update as you edit your Markdown.' },
    { title: 'Mermaid Ready', description: 'Flowcharts and diagrams are exported as JPGs inside the PDF.' }
];

const faq = [
    { question: 'Is this Markdown to PDF tool truly online?', answer: 'Yes. It runs in your browser with no downloads or setup.' },
    { question: 'Will my data be uploaded?', answer: 'No. The conversion happens locally on your device.' },
    { question: 'Can I customize the footer?', answer: 'Yes. Set your own footer text or disable it entirely.' }
];

const internalLinks = [
    { href: '/', label: 'Start Converting' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/features', label: 'Formatting Features' },
    { href: '/markdown-syntax', label: 'Markdown Syntax' }
];

export const metadata: Metadata = {
    title: 'Markdown to PDF Online | MarkdownPDF',
    description: 'Convert Markdown to PDF online with live preview, custom styling, and Mermaid diagram support.',
    alternates: {
        canonical: '/markdown-to-pdf-online'
    }
};

export default function MarkdownToPdfOnlinePage() {
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
