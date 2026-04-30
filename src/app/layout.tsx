import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import CookieConsent from "@/components/CookieConsent/CookieConsent";
import "katex/dist/katex.min.css";
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
  metadataBase: new URL("https://franklindux.com"),
  icons: {
    icon: [
      { url: "/favicon.ico", rel: "shortcut icon" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    title: "FranklinDux",
  },
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
    images: [{ url: "/franklindux-metatag-image.png", width: 800, height: 800, alt: "FranklinDux" }],
  },
  twitter: {
    card: "summary_large_image",
    images: [{ url: "/franklindux-metatag-image.png", width: 800, height: 800, alt: "FranklinDux" }],
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
        {/* Google tag – Consent Mode v2: script always present so Google detects it,
            but analytics_storage starts as 'denied' until the user consents. */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                analytics_storage: 'denied',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied'
              });
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `,
          }}
        />
      </head>
      <body>{children}</body>
      <CookieConsent />
    </html>
  );
}
