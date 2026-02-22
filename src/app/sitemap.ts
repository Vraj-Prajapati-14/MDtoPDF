import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.markdownpdf.com';
    const routes = [
        '/',
        '/guide',
        '/features',
        '/blog',
        '/contact',
        '/examples',
        '/markdown-syntax',
        '/privacy',
        '/terms',
        '/api',
        '/markdown-to-pdf',
        '/md-to-pdf',
        '/markdown-to-pdf-online',
        '/markdown-to-pdf-converter',
        '/convert-markdown-to-pdf',
        '/markdown-to-pdf-free'
    ];

    const now = new Date();
    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: route === '/' ? 1 : 0.7
    }));
}
