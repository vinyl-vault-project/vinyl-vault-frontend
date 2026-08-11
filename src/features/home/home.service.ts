import { artistDetailsMockData, homePageMockData } from './home.mock';
import { getAlbumsByIds, searchResultAlbumIds } from '../../data/albums';
import type { AlbumSummary, ArtistDetails, HomePageData } from './home.types';

export async function getHomePageData(): Promise<HomePageData> {
  return homePageMockData;
}

export async function getArtistDetailsBySlug(
  slug: string,
): Promise<ArtistDetails | null> {
  return artistDetailsMockData.find((artist) => artist.slug === slug) ?? null;
}

export async function getSearchResultAlbums(): Promise<AlbumSummary[]> {
  return getAlbumsByIds(searchResultAlbumIds);
}
