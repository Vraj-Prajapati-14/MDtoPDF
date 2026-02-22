import Link from 'next/link';

type Feature = {
    title: string;
    description: string;
};

type FaqItem = {
    question: string;
    answer: string;
};

type InternalLink = {
    href: string;
    label: string;
};

type SeoLandingPageProps = {
    title: string;
    subtitle: string;
    features: Feature[];
    faq: FaqItem[];
    internalLinks: InternalLink[];
};

export default function SeoLandingPage({ title, subtitle, features, faq, internalLinks }: SeoLandingPageProps) {
    return (
        <section className="seo-page">
            <div className="container">
                <header className="seo-hero">
                    <h1 className="seo-title">{title}</h1>
                    <p className="seo-subtitle">{subtitle}</p>
                    <div className="seo-cta">
                        <Link href="/" className="btn btn-primary">Start Converting</Link>
                        <Link href="/guide" className="btn btn-secondary">Read the Guide</Link>
                    </div>
                </header>

                <section className="seo-section">
                    <h2 className="seo-section-title">Why This Tool</h2>
                    <div className="seo-grid">
                        {features.map((feature) => (
                            <div key={feature.title} className="seo-card">
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="seo-section">
                    <h2 className="seo-section-title">Frequently Asked Questions</h2>
                    <div className="seo-faq">
                        {faq.map((item) => (
                            <div key={item.question} className="seo-faq-item">
                                <h3>{item.question}</h3>
                                <p>{item.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="seo-section">
                    <h2 className="seo-section-title">Related Resources</h2>
                    <div className="seo-links">
                        {internalLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="seo-link">
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </section>
    );
}
