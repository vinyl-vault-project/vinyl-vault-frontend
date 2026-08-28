import albumBookmarkIcon from '../assets/vinyl-vault/album-bookmark.svg';
import brownTextureBackground from '../assets/vinyl-vault/album-page-brown-texture-background.png';
import glowingLightBackground from '../assets/vinyl-vault/album-page-glowing-light-background.png';
import pianoMechanismBackground from '../assets/vinyl-vault/album-page-piano-mechanism-background.png';
import drukqsCassetteInlays from '../assets/vinyl-vault/aphex-twin-drukqs-cassette-inlays.png';
import jynweythekPreview from '../assets/vinyl-vault/aphex-twin-jynweythek-preview.mp3';
import vordhosbnPreview from '../assets/vinyl-vault/aphex-twin-vordhosbn-preview.mp3';
import { albums, getAlbumsByIds } from './albums';
import type { AlbumSummary } from '../features/home/home.types';

export interface AlbumTrack {
  id: string;
  number: number;
  title: string;
  duration: string;
  audioSrc?: string;
  side?: string;
}

export type AlbumAvailability = 'in-stock' | 'out-of-stock';

export interface AlbumProductDetails {
  id?: number | string;
  pressingCountry: string;
  genre: string[];
  style: string[];
  price: number;
  availability: AlbumAvailability;
  label?: string;
  currency?: string;
  format?: string;
}

export interface AlbumPageAssets {
  bookmarkIcon: string;
  heroBackground: string;
  descriptionBackground: string;
  purchaseBackground: string;
  detailsImage: string;
  detailsImageAlt: string;
}

export interface AlbumDetail {
  album: AlbumSummary;
  description: string;
  product: AlbumProductDetails;
  products?: Array<
    Pick<
      AlbumProductDetails,
      'id' | 'pressingCountry' | 'price' | 'availability'
    >
  >;
  tracks: AlbumTrack[];
  relatedAlbums: AlbumSummary[];
  assets: AlbumPageAssets;
}

const albumPageAssets: AlbumPageAssets = {
  bookmarkIcon: albumBookmarkIcon,
  heroBackground: pianoMechanismBackground,
  descriptionBackground: glowingLightBackground,
  purchaseBackground: brownTextureBackground,
  detailsImage: drukqsCassetteInlays,
  detailsImageAlt: 'Aphex Twin Drukqs cassette inlays and cassette shells',
};

const drukqsTracks: AlbumTrack[] = [
  {
    id: 'jynweythek',
    number: 1,
    title: 'Jynweythek',
    duration: '2:23',
    audioSrc: jynweythekPreview,
  },
  {
    id: 'vordhosbn',
    number: 2,
    title: 'Vordhosbn',
    duration: '4:51',
    audioSrc: vordhosbnPreview,
  },
  {
    id: 'kladfvgbung-micshk',
    number: 3,
    title: 'Kladfvgbung Micshk',
    duration: '2:06',
  },
  {
    id: 'omgyjya-switch7',
    number: 4,
    title: 'Omgyjya-Switch7',
    duration: '4:52',
  },
  {
    id: 'strotha-tynhe',
    number: 5,
    title: 'Strotha Tynhe',
    duration: '2:12',
  },
  {
    id: 'gwely-mernans',
    number: 6,
    title: 'Gwely Mernans',
    duration: '5:08',
  },
  {
    id: 'bbydhyonchord',
    number: 7,
    title: 'Bbydhyonchord',
    duration: '2:33',
  },
  { id: 'cock-ver10', number: 8, title: 'Cock/ver10', duration: '5:18' },
  { id: 'avril-14th', number: 9, title: 'Avril 14th', duration: '2:05' },
  {
    id: 'mt-saint-michel-saint-michaels-mount',
    number: 10,
    title: 'Mt Saint Michel + Saint Michaels Mount',
    duration: '8:10',
  },
];

const drukqs = albums.find((album) => album.id === 'drukqs');

export const albumDetails: AlbumDetail[] = drukqs
  ? [
      {
        album: drukqs,
        description:
          "Originally released by Warp in October 2001, Drukqs remains one of Aphex Twin's most expansive and uncompromising works. Across 30 tracks, Richard D. James moves between ferocious, intricately programmed electronics and intimate electroacoustic pieces built around prepared piano, Disklavier and harmonium. James later said the album was accelerated into release after he misplaced an MP3 player containing hundreds of unreleased tracks while travelling to a performance. Initially divisive, Drukqs has since grown into a fan favourite, with tracks such as Avril 14th, Vordhosbn and QKThr finding entirely new audiences. The 25th Anniversary Edition returns this landmark album to physical formats, preserving its collision of mechanical precision, acoustic fragility and controlled chaos.",
        product: {
          pressingCountry: 'United Kingdom',
          genre: ['Electronic'],
          style: ['IDM', 'Ambient', 'Experimental'],
          label: 'Warp Records',
          price: 45,
          currency: 'USD',
          format: 'Vinyl',
          availability: 'in-stock',
        },
        tracks: drukqsTracks,
        relatedAlbums: getAlbumsByIds([
          'come-to-daddy',
          'selected-ambient-works-85-92',
          'syro',
          'selected-ambient-works-volume-2',
        ]),
        assets: albumPageAssets,
      },
    ]
  : [];

export function getAlbumDetailBySlug(slug: string): AlbumDetail | null {
  const explicitDetail = albumDetails.find(
    (detail) => detail.album.slug === slug || detail.album.id === slug,
  );

  if (explicitDetail) {
    return explicitDetail;
  }

  const album = albums.find((currentAlbum) => currentAlbum.slug === slug);

  if (!album) {
    return null;
  }

  return {
    album,
    description:
      'Detailed release notes are being prepared for this album. Product information is based on the current Vinyl Vault catalog data.',
    product: {
      pressingCountry: 'United Kingdom',
      genre: album.filterMetadata.genres,
      style: album.filterMetadata.styles,
      label: 'Warp Records',
      price: 45,
      currency: 'USD',
      format: 'Vinyl',
      availability: 'in-stock',
    },
    tracks: [],
    relatedAlbums: albums
      .filter(
        (relatedAlbum) =>
          relatedAlbum.artistSlug === album.artistSlug &&
          relatedAlbum.id !== album.id,
      )
      .slice(0, 4),
    assets: {
      ...albumPageAssets,
      detailsImage: album.coverSrc,
      detailsImageAlt: album.coverAlt,
    },
  };
}
