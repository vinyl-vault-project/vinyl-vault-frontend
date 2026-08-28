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
