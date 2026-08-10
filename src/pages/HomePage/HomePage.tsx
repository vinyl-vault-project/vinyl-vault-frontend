import { type MouseEvent, useEffect, useRef, useState } from 'react';

import { Footer } from '../../components/layout/Footer/Footer';
import { Header } from '../../components/layout/Header/Header';
import { AlbumCollection } from '../../features/home/components/AlbumCollection/AlbumCollection';
import { ArtistDetailsModal } from '../../features/home/components/ArtistDetailsModal/ArtistDetailsModal';
import { FeaturedArtists } from '../../features/home/components/FeaturedArtists/FeaturedArtists';
import { HeroBanner } from '../../features/home/components/HeroBanner/HeroBanner';
import {
  getArtistDetailsBySlug,
  getHomePageData,
} from '../../features/home/home.service';
import type {
  ArtistDetails,
  HomePageData,
} from '../../features/home/home.types';

type HomePageStatus =
  | { state: 'loading' }
  | { state: 'ready'; data: HomePageData }
  | { state: 'error'; message: string };

export function HomePage() {
  const [status, setStatus] = useState<HomePageStatus>({ state: 'loading' });
  const [selectedArtistDetails, setSelectedArtistDetails] =
    useState<ArtistDetails | null>(null);
  const artistTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadHomePageData() {
      try {
        const data = await getHomePageData();

        if (isActive) {
          setStatus({ state: 'ready', data });
        }
      } catch {
        if (isActive) {
          setStatus({
            state: 'error',
            message: 'Home content could not be loaded.',
          });
        }
      }
    }

    void loadHomePageData();

    return () => {
      isActive = false;
    };
  }, []);

  async function handleArtistSelect(
    artistSlug: string,
    event: MouseEvent<HTMLElement>,
  ) {
    artistTriggerRef.current = event.currentTarget;
    const artistDetails = await getArtistDetailsBySlug(artistSlug);

    if (artistDetails) {
      setSelectedArtistDetails(artistDetails);
    }
  }

  function handleArtistModalClose() {
    setSelectedArtistDetails(null);
    window.requestAnimationFrame(() => {
      artistTriggerRef.current?.focus();
      artistTriggerRef.current = null;
    });
  }

  if (status.state === 'loading') {
    return (
      <main className="home-page">
        <Header />
        <section
          className="home-page__container home-page__status"
          aria-live="polite"
        >
          Loading home content...
        </section>
      </main>
    );
  }

  if (status.state === 'error') {
    return (
      <main className="home-page">
        <Header />
        <section
          className="home-page__container home-page__status"
          role="alert"
        >
          {status.message}
        </section>
      </main>
    );
  }

  return (
    <>
      <main className="home-page">
        <Header />
        <HeroBanner promotions={status.data.heroPromotions} />
        <AlbumCollection
          title="Albums of the week"
          albums={status.data.albumsOfTheWeek}
          onArtistSelect={(artistSlug, event) => {
            void handleArtistSelect(artistSlug, event);
          }}
        />
        <FeaturedArtists
          artists={status.data.featuredArtists}
          onArtistSelect={(artistSlug, event) => {
            void handleArtistSelect(artistSlug, event);
          }}
        />
        <AlbumCollection
          title="Recommended albums"
          albums={status.data.recommendedAlbums}
          onArtistSelect={(artistSlug, event) => {
            void handleArtistSelect(artistSlug, event);
          }}
        />
      </main>
      {selectedArtistDetails ? (
        <ArtistDetailsModal
          artist={selectedArtistDetails}
          onClose={handleArtistModalClose}
        />
      ) : null}
      <Footer />
    </>
  );
}
