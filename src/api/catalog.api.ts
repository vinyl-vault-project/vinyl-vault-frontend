import { apiGet } from './client';
import type {
  ArtistDto,
  CatalogFiltersDto,
  NamedDto,
  PaginatedDto,
  ReleaseDetailDto,
  ReleaseDto,
} from './api.types';
export interface ReleaseQuery {
  search?: string;
  artist?: string;
  country?: string[];
  genre?: string[];
  style?: string[];
  year_from?: number;
  year_to?: number;
  ordering?: string;
  page?: number;
}
export function getReleases(query: ReleaseQuery = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value))
      value.forEach((entry) => params.append(key, entry));
    else if (value !== undefined && value !== '')
      params.set(key, String(value));
  });
  return apiGet<PaginatedDto<ReleaseDto>>(
    `/releases/${params.size ? `?${params}` : ''}`,
  );
}
export const getRelease = (slug: string) =>
  apiGet<ReleaseDetailDto>(`/releases/${encodeURIComponent(slug)}/`);
export const getCatalogFilters = () =>
  apiGet<CatalogFiltersDto>('/catalog/filters/');
export async function getGenres(): Promise<PaginatedDto<NamedDto>> {
  try {
    return await apiGet<PaginatedDto<NamedDto>>('/genres/');
  } catch {
    const releases = await getAllReleases();
    return namedOptionsFromValues(
      releases.flatMap((release) => release.genres),
    );
  }
}

export async function getStyles(): Promise<PaginatedDto<NamedDto>> {
  try {
    return await apiGet<PaginatedDto<NamedDto>>('/styles/');
  } catch {
    const releases = await getAllReleases();
    return namedOptionsFromValues(
      releases.flatMap((release) => release.styles),
    );
  }
}

let countriesPromise: Promise<PaginatedDto<NamedDto>> | null = null;
let allReleasesPromise: Promise<ReleaseDto[]> | null = null;

export function getCountries(): Promise<PaginatedDto<NamedDto>> {
  countriesPromise ??= loadCountriesFromReleases().catch((error) => {
    countriesPromise = null;
    throw error;
  });
  return countriesPromise;
}

async function loadCountriesFromReleases(): Promise<PaginatedDto<NamedDto>> {
  try {
    const filters = await getCatalogFilters();
    return namedOptionsFromValues(filters.countries);
  } catch {
    // The currently deployed API has no catalog-filters endpoint. Keep its
    // existing country query usable until the backend exposes pressing
    // countries as required by the MVP.
  }

  const releases = await getAllReleases();
  return namedOptionsFromValues(
    releases.flatMap((release) => [
      release.country,
      ...release.artists.map((artist) => artist.origin_country),
    ]),
  );
}

function namedOptionsFromValues(
  values: Array<string | NamedDto | null | undefined> = [],
): PaginatedDto<NamedDto> {
  const names = Array.from(
    new Set(
      values
        .map((value) => (typeof value === 'string' ? value : value?.name))
        .filter((name): name is string => Boolean(name)),
    ),
  ).sort((first, second) => first.localeCompare(second));

  return {
    count: names.length,
    next: null,
    previous: null,
    results: names.map((name, index) => ({
      id: index,
      name,
      slug: name,
    })),
  };
}

async function getAllReleases() {
  allReleasesPromise ??= loadAllReleases().catch((error) => {
    allReleasesPromise = null;
    throw error;
  });
  return allReleasesPromise;
}

async function loadAllReleases() {
  const firstPage = await getReleases({ page: 1 });
  if (!firstPage.next || firstPage.results.length === 0) {
    return firstPage.results;
  }

  const pageSize = firstPage.results.length;
  const pageCount = Math.ceil(firstPage.count / pageSize);
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(pageCount - 1, 0) }, (_, index) =>
      getReleases({ page: index + 2 }),
    ),
  );

  return [firstPage, ...remainingPages].flatMap((page) => page.results);
}
export const getArtist = (slug: string) =>
  apiGet<ArtistDto>(`/artists/${encodeURIComponent(slug)}/`);
