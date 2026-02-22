'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, Bug } from 'lucide-react';

export default function ContactPage() {
    const [status, setStatus] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('Thank you for your message! We\'ll get back to you soon.');
        (e.target as HTMLFormElement).reset();
    };

    return (
        <main className="min-h-screen flex flex-col">
            <Header />

            <section className="hero">
                <div className="container">
                    <h1 className="hero-title">Get in <span className="gradient-text">Touch</span></h1>
                    <p className="hero-subtitle">We'd love to hear from you! Send us your questions, feedback, or suggestions.</p>
                </div>
            </section>

            <div className="contact-content">
                <div className="contact-info">
                    <div className="info-card">
                        <div className="info-icon"><Mail size={40} strokeWidth={1.5} /></div>
                        <h3>Email Us</h3>
                        <p>connect@markdownpdf.com</p>
                        <p style={{ fontSize: '0.85rem', marginTop: 'var(--spacing-sm)', color: 'var(--text-tertiary)' }}>
                            We typically respond within 24 hours
                        </p>
                    </div>

                    <div className="info-card">
                        <div className="info-icon"><MessageSquare size={40} strokeWidth={1.5} /></div>
                        <h3>Feedback</h3>
                        <p>Share your ideas</p>
                        <p style={{ fontSize: '0.85rem', marginTop: 'var(--spacing-sm)', color: 'var(--text-tertiary)' }}>
                            Help us improve our tool
                        </p>
                    </div>

                    <div className="info-card">
                        <div className="info-icon"><Bug size={40} strokeWidth={1.5} /></div>
                        <h3>Report a Bug</h3>
                        <p>found-a-bug@markdownpdf.com</p>
                        <p style={{ fontSize: '0.85rem', marginTop: 'var(--spacing-sm)', color: 'var(--text-tertiary)' }}>
                            Help us fix issues
                        </p>
                    </div>
                </div>

                <div className="contact-form">
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-lg)' }}>Send us a Message</h2>

                    {status ? (
                        <div style={{ padding: 'var(--spacing-md)', background: 'rgba(102, 126, 234, 0.1)', color: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--spacing-lg)' }}>
                            {status}
                        </div>
                    ) : null}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Name *</label>
                            <input type="text" id="name" name="name" required className="form-input" placeholder="Your name" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <input type="email" id="email" name="email" required className="form-input" placeholder="your.email@example.com" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="subject">Subject *</label>
                            <select id="subject" name="subject" required className="form-input">
                                <option value="">Select a subject</option>
                                <option value="general">General Inquiry</option>
                                <option value="support">Technical Support</option>
                                <option value="feedback">Feedback</option>
                                <option value="bug">Bug Report</option>
                                <option value="feature">Feature Request</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Message *</label>
                            <textarea id="message" name="message" required className="form-input form-textarea" placeholder="Tell us how we can help..."></textarea>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            Send Message
                        </button>
                    </form>
                </div>

                <div style={{ marginTop: 'var(--spacing-xl)', padding: 'var(--spacing-lg)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>Frequently Asked Questions</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                        Before contacting us, you might find your answer in our <Link href="/guide">User Guide</Link> or <Link href="/features">Features</Link> page.
                    </p>
                </div>
            </div>

            <Footer />
        </main>
    );
}
