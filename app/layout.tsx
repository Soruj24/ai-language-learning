import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/components/providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lingua-ai.com"),
  title: {
    default: "LinguaAI - AI Language Tutor",
    template: "%s | LinguaAI"
  },
  description: "Master a new language with your personal AI tutor. Real-time pronunciation feedback, interactive lessons, and personalized learning plans.",
  keywords: ["AI language learning", "language tutor", "learn spanish", "learn french", "pronunciation practice", "vocabulary builder"],
  authors: [{ name: "LinguaAI Team" }],
  creator: "LinguaAI",
  publisher: "LinguaAI",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lingua-ai.com",
    title: "LinguaAI - AI Language Tutor",
    description: "Master a new language with your personal AI tutor.",
    siteName: "LinguaAI",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "LinguaAI - AI Language Tutor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LinguaAI - AI Language Tutor",
    description: "Master a new language with your personal AI tutor.",
    images: ["/og-image.jpg"],
    creator: "@linguaai",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LinguaAI",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
