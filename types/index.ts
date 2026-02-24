export interface PaintingListItem {
  id: string;
  title: string | null;
  title_ru: string | null;
  artist_name: string | null;
  artist_id: number | null;
  domestic_price: number | null;
  domestic_currency: string | null;
  style_name: string | null;
  canvas_height: number | null;
  canvas_width: number | null;
  image_thumbnail_filename: string | null;
  image_mid_res_filename: string | null;
  export_price: number | null;
  scroll_rank: number | null;
}

export interface ColorItem {
  hex: string;
  name: string;
  percentage: number;
}

export interface PaintingDetail {
  id: string;
  title: string | null;
  title_ru: string | null;
  description: string | null;
  description_ru: string | null;
  notes_ru: string | null;
  year: number | null;
  artist_id: number | null;
  artist_name: string | null;
  artist_firstname: string | null;
  artist_lastname: string | null;
  artist_about: string | null;
  artist_min_price: number | null;
  artist_max_price: number | null;
  artist_works_count: number | null;
  availability: string | null;
  canvas_height: number | null;
  canvas_width: number | null;
  canvas_name: string | null;
  medium_name: string | null;
  style_name: string | null;
  domestic_price: number | null;
  domestic_currency: string | null;
  export_price: number | null;
  colors: ColorItem[] | null;
  tags: string[] | null;
  image_thumbnail_filename: string | null;
  image_mid_res_filename: string | null;
  image_full_res_filename: string | null;
  framed: boolean | null;
}

export interface RelatedPainting {
  id: string;
  title: string | null;
  image_thumbnail_filename: string | null;
  artist_name: string | null;
}

export interface PaginatedPaintings {
  items: PaintingListItem[];
  total: number;
  page: number;
  pages: number;
}
