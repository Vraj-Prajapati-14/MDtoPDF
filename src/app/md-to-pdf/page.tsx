import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SeoLandingPage from '@/components/SeoLandingPage';

const title = 'MD to PDF';
const subtitle = 'Fast MD to PDF conversion with adjustable fonts, headers, and footers for polished documents.';

const features = [
    { title: 'Custom Export Options', description: 'Choose page size, orientation, font family, and table theme.' },
    { title: 'Client-Side Speed', description: 'No server wait times. Everything happens locally in your browser.' },
    { title: 'Accurate Tables', description: 'Tables are rendered with clean borders and readable spacing.' }
];

const faq = [
    { question: 'Can I rename the PDF before downloading?', answer: 'Yes. Provide a custom filename before exporting.' },
    { question: 'Does the tool support large files?', answer: 'It supports large Markdown files, though complex PDFs may take longer.' },
    { question: 'Are headers optional?', answer: 'Yes. Headers are off by default and can be enabled when needed.' }
];

const internalLinks = [
    { href: '/', label: 'Markdown to PDF Tool' },
    { href: '/features', label: 'All Features' },
    { href: '/examples', label: 'Examples' },
    { href: '/guide', label: 'Guide' }
];

export const metadata: Metadata = {
    title: 'MD to PDF Converter | MarkdownPDF',
    description: 'Convert MD to PDF quickly with professional formatting and customizable export settings.',
    alternates: {
        canonical: '/md-to-pdf'
    }
};

export default function MdToPdfPage() {
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
