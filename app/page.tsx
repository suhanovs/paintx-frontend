import { fetchPaintingsServer } from "@/lib/api";
import PaintingGallery from "@/components/PaintingGallery";
import NavbarWrapper from "@/components/NavbarWrapper";

export const revalidate = 3600;

export default async function GalleryPage() {
  const data = await fetchPaintingsServer(1);

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
