export type FilterOptionId = string;

export interface FilterOption {
  id: FilterOptionId;
  label: string;
  count?: number;
}

export interface CatalogFilters {
  countries: FilterOptionId[];
  fromYear?: number;
  genres: FilterOptionId[];
  styles: FilterOptionId[];
  toYear?: number;
}

export const defaultCatalogFilters: CatalogFilters = {
  countries: [],
  genres: [],
  styles: [],
};

export function toReleaseQuery(filters: CatalogFilters) {
  return {
    country: filters.countries,
    genre: filters.genres,
    style: filters.styles,
    year_from: filters.fromYear,
    year_to: filters.toYear,
  };
}

export function filtersFromSearchParams(
  searchParams: URLSearchParams,
): CatalogFilters {
  const fromYearValue = searchParams.get('year_from');
  const toYearValue = searchParams.get('year_to');
  const fromYear = Number(fromYearValue);
  const toYear = Number(toYearValue);

  return {
    countries: searchParams.getAll('country'),
    fromYear: fromYearValue && Number.isFinite(fromYear) ? fromYear : undefined,
    genres: searchParams.getAll('genre'),
    styles: searchParams.getAll('style'),
    toYear: toYearValue && Number.isFinite(toYear) ? toYear : undefined,
  };
}

export function filtersToSearchParams(filters: CatalogFilters) {
  const searchParams = new URLSearchParams();

  if (filters.fromYear !== undefined) {
    searchParams.set('year_from', String(filters.fromYear));
  }

  if (filters.toYear !== undefined) {
    searchParams.set('year_to', String(filters.toYear));
  }

  filters.genres.forEach((genre) => searchParams.append('genre', genre));
  filters.styles.forEach((style) => searchParams.append('style', style));
  filters.countries.forEach((country) =>
    searchParams.append('country', country),
  );

  return searchParams;
}
