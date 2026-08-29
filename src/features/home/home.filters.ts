export type FilterOptionId = string;

export interface FilterOption {
  id: FilterOptionId;
  label: string;
  count?: number;
}

export interface CatalogFilters {
  countries: FilterOptionId[];
  fromYear: number;
  genres: FilterOptionId[];
  styles: FilterOptionId[];
  toYear: number;
}

export const yearOptions = [1989, 1993, 1998, 2001, 2005, 2011, 2013, 2026];

export const defaultCatalogFilters: CatalogFilters = {
  countries: [],
  fromYear: 1989,
  genres: [],
  styles: [],
  toYear: 2026,
};

export function toReleaseQuery(filters: CatalogFilters) {
  return {
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
    countries: [],
    fromYear:
      fromYearValue && Number.isFinite(fromYear)
        ? fromYear
        : defaultCatalogFilters.fromYear,
    genres: searchParams.getAll('genre'),
    styles: searchParams.getAll('style'),
    toYear:
      toYearValue && Number.isFinite(toYear)
        ? toYear
        : defaultCatalogFilters.toYear,
  };
}

export function filtersToSearchParams(filters: CatalogFilters) {
  const searchParams = new URLSearchParams({
    year_from: String(filters.fromYear),
    year_to: String(filters.toYear),
  });

  filters.genres.forEach((genre) => searchParams.append('genre', genre));
  filters.styles.forEach((style) => searchParams.append('style', style));

  return searchParams;
}
