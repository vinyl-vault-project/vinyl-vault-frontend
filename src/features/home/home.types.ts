export interface AlbumSummary {
  id: string;
  slug: string;
  artistSlug: string;
  artist: string;
  title: string;
  coverSrc: string;
  coverAlt: string;
  isPlaceholder?: boolean;
}

export interface FeaturedArtist {
  id: string;
  slug: string;
  name: string;
  imageSrc: string;
  imageAlt: string;
  width: 'wide' | 'medium' | 'narrow';
  hasDetails: boolean;
}

export interface HeroPromotion {
  id: string;
  eyebrowMarks: Array<'aphex' | 'warp'>;
  title: string;
  releaseLine: string;
  description: string;
  ctaLabel: string;
  albumSlug: string;
  backgroundSrc: string;
  artworkSrc: string;
  artworkAlt: string;
}

export interface HomePageData {
  heroPromotions: HeroPromotion[];
  albumsOfTheWeek: AlbumSummary[];
  featuredArtists: FeaturedArtist[];
  recommendedAlbums: AlbumSummary[];
}

export interface ArtistDetails {
  id: string;
  slug: string;
  name: string;
  imageSrc: string;
  imageAlt: string;
  biography: string;
  albums: AlbumSummary[];
}
