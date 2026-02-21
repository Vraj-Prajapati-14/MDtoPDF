'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
    const pathname = usePathname();

    const navLinks = [
        { href: '/', label: 'MD to PDF' },
        { href: '/guide', label: 'Guide' },
        { href: '/features', label: 'Features' },
        { href: '/blog', label: 'Blog' },
    ];

    return (
        <header className="header" role="banner">
            <nav className="nav-container" role="navigation" aria-label="Main navigation">
                <Link href="/" className="logo">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="32" height="32" rx="8" fill="url(#gradient)" />
                        <path d="M8 12L16 20L24 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"
                            strokeLinejoin="round" />
                        <defs>
                            <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#667EEA" />
                                <stop offset="1" stopColor="#764BA2" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span className="logo-text">MarkdownPDF</span>
                </Link>
                <ul className="nav-links">
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={`nav-link ${pathname === link.href ? 'active' : ''}`}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
}
