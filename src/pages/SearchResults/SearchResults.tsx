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

const ALBUMS_PER_PAGE = 15;

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

function filterAlbumsByArtist(albums: AlbumSummary[], artistSlug: string) {
  if (!artistSlug) {
    return albums;
  }

  return albums.filter((album) => album.artistSlug === artistSlug);
}

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const artistSlug = searchParams.get('artist') ?? '';
  const [status, setStatus] = useState<SearchResultsStatus>({
    state: 'loading',
  });
  const [isCatalogFilterOpen, setIsCatalogFilterOpen] = useState(false);
  const [catalogFilterSession, setCatalogFilterSession] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState(defaultCatalogFilters);
  const [currentPage, setCurrentPage] = useState(1);
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
    setCurrentPage(1);
    setIsCatalogFilterOpen(false);
  }

  const filteredAlbums =
    status.state === 'ready'
      ? filterAlbumsByCatalogState(
          filterAlbumsByArtist(
            filterAlbumsByQuery(status.albums, query),
            artistSlug,
          ),
          appliedFilters,
        )
      : [];

  const totalPages = Math.ceil(filteredAlbums.length / ALBUMS_PER_PAGE);

  const validCurrentPage = Math.min(currentPage, Math.max(totalPages, 1));

  const firstAlbumIndex = (validCurrentPage - 1) * ALBUMS_PER_PAGE;

  const lastAlbumIndex = firstAlbumIndex + ALBUMS_PER_PAGE;

  const visibleAlbums = filteredAlbums.slice(firstAlbumIndex, lastAlbumIndex);

  function handlePageChange(page: number) {
    setCurrentPage(page);

    window.requestAnimationFrame(() => {
      document.getElementById('search-results-title')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }
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
              {visibleAlbums.map((album) => (
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
      {status.state === 'ready' && totalPages > 1 ? (
        <nav
          className="search-results-page__pagination"
          aria-label="Search results pagination"
        >
          <button
            className="search-results-page__pagination-button"
            type="button"
            disabled={validCurrentPage === 1}
            onClick={() => handlePageChange(validCurrentPage - 1)}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;

            return (
              <button
                className={`search-results-page__pagination-button${
                  page === currentPage
                    ? ' search-results-page__pagination-button--active'
                    : ''
                }`}
                type="button"
                aria-current={page === validCurrentPage ? 'page' : undefined}
                key={page}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            );
          })}

          <button
            className="search-results-page__pagination-button"
            type="button"
            disabled={validCurrentPage === totalPages}
            onClick={() => handlePageChange(validCurrentPage + 1)}
          >
            Next
          </button>
        </nav>
      ) : null}
      <Footer />
    </>
  );
}
