import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Converter from '@/components/Converter';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="hero" role="region" aria-label="Hero section">
        <div className="container">
          <h1 className="hero-title">Convert Markdown to PDF <span className="gradient-text">Instantly</span></h1>
          <p className="hero-subtitle">Professional PDF conversion with real-time preview. Free, fast, and works on all devices. No registration required.</p>
          <div className="hero-features">
            <div className="feature-badge">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L12.5 7.5L18 8.5L14 12.5L15 18L10 15.5L5 18L6 12.5L2 8.5L7.5 7.5L10 2Z" fill="currentColor" />
              </svg>
              <span>100% Free</span>
            </div>
            <div className="feature-badge">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2C5.58 2 2 5.58 2 10C2 14.42 5.58 18 10 18C14.42 18 18 14.42 18 10C18 5.58 14.42 2 10 2ZM10 16C6.69 16 4 13.31 4 10C4 6.69 6.69 4 10 4C13.31 4 16 6.69 16 10C16 13.31 13.31 16 10 16Z" fill="currentColor" />
                <path d="M13 7L8.5 11.5L7 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span>No Sign-up</span>
            </div>
            <div className="feature-badge">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L3 7V13L10 18L17 13V7L10 2Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M10 10L10 18" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 10L3 7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 10L17 7" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
      </section>

      <Converter />

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose MarkdownPDF?</h2>
          <div className="features-grid">
            <article className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Instant conversion with no server delays. Everything happens in your browser for maximum speed.</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>100% Private</h3>
              <p>Your documents never leave your device. All processing is done locally in your browser.</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Beautiful Output</h3>
              <p>Professional formatting with syntax highlighting, tables, and custom styling options.</p>
            </article>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
