export type GeoTuple = [number, number];

export interface NormalizedWork {
  id: string;
  cn: string;
  title: string;
  city: string;
  cover: string;
  color: string;
  geo: GeoTuple | null;
  zoom: unknown;
  modified: unknown;
  pointsLength: number;
  imagesLength: number;
  litePoints: unknown[];
}

export interface NormalizedPoint {
  id: string;
  cn: string;
  name: string;
  image: string;
  ep: string;
  s: string;
  geo: GeoTuple;
  origin: string;
  originURL: string;
}

export interface ExportRow {
  key: string;
  work_id: string;
  work_cn: string;
  work_title: string;
  work_cover: string;
  point_id: string;
  point_cn: string;
  point_name: string;
  latitude: number;
  longitude: number;
  ep: string;
  time_seconds: string;
  image_url: string;
  origin: string;
  origin_url: string;
  anitabi_url: string;
  description: string;
}

export interface SearchIndexItem {
  id: string;
  cn: string;
  alias: string;
  title: string;
  city: string;
  cover: string;
  pointsLength: number;
  haystack: string;
}
