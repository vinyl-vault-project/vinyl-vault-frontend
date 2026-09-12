import albumPlaceholder from '../../assets/vinyl-vault/album-placeholder.svg';
import brownTextureBackground from '../../assets/vinyl-vault/album-page-brown-texture-background.png';
import glowingLightBackground from '../../assets/vinyl-vault/album-page-glowing-light-background.png';
import pianoMechanismBackground from '../../assets/vinyl-vault/album-page-piano-mechanism-background.png';
import drukqsCassetteInlays from '../../assets/vinyl-vault/aphex-twin-drukqs-cassette-inlays.png';
import {
  getArtist,
  getAllArtists,
  getRelease,
  getReleases,
  type ReleaseQuery,
} from '../../api/catalog.api';
import type { ArtistDto, ReleaseDto } from '../../api/api.types';
import type { AlbumDetail } from '../../data/albumDetails';
import { artistDetailsMockData, homePageMockData } from './home.mock';
import type {
  AlbumSummary,
  ArtistDetails,
  FeaturedArtist,
  HomePageData,
} from './home.types';

export async function getHomePageData(
  query: ReleaseQuery = {},
): Promise<HomePageData> {
  const [response, artistsResponse] = await Promise.all([
    getReleases({ ...query, ordering: '-release_year' }),
    getAllArtists(),
  ]);
  const albums = response.results
    .map(mapRelease)
    .sort(
      (first, second) =>
        second.filterMetadata.releaseYear - first.filterMetadata.releaseYear,
    );
  return {
    heroPromotions: homePageMockData.heroPromotions,
    albumsOfTheWeek: albums.slice(0, 6),
    featuredArtists: getFeaturedArtists(artistsResponse.results),
    recommendedAlbums: albums.slice(8, 14),
  };
}

function getFeaturedArtists(
  artists: Array<{
    id: number | string;
    image_url?: string | null;
    name: string;
    slug: string;
  }>,
): FeaturedArtist[] {
  const featuredArtists = artists
    .filter((artist) => hasUsableArtistImage(artist.image_url))
    .slice(0, 10)
    .map((artist, index): FeaturedArtist => ({
      id: String(artist.id),
      slug: artist.slug,
      name: artist.name,
      imageSrc: resolveImageUrl(artist.image_url ?? null, ''),
      imageAlt: `${artist.name} portrait`,
      width: index % 4 === 1 ? 'wide' : index % 4 === 2 ? 'narrow' : 'medium',
      hasDetails: true,
    }));

  return featuredArtists.length > 0
    ? featuredArtists
    : homePageMockData.featuredArtists;
}

function hasUsableArtistImage(imageUrl: string | null | undefined) {
  if (!imageUrl) return false;

  return !/(broken-vinyl|default|no[-_ ]?image|placeholder)/i.test(imageUrl);
}

export async function getArtistDetailsBySlug(
  slug: string,
): Promise<ArtistDetails | null> {
  const presentationFallback = artistDetailsMockData.find(
    (item) => item.slug === slug,
  );

  let artist: ArtistDto;
  try {
    artist = await getArtist(slug);
  } catch {
    return presentationFallback ?? null;
  }

  return {
    id: String(artist.id),
    slug: artist.slug,
    name: artist.name,
    imageSrc: resolveImageUrl(
      artist.image_url,
      presentationFallback?.imageSrc || '',
    ),
    imageAlt: `${artist.name} portrait`,
    biography: artist.biography || presentationFallback?.biography || '',
    albums: artist.releases.map(mapRelease),
  };
}

function resolveImageUrl(imageUrl: string | null, fallback: string) {
  if (!imageUrl) return fallback;

  try {
    return new URL(imageUrl).toString();
  } catch {
    const apiUrl = import.meta.env.VITE_API_URL;
    return apiUrl
      ? new URL(imageUrl, new URL(apiUrl).origin).toString()
      : imageUrl;
  }
}

export async function getSearchResultAlbums(query: ReleaseQuery = {}): Promise<{
  albums: AlbumSummary[];
  count: number;
  next: string | null;
  previous: string | null;
}> {
  const { country: countries = [], page = 1, ...releaseQuery } = query;

  if (countries.length > 0) {
    const { pageSize, releases } =
      await getAllSearchResultReleases(releaseQuery);
    const matchingReleases = releases.filter((release) =>
      releaseMatchesCountries(release, countries),
    );
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      albums: matchingReleases.slice(start, end).map(mapRelease),
      count: matchingReleases.length,
      next:
        end < matchingReleases.length ? createPaginationUrl(page + 1) : null,
      previous: page > 1 ? createPaginationUrl(page - 1) : null,
    };
  }

  const response = await getReleases(query);
  return {
    albums: response.results.map(mapRelease),
    count: response.count,
    next: response.next,
    previous: response.previous,
  };
}

async function getAllSearchResultReleases(query: ReleaseQuery) {
  const firstPage = await getReleases({ ...query, page: 1 });
  const pageSize = Math.max(firstPage.results.length, 1);

  if (!firstPage.next) {
    return { pageSize, releases: firstPage.results };
  }

  const pageCount = Math.ceil(firstPage.count / pageSize);
  const remainingPages = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, index) =>
      getReleases({ ...query, page: index + 2 }),
    ),
  );

  return {
    pageSize,
    releases: [firstPage, ...remainingPages].flatMap((page) => page.results),
  };
}

function releaseMatchesCountries(release: ReleaseDto, countries: string[]) {
  const selectedCountries = new Set(countries.map(normalizeCountry));
  const releaseCountries = [
    release.country,
    ...release.artists.map((artist) => artist.origin_country),
  ];

  return releaseCountries.some(
    (country) => country && selectedCountries.has(normalizeCountry(country)),
  );
}

function normalizeCountry(country: string) {
  return country.trim().toLocaleLowerCase();
}

function createPaginationUrl(page: number) {
  return `https://catalog.local/releases/?page=${page}`;
}

export async function getAlbumDetail(
  slug: string,
): Promise<AlbumDetail | null> {
  const release = await getRelease(slug);
  const primaryArtist = release.artists[0];
  const artistDetails = primaryArtist
    ? await getArtist(primaryArtist.slug).catch(() => null)
    : null;
  const relatedReleases = artistDetails?.releases.length
    ? artistDetails.releases
    : primaryArtist
      ? (
          await getReleases({ artist: primaryArtist.slug }).catch(() => ({
            results: [],
          }))
        ).results
      : [];
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
    relatedAlbums: relatedReleases
      .filter((item) => String(item.id) !== String(release.id))
      .map(mapRelease),
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
      heroBackground: pianoMechanismBackground,
      descriptionBackground: glowingLightBackground,
      purchaseBackground: brownTextureBackground,
      detailsImage: drukqsCassetteInlays,
      detailsImageAlt: 'Cassette inlays and cassette shells',
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
