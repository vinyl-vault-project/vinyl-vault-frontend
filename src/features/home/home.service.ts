import { artistDetailsMockData, homePageMockData } from './home.mock';
import type { ArtistDetails, HomePageData } from './home.types';

export async function getHomePageData(): Promise<HomePageData> {
  return homePageMockData;
}

export async function getArtistDetailsBySlug(
  slug: string,
): Promise<ArtistDetails | null> {
  return artistDetailsMockData.find((artist) => artist.slug === slug) ?? null;
}
