import type { Metadata } from "next";
import { fetchPaintingsServer } from "@/lib/api";
import PaintingGallery from "@/components/PaintingGallery";
import NavbarWrapper from "@/components/NavbarWrapper";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Buy Original Paintings — Contemporary & Classical Art | PaintX Art Gallery",
  description:
    "Discover unique original paintings for your home. Works by established and emerging artists. Fall in love and buy fine art online at PaintX.",
  alternates: {
    canonical: "https://www.paintx.art",
  },
  openGraph: {
    url: "https://www.paintx.art",
  },
};

export default async function GalleryPage() {
  const data = await fetchPaintingsServer(1, undefined, 30);

  return (
    <>
      <NavbarWrapper />
      <main>
        <PaintingGallery
          initialPaintings={data.items}
          initialPage={1}
          totalPages={data.pages}
        />
      </main>
    </>
  );
}
