import { type MouseEvent, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

import { Footer } from '../../components/layout/Footer/Footer';
import { Header } from '../../components/layout/Header/Header';
import { AlbumCard } from '../../components/ui/AlbumCard/AlbumCard';
import { CatalogFilter } from '../../components/ui/CatalogFilter/CatalogFilter';
import { ArtistDetailsModal } from '../../features/home/components/ArtistDetailsModal/ArtistDetailsModal';
import {
  type CatalogFilters,
  defaultCatalogFilters,
  filterAlbumsByCatalogState,
} from '../../features/home/home.filters';
import {
  getArtistDetailsBySlug,
  getSearchResultAlbums,
} from '../../features/home/home.service';
import type {
  AlbumSummary,
  ArtistDetails,
} from '../../features/home/home.types';
import './SearchResults.scss';

type SearchResultsStatus =
  | { state: 'loading' }
  | { state: 'ready'; albums: AlbumSummary[] }
  | { state: 'error'; message: string };

function normalizeSearchText(value: string) {
  return value.trim().toLowerCase();
}

function filterAlbumsByQuery(albums: AlbumSummary[], query: string) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return albums;
  }

  const queryTerms = normalizedQuery.split(/\s+/);

  return albums.filter((album) => {
    const searchableText = [
      album.artist,
      album.title,
      ...album.filterMetadata.genres,
      ...album.filterMetadata.styles,
    ]
      .join(' ')
      .toLowerCase();

    return queryTerms.some((term) => searchableText.includes(term));
  });
}

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [status, setStatus] = useState<SearchResultsStatus>({
    state: 'loading',
  });
  const [isCatalogFilterOpen, setIsCatalogFilterOpen] = useState(false);
  const [catalogFilterSession, setCatalogFilterSession] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState(defaultCatalogFilters);
  const [selectedArtistDetails, setSelectedArtistDetails] =
    useState<ArtistDetails | null>(null);
  const artistTriggerRef = useRef<HTMLElement | null>(null);
  const catalogFilterId = 'search-results-catalog-filter';

  useEffect(() => {
    let isActive = true;

    async function loadSearchResults() {
      try {
        const albums = await getSearchResultAlbums();

        if (isActive) {
          setStatus({ state: 'ready', albums });
        }
      } catch {
        if (isActive) {
          setStatus({
            state: 'error',
            message: 'Search results could not be loaded.',
          });
        }
      }
    }

    void loadSearchResults();

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

  function handleCatalogFilterToggle() {
    setIsCatalogFilterOpen((currentState) => {
      if (!currentState) {
        setCatalogFilterSession((currentSession) => currentSession + 1);
      }

      return !currentState;
    });
  }

  function handleCatalogFilterApply(nextFilters: CatalogFilters) {
    setAppliedFilters(nextFilters);
    setIsCatalogFilterOpen(false);
  }

  const filteredAlbums =
    status.state === 'ready'
      ? filterAlbumsByCatalogState(
          filterAlbumsByQuery(status.albums, query),
          appliedFilters,
        )
      : [];

  return (
    <>
      <main className="search-results-page">
        <Header
          key={query}
          filterPanelId={catalogFilterId}
          isFilterOpen={isCatalogFilterOpen}
          onFilterToggle={handleCatalogFilterToggle}
          searchQuery={query}
        />
        <CatalogFilter
          key={catalogFilterSession}
          id={catalogFilterId}
          isOpen={isCatalogFilterOpen}
          appliedFilters={appliedFilters}
          onApply={handleCatalogFilterApply}
          onClose={() => setIsCatalogFilterOpen(false)}
        />

        <section
          className="app-container search-results-page__content"
          aria-labelledby="search-results-title"
        >
          <h1 className="search-results-page__title" id="search-results-title">
            Search results
          </h1>

          {status.state === 'loading' ? (
            <p className="search-results-page__status" aria-live="polite">
              Loading search results...
            </p>
          ) : null}

          {status.state === 'error' ? (
            <p className="search-results-page__status" role="alert">
              {status.message}
            </p>
          ) : null}

          {status.state === 'ready' && filteredAlbums.length > 0 ? (
            <div className="search-results-page__grid">
              {filteredAlbums.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onArtistSelect={(artistSlug, event) => {
                    void handleArtistSelect(artistSlug, event);
                  }}
                />
              ))}
            </div>
          ) : null}

          {status.state === 'ready' && filteredAlbums.length === 0 ? (
            <p className="search-results-page__status">
              No albums match this search.
            </p>
          ) : null}
        </section>
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
