import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Free Markdown to PDF Converter - Best Fast Accurate Online MD to PDF Tool | MarkdownPDF",
  description: "Best free online Markdown to PDF converter tool. Fast, accurate, and secure MD to PDF conversion. Convert markdown files to PDF instantly. No registration, developer-friendly, 100% free dev tool.",
  keywords: ["markdown to pdf", "md to pdf", "convert markdown to pdf", "markdown converter", "free pdf converter"],
  authors: [{ name: "MarkdownPDF" }],
  metadataBase: new URL("https://www.markdownpdf.com"),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/logo.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/logo.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Free Markdown to PDF Converter - Best Fast Accurate Online MD to PDF Tool",
    description: "Best free online Markdown to PDF converter tool. Professional PDF conversion with real-time preview.",
    type: "website",
    url: "https://www.markdownpdf.com/",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "MarkdownPDF Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Markdown to PDF Converter - Best Fast Accurate Online MD to PDF Tool",
    description: "Professional Markdown to PDF conversion with real-time preview.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "/"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/logo.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/logo.png" sizes="512x512" />
        <link rel="shortcut icon" href="/favicon.svg" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
