import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer" role="contentinfo">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <Link href="/" className="footer-logo">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="32" height="32" rx="8" fill="url(#gradient2)" />
                                <path d="M8 12L16 20L24 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"
                                    strokeLinejoin="round" />
                                <defs>
                                    <linearGradient id="gradient2" x1="0" y1="0" x2="32" y2="32"
                                        gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#667EEA" />
                                        <stop offset="1" stopColor="#764BA2" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <span>MarkdownPDF</span>
                        </Link>
                        <p className="footer-description">The fastest and most secure way to convert Markdown to PDF online.</p>
                    </div>
                    <div className="footer-section">
                        <h4>Product</h4>
                        <ul className="footer-links">
                            <li><Link href="/">MD to PDF</Link></li>
                            <li><Link href="/features">Features</Link></li>
                            <li><Link href="/guide">User Guide</Link></li>
                            <li><Link href="/blog">Blog</Link></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Resources</h4>
                        <ul className="footer-links">
                            <li><Link href="/markdown-syntax">Markdown Syntax</Link></li>
                            <li><Link href="/examples">Examples</Link></li>
                            <li><Link href="/api">API</Link></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Legal</h4>
                        <ul className="footer-links">
                            <li><Link href="/privacy">Privacy Policy</Link></li>
                            <li><Link href="/terms">Terms of Service</Link></li>
                            <li><Link href="/contact">Contact</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} MarkdownPDF. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
