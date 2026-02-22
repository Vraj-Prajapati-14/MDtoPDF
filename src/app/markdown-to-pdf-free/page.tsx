import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SeoLandingPage from '@/components/SeoLandingPage';

const title = 'Free Markdown to PDF';
const subtitle = 'Free Markdown to PDF conversion with polished styling, Mermaid diagrams, and customizable exports.';

const features = [
    { title: 'Free Forever', description: 'No sign-up required and no usage limits for basic conversion.' },
    { title: 'Professional Output', description: 'Clean typography, structured headings, and readable tables.' },
    { title: 'Fast Export', description: 'Generate PDFs directly in your browser in seconds.' }
];

const faq = [
    { question: 'Is the Markdown to PDF tool free?', answer: 'Yes. The converter is free and works in your browser.' },
    { question: 'Will the PDF include a footer?', answer: 'By default it adds the tool name, and you can customize or disable it.' },
    { question: 'Does it support Mermaid diagrams?', answer: 'Yes. Mermaid blocks are exported as JPG images.' }
];

const internalLinks = [
    { href: '/', label: 'Free Converter' },
    { href: '/features', label: 'See Features' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/blog', label: 'Blog' }
];

export const metadata: Metadata = {
    title: 'Free Markdown to PDF | MarkdownPDF',
    description: 'Free Markdown to PDF converter with customizable layout and Mermaid diagram support.',
    alternates: {
        canonical: '/markdown-to-pdf-free'
    }
};

export default function MarkdownToPdfFreePage() {
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
