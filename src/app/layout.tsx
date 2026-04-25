import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://franklindux.dev"),
  title: {
    default: "FranklinDux | Blog de Desenvolvimento de Software",
    template: "%s | FranklinDux",
  },
  description:
    "Blog pessoal de Franklin Dux sobre desenvolvimento de software, arquitetura, boas práticas e tecnologia.",
  keywords: [
    "desenvolvimento de software",
    "programação",
    "tecnologia",
    "blog",
    "Next.js",
    "TypeScript",
    "React",
  ],
  authors: [{ name: "FranklinDux" }],
  creator: "FranklinDux",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "FranklinDux Blog",
    title: "FranklinDux | Blog de Desenvolvimento de Software",
    description:
      "Blog pessoal de Franklin Dux sobre desenvolvimento de software, arquitetura, boas práticas e tecnologia.",
    images: [{ url: "/me.jpeg", width: 800, height: 800, alt: "FranklinDux" }],
  },
  twitter: {
    card: "summary",
    title: "FranklinDux | Blog de Desenvolvimento de Software",
    description:
      "Blog pessoal de Franklin Dux sobre desenvolvimento de software, arquitetura, boas práticas e tecnologia.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Anti-FOUC: apply saved theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
