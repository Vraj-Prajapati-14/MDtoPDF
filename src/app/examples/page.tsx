'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import React, { useState } from 'react';

export default function ExamplesPage() {
    const examples = [
        {
            id: 'resume',
            title: 'Professional Resume',
            subtitle: 'Create a clean, professional resume',
            code: `# John Doe
**Software Engineer** | john.doe@email.com | (555) 123-4567

## Summary
Experienced software engineer with 5+ years in full-stack development.

## Experience
### Senior Engineer | Tech Corp
*2021 - Present*
- Led development of microservices architecture
- Improved performance by 40%

## Education
### B.S. in Computer Science
University of Technology | 2014 - 2018`
        },
        {
            id: 'meeting',
            title: 'Meeting Notes',
            subtitle: 'Template for professional meeting documentation',
            code: `# Project Kickoff Meeting
**Date:** Dec 12, 2024
**Attendees:** John, Jane, Mike

## Agenda
1. Project Overview
2. Timeline
3. Next Steps

## Action Items
- [ ] John: Create project plan
- [ ] Jane: Set up dev env`
        }
    ];

    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (id: string, code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <main className="min-h-screen flex flex-col">
            <Header />

            <section className="hero">
                <div className="container">
                    <h1 className="hero-title">Markdown <span className="gradient-text">Examples</span></h1>
                    <p className="hero-subtitle">Ready-to-use templates for common documents</p>
                </div>
            </section>

            <div className="examples-content">
                {examples.map((example) => (
                    <div key={example.id} className="example-card">
                        <div className="example-header">
                            <div>
                                <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>{example.title}</h2>
                                <p style={{ color: 'var(--text-secondary)', margin: 'var(--spacing-xs) 0 0 0' }}>{example.subtitle}</p>
                            </div>
                            <button
                                className="copy-btn"
                                onClick={() => handleCopy(example.id, example.code)}
                                style={copiedId === example.id ? { background: '#10b981', borderColor: '#10b981' } : {}}
                            >
                                {copiedId === example.id ? '✅ Copied!' : '📋 Copy'}
                            </button>
                        </div>
                        <div className="example-code">
                            <pre>{example.code}</pre>
                        </div>
                    </div>
                ))}
            </div>

            <Footer />
        </main>
    );
}
