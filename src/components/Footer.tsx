import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="footer" role="contentinfo">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <Link href="/" className="footer-logo">
                            <Image
                                src="/logo.png"
                                alt="MarkdownPDF Logo"
                                width={80}
                                height={60}
                                className="footer-logo-img"
                            />
                            <span>MarkdownPDF</span>
                        </Link>
                        <p className="footer-description">The fastest and most secure way to convert Markdown to PDF online.</p>

                        {/* Rivonix Tech branding badge */}
                        <a
                            href="https://www.rivonixtech.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rivonix-badge"
                            title="MarkdownPDF is built by Rivonix Tech"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="rivonix-badge-label">Crafted by</span>
                            <span className="rivonix-badge-name">Rivonix Tech</span>
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M2.5 2.5H9.5M9.5 2.5V9.5M9.5 2.5L2.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </a>
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
                    <p className="footer-bottom-credit">
                        Built &amp; maintained by{' '}
                        <a
                            href="https://www.rivonixtech.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rivonix-link"
                        >
                            Rivonix Tech
                        </a>
                        {' '}— Web &amp; Software Development Company
                    </p>
                </div>
            </div>
        </footer>
    );
}
