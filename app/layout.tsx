import type { Metadata } from "next";
import "./globals.css";
import MobileBottomBar from "@/components/MobileBottomBar";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.paintx.art"),
  title: {
    default: "Buy Original Paintings — Contemporary & Classical Art | PaintX Art Gallery",
    template: "%s | PaintX Art Gallery",
  },
  description:
    "Discover unique original paintings for your home. Works by established and emerging artists. Fall in love and buy fine art online at PaintX.",
  keywords: [
    "art gallery",
    "buy paintings",
    "original paintings",
    "paintings for home",
    "contemporary art",
    "classical art",
    "fine art",
    "buy art online",
    "artist paintings",
    "original artwork",
  ],
  authors: [{ name: "PaintX Art Gallery" }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    url: "https://www.paintx.art",
    siteName: "PaintX Art Gallery",
    title: "Buy Original Paintings — Contemporary & Classical Art | PaintX Art Gallery",
    description:
      "Discover unique original paintings for your home. Works by established and emerging artists. Fall in love and buy fine art online at PaintX.",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "PaintX Art Gallery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buy Original Paintings — Contemporary & Classical Art | PaintX Art Gallery",
    description:
      "Discover unique original paintings for your home. Works by established and emerging artists.",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        {children}
        <MobileBottomBar />
      </body>
    </html>
  );
}
