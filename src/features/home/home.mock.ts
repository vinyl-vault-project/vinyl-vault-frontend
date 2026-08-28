import aphexArtist from '../../assets/vinyl-vault/aphex-twin-artist.png';
import aphexTwinLogo from '../../assets/vinyl-vault/aphex-twin-logo-white.png';
import autechreArtist from '../../assets/vinyl-vault/autechre-artist-full.jpg';
import boardsArtistModal from '../../assets/vinyl-vault/boards-of-canada-modal-artist.png';
import boardsArtist from '../../assets/vinyl-vault/boards-of-canada-artist.png';
import djShadowArtist from '../../assets/vinyl-vault/dj-shadow-artist.png';
import drukqsOfficialWarpCdBooklet from '../../assets/vinyl-vault/drukqs-official-warp-cd-booklet.png';
import drukqsAnniversaryVinylDisplay from '../../assets/vinyl-vault/drukqs-anniversary-vinyl-display.png';
import heroBackground from '../../assets/vinyl-vault/hero-background.png';
import warpRecordsLogo from '../../assets/vinyl-vault/warp-records-logo-white.png';
import {
  getAlbumsByIds,
  homeAlbumOfTheWeekIds,
  homeRecommendedAlbumIds,
} from '../../data/albums';
import type { ArtistDetails, HomePageData } from './home.types';

export const homePageMockData: HomePageData = {
  heroPromotions: [
    {
      id: 'drukqs-anniversary',
      brandLogos: [
        {
          id: 'aphex-twin',
          src: aphexTwinLogo,
          alt: 'Aphex Twin',
        },
        {
          id: 'warp-records',
          src: warpRecordsLogo,
          alt: 'Warp Records',
        },
      ],
      title: 'Drukqs - 25th Anniversary Reissue',
      releaseLine: 'Out 30 October 2026',
      description:
        "Aphex Twin's landmark 2001 album returns to vinyl in a special 4xLP anniversary edition",
      ctaLabel: 'Go to album',
      albumSlug: 'drukqs-2001',
      backgroundSrc: heroBackground,
      slides: [
        {
          id: 'anniversary-vinyl-display',
          imageSrc: drukqsAnniversaryVinylDisplay,
          imageAlt: 'Drukqs anniversary edition cover art with vinyl record',
        },
        {
          id: 'official-warp-cd-booklet',
          imageSrc: drukqsOfficialWarpCdBooklet,
          imageAlt: 'Official Warp CD booklet and discs for Drukqs',
        },
      ],
    },
  ],
  albumsOfTheWeek: getAlbumsByIds(homeAlbumOfTheWeekIds),
  featuredArtists: [
    {
      id: 'aphex-twin',
      slug: 'aphex-twin',
      name: 'Aphex Twin',
      imageSrc: aphexArtist,
      imageAlt: 'Portrait of Aphex Twin',
      width: 'medium',
      hasDetails: true,
    },
    {
      id: 'boards-of-canada',
      slug: 'boards-of-canada',
      name: 'Boards of Canada',
      imageSrc: boardsArtist,
      imageAlt: 'Boards of Canada artist photo',
      width: 'wide',
      hasDetails: true,
    },
    {
      id: 'dj-shadow',
      slug: 'dj-shadow',
      name: 'DJ Shadow',
      imageSrc: djShadowArtist,
      imageAlt: 'DJ Shadow artist photo',
      width: 'narrow',
      hasDetails: true,
    },
    {
      id: 'autechre',
      slug: 'autechre',
      name: 'Autechre',
      imageSrc: autechreArtist,
      imageAlt: 'Autechre artist photo',
      width: 'narrow',
      hasDetails: true,
    },
  ],
  recommendedAlbums: getAlbumsByIds(homeRecommendedAlbumIds),
};

export const artistDetailsMockData: ArtistDetails[] = [
  {
    id: 'aphex-twin',
    slug: 'aphex-twin',
    name: 'Aphex Twin',
    imageSrc: aphexArtist,
    imageAlt: 'Portrait of Aphex Twin',
    biography:
      'Aphex Twin is the main recording alias of Richard D. James, a British electronic musician known for reshaping ambient techno, acid, IDM and experimental electronic music. His catalog moves between delicate melodic sketches, distorted drum programming and disorienting sound design, making records like Selected Ambient Works 85-92, Come to Daddy and Drukqs enduring reference points for electronic music collectors.',
    albums: getAlbumsByIds([
      'drukqs',
      'come-to-daddy',
      'selected-ambient-works-85-92',
      'selected-ambient-works-volume-2',
      'syro',
    ]),
  },
  {
    id: 'boards-of-canada',
    slug: 'boards-of-canada',
    name: 'Boards of Canada',
    imageSrc: boardsArtistModal,
    imageAlt: 'Boards of Canada electronic music duo',
    biography:
      "Boards of Canada are a Scottish electronic duo formed by brothers Michael Sandison and Marcus Eoin. Their name was inspired by the National Film Board of Canada, whose old educational films helped shape the faded, dreamlike character of their music. Blending analogue synthesizers, worn tape textures, hip-hop-influenced rhythms and fragmented voices, the duo creates music that feels nostalgic, beautiful and quietly unsettling. Their landmark 1998 album Music Has the Right to Children established their unmistakable sound, followed by Geogaddi, The Campfire Headphase and the darker, cinematic Tomorrow's Harvest. After thirteen years without a studio album, Boards of Canada returned in 2026 with Inferno.",
    albums: getAlbumsByIds([
      'inferno',
      'tomorrows-harvest',
      'geogaddi',
      'music-has-the-right-to-children',
    ]),
  },
  {
    id: 'autechre',
    slug: 'autechre',
    name: 'Autechre',
    imageSrc: autechreArtist,
    imageAlt: 'Autechre artist portrait',
    biography:
      'Autechre are the Manchester electronic duo Rob Brown and Sean Booth. Their work is associated with Warp Records and a precise, exploratory approach to rhythm, texture and synthesis. Early albums such as Incunabula, Amber and Tri Repetae helped define a colder, more architectural side of 1990s electronic music while still keeping a strong sense of movement and atmosphere.',
    albums: getAlbumsByIds(['incunabula', 'tri-repetae', 'amber']),
  },
  {
    id: 'dj-shadow',
    slug: 'dj-shadow',
    name: 'DJ Shadow',
    imageSrc: djShadowArtist,
    imageAlt: 'DJ Shadow artist photo',
    biography:
      'DJ Shadow is an American producer and DJ whose sample-based records connect hip-hop, turntablism, funk, psych and cinematic electronic music. Endtroducing..... became a landmark for dense vinyl sampling and atmospheric beat construction, followed by later records that continued to push between crate-digging culture and widescreen production.',
    albums: getAlbumsByIds([
      'endtroducing',
      'the-private-press',
      'the-less-you-know-the-better',
    ]),
  },
];
