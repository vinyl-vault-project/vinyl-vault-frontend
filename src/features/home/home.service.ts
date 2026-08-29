import albumPlaceholder from '../../assets/vinyl-vault/album-placeholder.svg';
import {
  getArtist,
  getRelease,
  getReleases,
  type ReleaseQuery,
} from '../../api/catalog.api';
import type { ReleaseDto } from '../../api/api.types';
import type { AlbumDetail } from '../../data/albumDetails';
import { artistDetailsMockData, homePageMockData } from './home.mock';
import type { AlbumSummary, ArtistDetails, HomePageData } from './home.types';

export async function getHomePageData(
  query: ReleaseQuery = {},
): Promise<HomePageData> {
  const response = await getReleases({ ...query, ordering: '-release_year' });
  const albums = response.results.map(mapRelease);
  return {
    heroPromotions: homePageMockData.heroPromotions,
    albumsOfTheWeek: albums.slice(0, 8),
    featuredArtists: homePageMockData.featuredArtists,
    recommendedAlbums: albums.slice(8, 16),
  };
}

export async function getArtistDetailsBySlug(
  slug: string,
): Promise<ArtistDetails | null> {
  const artist = await getArtist(slug);
  const presentationFallback = artistDetailsMockData.find(
    (item) => item.slug === slug,
  );

  return {
    id: String(artist.id),
    slug: artist.slug,
    name: artist.name,
    imageSrc: artist.image_url || presentationFallback?.imageSrc || '',
    imageAlt: `${artist.name} portrait`,
    biography: artist.biography || presentationFallback?.biography || '',
    albums: artist.releases.map(mapRelease),
  };
}

export async function getSearchResultAlbums(query: ReleaseQuery = {}): Promise<{
  albums: AlbumSummary[];
  count: number;
  next: string | null;
  previous: string | null;
}> {
  const response = await getReleases(query);
  return {
    albums: response.results.map(mapRelease),
    count: response.count,
    next: response.next,
    previous: response.previous,
  };
}

export async function getAlbumDetail(
  slug: string,
): Promise<AlbumDetail | null> {
  const release = await getRelease(slug);
  const activeProducts = release.products.filter(
    (product) => product.is_active,
  );
  const product = activeProducts[0];
  return {
    album: mapRelease(release),
    description: release.description || '',
    tracks: release.tracks.map((track) => ({
      id: String(track.id),
      number: track.position ?? 0,
      side: track.side || 'Other',
      title: track.title,
      duration: formatDuration(track.duration_seconds),
      audioSrc: isDirectAudioUrl(track.audio_preview_url)
        ? track.audio_preview_url || undefined
        : undefined,
      previewUrl: track.audio_preview_url || undefined,
    })),
    relatedAlbums: [],
    product: {
      id: product?.id ?? '',
      pressingCountry: product?.pressing_country || '',
      genre: mapNames(release.genres),
      style: mapNames(release.styles),
      price: product ? Number(product.price) : 0,
      availability:
        product && product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock',
    },
    products: activeProducts.map((item) => ({
      id: item.id,
      pressingCountry: item.pressing_country || '',
      price: Number(item.price),
      availability:
        item.stock_quantity > 0
          ? ('in-stock' as const)
          : ('out-of-stock' as const),
    })),
    assets: {
      bookmarkIcon: '',
      heroBackground: '',
      descriptionBackground: '',
      purchaseBackground: '',
      detailsImage: release.cover_url || albumPlaceholder,
      detailsImageAlt: release.title,
    },
  };
}

export function formatDuration(seconds: number | null) {
  const total = Math.max(0, seconds ?? 0);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
function isDirectAudioUrl(url: string | null) {
  if (!url) return false;
  try {
    return /\.(aac|m4a|mp3|ogg|opus|wav)$/i.test(new URL(url).pathname);
  } catch {
    return false;
  }
}
export function mapRelease(release: ReleaseDto): AlbumSummary {
  const artist = release.artists[0];
  return {
    id: String(release.id),
    slug: release.slug,
    artistSlug: artist?.slug || '',
    artist: artist?.name || 'Unknown artist',
    title: release.title,
    coverSrc: release.cover_url || albumPlaceholder,
    coverAlt: `${release.title} cover`,
    isPlaceholder: !release.cover_url,
    filterMetadata: {
      countries: release.country ? [release.country] : [],
      genres: mapNames(release.genres),
      releaseYear: release.release_year ?? 0,
      styles: mapNames(release.styles),
    },
  };
}
function mapNames(values: ReleaseDto['genres']) {
  return (values ?? []).map((value) =>
    typeof value === 'string' ? value : value.name,
  );
}
