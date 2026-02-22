'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon, FileText } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function Header() {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();

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
                        <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
                        <path d="M8 12L16 20L24 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"
                            strokeLinejoin="round" />
                        <defs>
                            <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
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

                {/* Theme Toggle */}
                <button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    <span className="theme-toggle-track">
                        <span className="theme-toggle-thumb">
                            {theme === 'dark'
                                ? <Moon size={13} strokeWidth={2} />
                                : <Sun size={13} strokeWidth={2} />
                            }
                        </span>
                    </span>
                    <span className="theme-toggle-label">
                        {theme === 'dark' ? 'Dark' : 'Light'}
                    </span>
                </button>
            </nav>

            <style>{`
                .theme-toggle {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-color);
                    border-radius: 999px;
                    padding: 4px 12px 4px 4px;
                    cursor: pointer;
                    transition: all 0.22s ease;
                    color: var(--text-secondary);
                    font-size: 0.82rem;
                    font-weight: 600;
                    font-family: var(--font-primary);
                    white-space: nowrap;
                }
                .theme-toggle:hover {
                    border-color: var(--border-hover);
                    background: var(--bg-card);
                    color: var(--text-primary);
                }
                .theme-toggle-track {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: var(--primary-gradient);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    flex-shrink: 0;
                    transition: transform 0.22s ease;
                }
                .theme-toggle:hover .theme-toggle-track {
                    transform: rotate(20deg);
                }
                .theme-toggle-thumb {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .theme-toggle-label {
                    letter-spacing: 0.02em;
                }
            `}</style>
        </header>
    );
}
