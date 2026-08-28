import { apiGet } from './client';
import type {
  ArtistDto,
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
export const getGenres = () => apiGet<PaginatedDto<NamedDto>>('/genres/');
export const getStyles = () => apiGet<PaginatedDto<NamedDto>>('/styles/');
export const getArtist = (slug: string) =>
  apiGet<ArtistDto>(`/artists/${encodeURIComponent(slug)}/`);
