import aphexTwinComeToDaddyCover from '../assets/vinyl-vault/aphex-twin-come-to-daddy.png';
import aphexTwinDrukqsCover from '../assets/vinyl-vault/aphex-twin-drukqs.png';
import aphexTwinSelectedAmbientWorksCover from '../assets/vinyl-vault/aphex-twin-selected-ambient-works-85-92.png';
import aphexTwinSelectedAmbientWorksVolumeTwoCover from '../assets/vinyl-vault/aphex-twin-selected-ambient-works-volume-2.png';
import aphexTwinSyroCover from '../assets/vinyl-vault/aphex-twin-syro.png';
import autechreAmberCover from '../assets/vinyl-vault/autechre-amber.png';
import autechreIncunabulaCover from '../assets/vinyl-vault/autechre-incunabula.png';
import autechreTriRepetaeCover from '../assets/vinyl-vault/autechre-tri-repetae.png';
import boardsOfCanadaGeogaddiCover from '../assets/vinyl-vault/boards-of-canada-geogaddi.png';
import boardsOfCanadaInfernoCover from '../assets/vinyl-vault/boards-of-canada-inferno.png';
import boardsOfCanadaMusicHasTheRightCover from '../assets/vinyl-vault/boards-of-canada-music-has-the-right-to-children.png';
import boardsOfCanadaTomorrowsHarvestCover from '../assets/vinyl-vault/boards-of-canada-tomorrows-harvest.png';
import djShadowThePrivatePressCover from '../assets/vinyl-vault/dj-shadow-the-private-press.png';
import placeholderCover from '../assets/vinyl-vault/album-placeholder.svg';
import type { AlbumSummary } from '../features/home/home.types';

const aphexTwinFilterMetadata = {
  countries: ['uk', 'us'],
  genres: ['electronic', 'hip-hop'],
  styles: ['idm', 'ambient', 'trip-hop'],
};

const boardsOfCanadaFilterMetadata = {
  countries: ['uk', 'us'],
  genres: ['electronic', 'hip-hop'],
  styles: ['ambient', 'downtempo', 'trip-hop'],
};

const autechreFilterMetadata = {
  countries: ['uk', 'us'],
  genres: ['electronic', 'hip-hop'],
  styles: ['idm', 'techno', 'trip-hop'],
};

const djShadowFilterMetadata = {
  countries: ['us'],
  genres: ['electronic', 'hip-hop'],
  styles: ['instrumental-hip-hop', 'downtempo', 'trip-hop'],
};

export const albums: AlbumSummary[] = [
  {
    id: 'selected-ambient-works-85-92',
    slug: 'selected-ambient-works-85-92',
    artistSlug: 'aphex-twin',
    artist: 'Aphex Twin',
    title: 'Selected Ambient Works 85-92',
    coverSrc: aphexTwinSelectedAmbientWorksCover,
    coverAlt: 'Aphex Twin - Selected Ambient Works 85-92 album cover',
    filterMetadata: {
      ...aphexTwinFilterMetadata,
      releaseYear: 1992,
    },
  },
  {
    id: 'come-to-daddy',
    slug: 'come-to-daddy',
    artistSlug: 'aphex-twin',
    artist: 'Aphex Twin',
    title: 'Come to Daddy',
    coverSrc: aphexTwinComeToDaddyCover,
    coverAlt: 'Aphex Twin - Come to Daddy album cover',
    filterMetadata: {
      ...aphexTwinFilterMetadata,
      releaseYear: 1997,
    },
  },
  {
    id: 'drukqs',
    slug: 'drukqs',
    artistSlug: 'aphex-twin',
    artist: 'Aphex Twin',
    title: 'Drukqs',
    coverSrc: aphexTwinDrukqsCover,
    coverAlt: 'Aphex Twin - Drukqs album cover',
    filterMetadata: {
      ...aphexTwinFilterMetadata,
      releaseYear: 2001,
    },
  },
  {
    id: 'tomorrows-harvest',
    slug: 'tomorrows-harvest',
    artistSlug: 'boards-of-canada',
    artist: 'Boards of Canada',
    title: "Tomorrow's Harvest",
    coverSrc: boardsOfCanadaTomorrowsHarvestCover,
    coverAlt: "Boards of Canada - Tomorrow's Harvest album cover",
    filterMetadata: {
      ...boardsOfCanadaFilterMetadata,
      releaseYear: 2013,
    },
  },
  {
    id: 'music-has-the-right-to-children',
    slug: 'music-has-the-right-to-children',
    artistSlug: 'boards-of-canada',
    artist: 'Boards of Canada',
    title: 'Music Has the Right to Children',
    coverSrc: boardsOfCanadaMusicHasTheRightCover,
    coverAlt: 'Boards of Canada - Music Has the Right to Children album cover',
    filterMetadata: {
      ...boardsOfCanadaFilterMetadata,
      releaseYear: 1998,
    },
  },
  {
    id: 'geogaddi',
    slug: 'geogaddi',
    artistSlug: 'boards-of-canada',
    artist: 'Boards of Canada',
    title: 'Geogaddi',
    coverSrc: boardsOfCanadaGeogaddiCover,
    coverAlt: 'Boards of Canada - Geogaddi album cover',
    filterMetadata: {
      ...boardsOfCanadaFilterMetadata,
      releaseYear: 2002,
    },
  },
  {
    id: 'tri-repetae',
    slug: 'tri-repetae',
    artistSlug: 'autechre',
    artist: 'Autechre',
    title: 'Tri Repetae',
    coverSrc: autechreTriRepetaeCover,
    coverAlt: 'Autechre - Tri Repetae album cover',
    filterMetadata: {
      ...autechreFilterMetadata,
      releaseYear: 1995,
    },
  },
  {
    id: 'incunabula',
    slug: 'incunabula',
    artistSlug: 'autechre',
    artist: 'Autechre',
    title: 'Incunabula',
    coverSrc: autechreIncunabulaCover,
    coverAlt: 'Autechre - Incunabula album cover',
    filterMetadata: {
      ...autechreFilterMetadata,
      releaseYear: 1993,
    },
  },
  {
    id: 'the-private-press',
    slug: 'the-private-press',
    artistSlug: 'dj-shadow',
    artist: 'DJ Shadow',
    title: 'The Private Press',
    coverSrc: djShadowThePrivatePressCover,
    coverAlt: 'DJ Shadow - The Private Press album cover',
    filterMetadata: {
      ...djShadowFilterMetadata,
      releaseYear: 2002,
    },
  },
  {
    id: 'selected-ambient-works-volume-2',
    slug: 'selected-ambient-works-volume-2',
    artistSlug: 'aphex-twin',
    artist: 'Aphex Twin',
    title: 'Selected Ambient Works Volume II',
    coverSrc: aphexTwinSelectedAmbientWorksVolumeTwoCover,
    coverAlt: 'Aphex Twin - Selected Ambient Works Volume II album cover',
    filterMetadata: {
      ...aphexTwinFilterMetadata,
      releaseYear: 1994,
    },
  },
  {
    id: 'syro',
    slug: 'syro',
    artistSlug: 'aphex-twin',
    artist: 'Aphex Twin',
    title: 'Syro',
    coverSrc: aphexTwinSyroCover,
    coverAlt: 'Aphex Twin - Syro album cover',
    filterMetadata: {
      ...aphexTwinFilterMetadata,
      releaseYear: 2014,
    },
  },
  {
    id: 'inferno',
    slug: 'inferno',
    artistSlug: 'boards-of-canada',
    artist: 'Boards of Canada',
    title: 'Inferno',
    coverSrc: boardsOfCanadaInfernoCover,
    coverAlt: 'Boards of Canada - Inferno album cover',
    filterMetadata: {
      ...boardsOfCanadaFilterMetadata,
      releaseYear: 2026,
    },
  },
  {
    id: 'amber',
    slug: 'amber',
    artistSlug: 'autechre',
    artist: 'Autechre',
    title: 'Amber',
    coverSrc: autechreAmberCover,
    coverAlt: 'Autechre - Amber album cover',
    filterMetadata: {
      ...autechreFilterMetadata,
      releaseYear: 1994,
    },
  },
  {
    id: 'endtroducing',
    slug: 'endtroducing',
    artistSlug: 'dj-shadow',
    artist: 'DJ Shadow',
    title: 'Endtroducing.....',
    coverSrc: placeholderCover,
    coverAlt: 'Placeholder cover for DJ Shadow - Endtroducing.....',
    isPlaceholder: true,
    filterMetadata: {
      ...djShadowFilterMetadata,
      releaseYear: 1996,
    },
  },
  {
    id: 'the-less-you-know-the-better',
    slug: 'the-less-you-know-the-better',
    artistSlug: 'dj-shadow',
    artist: 'DJ Shadow',
    title: 'The Less You Know, the Better',
    coverSrc: placeholderCover,
    coverAlt: 'Placeholder cover for DJ Shadow - The Less You Know, the Better',
    isPlaceholder: true,
    filterMetadata: {
      ...djShadowFilterMetadata,
      releaseYear: 2011,
    },
  },
];

export const homeAlbumOfTheWeekIds = [
  'drukqs',
  'come-to-daddy',
  'selected-ambient-works-85-92',
  'tomorrows-harvest',
  'music-has-the-right-to-children',
  'geogaddi',
] as const;

export const homeRecommendedAlbumIds = [
  'incunabula',
  'tri-repetae',
  'amber',
  'endtroducing',
  'the-private-press',
  'the-less-you-know-the-better',
] as const;

export const searchResultAlbumIds = [
  'selected-ambient-works-85-92',
  'come-to-daddy',
  'drukqs',
  'tomorrows-harvest',
  'music-has-the-right-to-children',
  'geogaddi',
  'tri-repetae',
  'incunabula',
  'the-private-press',
  'selected-ambient-works-volume-2',
  'syro',
  'inferno',
  'amber',
] as const;

export function getAlbumsByIds(ids: readonly string[]): AlbumSummary[] {
  return ids
    .map((id) => albums.find((album) => album.id === id))
    .filter((album): album is AlbumSummary => Boolean(album));
}
