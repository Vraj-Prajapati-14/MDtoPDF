import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function BlogPage() {
    const posts = [
        { emoji: '📝', date: 'Dec 12, 2024', readTime: '5 min read', title: '10 Markdown Tips for Better Documentation', excerpt: 'Learn essential Markdown techniques to create clear, professional documentation that\'s easy to read and maintain.', tags: ['Markdown', 'Tips', 'Documentation'] },
        { emoji: '🚀', date: 'Dec 10, 2024', readTime: '4 min read', title: 'How to Create Professional PDFs from Markdown', excerpt: 'A comprehensive guide to converting your Markdown documents into beautifully formatted PDF files.', tags: ['PDF', 'Tutorial', 'Guide'] },
        { emoji: '⚡', date: 'Dec 8, 2024', readTime: '6 min read', title: 'Markdown vs. Word: Which is Better?', excerpt: 'Compare Markdown and Microsoft Word for creating technical documentation and learn when to use each.', tags: ['Comparison', 'Productivity'] },
        { emoji: '🎨', date: 'Dec 5, 2024', readTime: '5 min read', title: 'Styling Your Markdown for PDF Export', excerpt: 'Best practices for formatting Markdown content to ensure your PDFs look professional and polished.', tags: ['Styling', 'PDF', 'Design'] },
        { emoji: '📊', date: 'Dec 3, 2024', readTime: '7 min read', title: 'Creating Tables in Markdown: A Complete Guide', excerpt: 'Master the art of creating beautiful, well-formatted tables in Markdown for your documents.', tags: ['Tables', 'Tutorial'] },
        { emoji: '🔒', date: 'Dec 1, 2024', readTime: '4 min read', title: 'Why Privacy Matters in Document Conversion', excerpt: 'Understanding the importance of client-side processing and how it protects your sensitive documents.', tags: ['Privacy', 'Security'] },
    ];

    return (
        <main className="min-h-screen flex flex-col">
            <Header />

            <section className="hero">
                <div className="container">
                    <h1 className="hero-title">Our <span className="gradient-text">Blog</span></h1>
                    <p className="hero-subtitle">Tips, tutorials, and insights about Markdown and PDF conversion</p>
                </div>
            </section>

            <section style={{ padding: 'var(--spacing-xl) 0' }}>
                <div className="container">
                    <div className="blog-grid">
                        {posts.map((post, index) => (
                            <article key={index} className="blog-card">
                                <div className="blog-image">{post.emoji}</div>
                                <div className="blog-content">
                                    <div className="blog-meta">
                                        <span>{post.date}</span>
                                        <span>•</span>
                                        <span>{post.readTime}</span>
                                    </div>
                                    <h3>{post.title}</h3>
                                    <p>{post.excerpt}</p>
                                    <div>
                                        {post.tags.map(tag => (
                                            <span key={tag} className="blog-tag">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
