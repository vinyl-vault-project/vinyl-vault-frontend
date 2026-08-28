import { apiDelete, apiGet, apiPost } from './client';
import type { PaginatedDto, SavedReleaseDto } from './api.types';
export const getSaved = () =>
  apiGet<PaginatedDto<SavedReleaseDto> | SavedReleaseDto[]>('/saved/');
export const saveRelease = (release_id: number | string) =>
  apiPost<SavedReleaseDto>('/saved/', { release_id });
export const deleteSaved = (id: number | string) => apiDelete(`/saved/${id}/`);
