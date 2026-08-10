export interface AlbumSummary {
  id: string;
  slug: string;
  artistSlug: string;
  artist: string;
  title: string;
  coverSrc: string;
  coverAlt: string;
  isPlaceholder?: boolean;
  filterMetadata: AlbumFilterMetadata;
}

export interface AlbumFilterMetadata {
  countries: string[];
  genres: string[];
  releaseYear: number;
  styles: string[];
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
  brandLogos: HeroBrandLogo[];
  title: string;
  releaseLine: string;
  description: string;
  ctaLabel: string;
  albumSlug: string;
  backgroundSrc: string;
  slides: HeroSlide[];
}

export interface HeroBrandLogo {
  id: string;
  src: string;
  alt: string;
}

export interface HeroSlide {
  id: string;
  imageSrc: string;
  imageAlt: string;
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
