import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PaintX — Art Gallery",
  description:
    "Fine art gallery featuring original paintings. Browse and purchase original artwork by contemporary artists.",
  openGraph: {
    title: "PaintX Art Gallery",
    description: "Browse original paintings by contemporary artists.",
    url: "https://www.paintx.art",
    siteName: "PaintX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
