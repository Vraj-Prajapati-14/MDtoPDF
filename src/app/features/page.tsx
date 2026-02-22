import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Zap, Palette, FileText, ShieldCheck, Save, Keyboard, Smartphone, Wifi, Upload, Type, Heading, List, Code2, Table2, Link2 } from 'lucide-react';
import { ReactNode } from 'react';

export default function FeaturesPage() {
    const features: { icon: ReactNode; title: string; description: string }[] = [
        { icon: <Zap size={32} strokeWidth={1.5} />, title: 'Real-time Preview', description: 'See your formatted document instantly as you type. No delays, no waiting - just instant feedback on your Markdown content.' },
        { icon: <Palette size={32} strokeWidth={1.5} />, title: 'Professional Formatting', description: 'Beautiful typography, syntax highlighting for code blocks, properly formatted tables, and clean layouts that look great in PDF.' },
        { icon: <FileText size={32} strokeWidth={1.5} />, title: 'Multiple Page Sizes', description: 'Choose from A4, Letter, Legal, or A3 page sizes. Support for both portrait and landscape orientations.' },
        { icon: <ShieldCheck size={32} strokeWidth={1.5} />, title: 'Privacy First', description: 'All processing happens locally in your browser. Your documents never leave your device, ensuring complete privacy and security.' },
        { icon: <Save size={32} strokeWidth={1.5} />, title: 'Auto-save', description: 'Your work is automatically saved to your browser\'s local storage. Never lose your progress, even if you close the tab.' },
        { icon: <Keyboard size={32} strokeWidth={1.5} />, title: 'Keyboard Shortcuts', description: 'Work faster with keyboard shortcuts. Ctrl/Cmd+S to download, Ctrl/Cmd+K to clear, and Tab for indentation.' },
        { icon: <Smartphone size={32} strokeWidth={1.5} />, title: 'Fully Responsive', description: 'Works perfectly on desktop, tablet, and mobile devices. Convert Markdown to PDF anywhere, anytime.' },
        { icon: <Wifi size={32} strokeWidth={1.5} />, title: 'Works Offline', description: 'Once loaded, the tool works completely offline. No internet connection required for conversion.' },
        { icon: <Upload size={32} strokeWidth={1.5} />, title: 'File Upload', description: 'Upload existing .md, .markdown, or .txt files directly. Quick and easy import of your existing documents.' },
    ];

    const supportedFeatures: { icon: ReactNode; title: string; description: string }[] = [
        { icon: <Type size={28} strokeWidth={1.5} />, title: 'Text Formatting', description: 'Bold, italic, inline code, strikethrough, and more.' },
        { icon: <Heading size={28} strokeWidth={1.5} />, title: 'Headings', description: 'Six levels of headings (H1-H6) with automatic formatting and hierarchy.' },
        { icon: <List size={28} strokeWidth={1.5} />, title: 'Lists', description: 'Ordered lists, unordered lists, nested lists, and task lists with checkboxes.' },
        { icon: <Code2 size={28} strokeWidth={1.5} />, title: 'Code Blocks', description: 'Syntax-highlighted code blocks with support for multiple programming languages.' },
        { icon: <Table2 size={28} strokeWidth={1.5} />, title: 'Tables', description: 'Create beautiful tables with proper alignment and formatting.' },
        { icon: <Link2 size={28} strokeWidth={1.5} />, title: 'Links & Images', description: 'Add hyperlinks and embed images with automatic formatting.' },
    ];

    return (
        <main className="min-h-screen flex flex-col">
            <Header />

            <section className="hero">
                <div className="container">
                    <h1 className="hero-title">Powerful <span className="gradient-text">Features</span></h1>
                    <p className="hero-subtitle">Everything you need to convert Markdown to PDF professionally</p>
                </div>
            </section>

            <section className="features-section">
                <div className="container">
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <article key={index} className="feature-card">
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="how-it-works">
                <div className="container">
                    <h2 className="section-title">Supported Markdown Features</h2>
                    <div className="features-grid">
                        {supportedFeatures.map((feature, index) => (
                            <article key={index} className="feature-card">
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
