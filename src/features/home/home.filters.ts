import type { AlbumSummary } from './home.types';

export type FilterOptionId = string;

export interface FilterOption {
  id: FilterOptionId;
  label: string;
  count: number;
}

export interface CatalogFilters {
  countries: FilterOptionId[];
  fromYear: number;
  genres: FilterOptionId[];
  styles: FilterOptionId[];
  toYear: number;
}

export const yearOptions = [1989, 1993, 1998, 2001, 2005, 2011, 2013, 2026];

export const countryOptions: FilterOption[] = [
  { id: 'us', label: 'US', count: 42 },
  { id: 'uk', label: 'UK', count: 18 },
  { id: 'germany', label: 'Germany', count: 24 },
  { id: 'japan', label: 'Japan', count: 9 },
];

export const genreOptions: FilterOption[] = [
  { id: 'electronic', label: 'Electronic', count: 128 },
  { id: 'hip-hop', label: 'Hip Hop', count: 67 },
  { id: 'rock', label: 'Rock', count: 73 },
  { id: 'jazz', label: 'Jazz', count: 51 },
  { id: 'pop', label: 'Pop', count: 23 },
  { id: 'classical', label: 'Classical', count: 58 },
];

export const styleOptions: FilterOption[] = [
  { id: 'idm', label: 'IDM', count: 114 },
  { id: 'ambient', label: 'Ambient', count: 93 },
  { id: 'techno', label: 'Techno', count: 76 },
  { id: 'downtempo', label: 'Downtempo', count: 83 },
  { id: 'instrumental-hip-hop', label: 'Instrumental Hip Hop', count: 54 },
  { id: 'trip-hop', label: 'Trip Hop', count: 49 },
];

export const defaultCatalogFilters: CatalogFilters = {
  countries: [],
  fromYear: 1989,
  genres: [],
  styles: [],
  toYear: 2026,
};

export function filterAlbumsByCatalogState(
  albums: AlbumSummary[],
  filters: CatalogFilters,
) {
  return albums.filter((album) => {
    const metadata = album.filterMetadata;
    const isWithinYearRange =
      metadata.releaseYear >= filters.fromYear &&
      metadata.releaseYear <= filters.toYear;
    const hasCountry = hasSelectedValue(metadata.countries, filters.countries);
    const hasGenre = hasSelectedValue(metadata.genres, filters.genres);
    const hasStyle = hasSelectedValue(metadata.styles, filters.styles);

    return isWithinYearRange && hasCountry && hasGenre && hasStyle;
  });
}

function hasSelectedValue(values: string[], selectedValues: string[]) {
  if (selectedValues.length === 0) {
    return true;
  }

  return values.some((value) => selectedValues.includes(value));
}
