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
    default: "FranklinDux | Desenvolvimento de Software, Inteligência Artificial, Tecnologia e Negócios",
    template: "%s | FranklinDux",
  },
  description:
    "Blog do Franklin Dux sobre desenvolvimento de software, inteligência artificial, tecnologia e negócios. Compartilhando experiências, aprendizados e insights enquanto evoluo como profissional e pessoa.",
  keywords: [
    "Franklin Dux",
    "Desenvolvimento de Software",
    "Inteligência Artificial",
    "Tecnologia",
    "Negócios",
    "Arquitetura de Software",
    "Boas Práticas",
  ],
  authors: [{ name: "FranklinDux" }],
  creator: "FranklinDux",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "FranklinDux",
    title: "FranklinDux | Desenvolvimento de Software, Tecnologia e Negócios",
    description:
      "Blog do Franklin Dux sobre desenvolvimento de software, inteligência artificial, tecnologia e negócios. Compartilhando experiências, aprendizados e insights enquanto evoluo como profissional e pessoa.",
    images: [{ url: "/me.jpeg", width: 800, height: 800, alt: "FranklinDux" }],
  },
  twitter: {
    card: "summary",
    title: "FranklinDux | Desenvolvimento de Software, Tecnologia e Negócios",
    description:
      "Blog do Franklin Dux sobre desenvolvimento de software, inteligência artificial, tecnologia e negócios. Compartilhando experiências, aprendizados e insights enquanto evoluo como profissional e pessoa.",
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
