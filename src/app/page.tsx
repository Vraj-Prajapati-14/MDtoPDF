import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Converter from '@/components/Converter';
import { Zap, ShieldCheck, Sparkles, Star, UserRoundX, Lock } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <section className="hero" role="region" aria-label="Hero section">
        <div className="container">
          <h1 className="hero-title">Convert Markdown to PDF <span className="gradient-text">Instantly</span></h1>
          <p className="hero-subtitle">Professional PDF conversion with real-time preview. Free, fast, and works on all devices. No registration required.</p>
          <div className="hero-features">
            <div className="feature-badge">
              <Star size={18} />
              <span>100% Free</span>
            </div>
            <div className="feature-badge">
              <UserRoundX size={18} />
              <span>No Sign-up</span>
            </div>
            <div className="feature-badge">
              <Lock size={18} />
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
      </section>

      <Converter />

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose MarkdownPDF?</h2>
          <div className="features-grid">
            <article className="feature-card">
              <div className="feature-icon">
                <Zap size={40} strokeWidth={1.5} />
              </div>
              <h3>Lightning Fast</h3>
              <p>Instant conversion with no server delays. Everything happens in your browser for maximum speed.</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">
                <ShieldCheck size={40} strokeWidth={1.5} />
              </div>
              <h3>100% Private</h3>
              <p>Your documents never leave your device. All processing is done locally in your browser.</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">
                <Sparkles size={40} strokeWidth={1.5} />
              </div>
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
