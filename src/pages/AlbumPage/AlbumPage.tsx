import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { routes } from '../../app/routes';
import { Footer } from '../../components/layout/Footer/Footer';
import { Header } from '../../components/layout/Header/Header';
import { AlbumCard } from '../../components/ui/AlbumCard/AlbumCard';
import { CatalogFilter } from '../../components/ui/CatalogFilter/CatalogFilter';
import type { AlbumDetail, AlbumTrack } from '../../data/albumDetails';
import {
  type CatalogFilters,
  defaultCatalogFilters,
} from '../../features/home/home.filters';
import { getAlbumDetail } from '../../features/home/home.service';
import { openAuthModal, useAuthState } from '../../state/auth';
import { addCartItem, getCartItemCount, useCartItems } from '../../state/cart';
import { toggleSavedAlbum, useSavedAlbumIds } from '../../state/library';
import './AlbumPage.scss';

const emptyTracks: AlbumTrack[] = [];

type AlbumPageStatus =
  | { state: 'loading' }
  | { state: 'ready'; detail: AlbumDetail }
  | { state: 'not-found' }
  | { state: 'error'; message: string };

function formatPrice(price: number) {
  return price.toFixed(2);
}

function formatTrackNumber(trackNumber: number) {
  return String(trackNumber).padStart(2, '0');
}

function PlaybackBars() {
  return (
    <span className="album-page__playing-bars" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

interface IconProps {
  className?: string;
}

function SkipBackIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 20 9 12l10-8v16Z" />
      <path d="M5 19V5" />
    </svg>
  );
}

function SkipForwardIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 4 10 8-10 8V4Z" />
      <path d="M19 5v14" />
    </svg>
  );
}

function PlayIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 3 14 9-14 9V3Z" />
    </svg>
  );
}

function PauseIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5v14" />
      <path d="M16 5v14" />
    </svg>
  );
}

function VolumeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M19 5a9 9 0 0 1 0 14" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className="album-page__bookmark-icon"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path
        d="M10 42V10C10 8.9 10.392 7.95867 11.176 7.176C11.96 6.39333 12.9013 6.00133 14 6H34C35.1 6 36.042 6.392 36.826 7.176C37.61 7.96 38.0013 8.90133 38 10V42L24 36L10 42Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AlbumPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<AlbumPageStatus>({ state: 'loading' });
  const auth = useAuthState();
  const savedAlbumIds = useSavedAlbumIds();
  const cartItems = useCartItems();
  const [activeTrackId, setActiveTrackId] = useState('');
  const [isCatalogFilterOpen, setIsCatalogFilterOpen] = useState(false);
  const [catalogFilterSession, setCatalogFilterSession] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState(defaultCatalogFilters);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(72);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadAlbum() {
      try {
        const detail = await getAlbumDetail(slug);

        if (!isActive) {
          return;
        }

        setStatus(detail ? { state: 'ready', detail } : { state: 'not-found' });
        setSelectedProductId(
          detail?.product.id ? String(detail.product.id) : '',
        );
        setIsPlaying(false);
        setProgress(0);
      } catch {
        if (isActive) {
          setStatus({
            state: 'error',
            message: 'Album details could not be loaded.',
          });
        }
      }
    }

    void loadAlbum();
    window.scrollTo({ top: 0 });

    return () => {
      isActive = false;
    };
  }, [slug]);

  const detail = status.state === 'ready' ? status.detail : null;
  const selectedProduct = detail?.products?.find(
    (product) => String(product.id) === selectedProductId,
  );
  const product = detail ? { ...detail.product, ...selectedProduct } : null;
  const tracks = detail?.tracks ?? emptyTracks;
  const activeTrack = useMemo(() => {
    if (tracks.length === 0) {
      return null;
    }

    return (
      tracks.find((track) => track.id === activeTrackId) ??
      tracks.find((track) => track.id === 'vordhosbn') ??
      tracks[0]
    );
  }, [activeTrackId, tracks]);
  const isCurrentAlbumSaved = detail
    ? savedAlbumIds.includes(detail.album.id)
    : false;
  const cartItemCount = getCartItemCount(cartItems);
  const catalogFilterId = 'album-page-catalog-filter';

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (activeTrack?.audioSrc) {
      audio.src = activeTrack.audioSrc;
      audio.load();
    } else {
      audio.removeAttribute('src');
      audio.load();
    }
  }, [activeTrack?.audioSrc]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !activeTrack?.audioSrc) {
      return;
    }

    if (isPlaying) {
      void audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [activeTrack?.audioSrc, isPlaying]);

  function handleSaveToggle() {
    if (!detail) {
      return;
    }

    if (!auth.isAuthenticated) {
      openAuthModal({
        context: 'account',
        message: 'Please log in or create an account to save albums.',
        mode: 'login',
      });
      return;
    }

    void toggleSavedAlbum(detail.album.id);
  }

  function handleAddToCart() {
    if (!detail || !product || product.availability !== 'in-stock') {
      return;
    }

    if (!auth.isAuthenticated) {
      openAuthModal({
        context: 'checkout',
        message:
          'Please log in or create an account to add products to your cart.',
        mode: 'login',
      });
      return;
    }

    if (product.id !== undefined) void addCartItem(product.id);
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

  function selectTrack(track: AlbumTrack) {
    setActiveTrackId(track.id);
    setProgress(0);

    setIsPlaying(Boolean(track.audioSrc));
  }

  function handleTrackClick(track: AlbumTrack) {
    selectTrack(track);
  }

  function handleTrackKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    track: AlbumTrack,
  ) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectTrack(track);
    }
  }

  function handleArtistSelect(
    artistSlug: string,
    event: MouseEvent<HTMLButtonElement>,
  ) {
    event.currentTarget.blur();
    navigate(routes.searchByArtist(artistSlug));
  }

  function moveTrack(direction: 'previous' | 'next') {
    if (!activeTrack || tracks.length === 0) {
      return;
    }

    const currentIndex = tracks.findIndex(
      (track) => track.id === activeTrack.id,
    );
    const offset = direction === 'next' ? 1 : -1;
    const nextIndex = (currentIndex + offset + tracks.length) % tracks.length;
    selectTrack(tracks[nextIndex]);
  }

  if (status.state === 'loading') {
    return (
      <>
        <main className="album-page album-page--status">
          <Header
            cartItemCount={cartItemCount}
            filterPanelId={catalogFilterId}
            isFilterOpen={isCatalogFilterOpen}
            onFilterToggle={handleCatalogFilterToggle}
            showSearchOnMobile={false}
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
            className="app-container album-page__status"
            aria-live="polite"
          >
            Loading album...
          </section>
        </main>
        <Footer />
      </>
    );
  }

  if (status.state === 'error' || status.state === 'not-found') {
    return (
      <>
        <main className="album-page album-page--status">
          <Header
            cartItemCount={cartItemCount}
            filterPanelId={catalogFilterId}
            isFilterOpen={isCatalogFilterOpen}
            onFilterToggle={handleCatalogFilterToggle}
            showSearchOnMobile={false}
          />
          <CatalogFilter
            key={catalogFilterSession}
            id={catalogFilterId}
            isOpen={isCatalogFilterOpen}
            appliedFilters={appliedFilters}
            onApply={handleCatalogFilterApply}
            onClose={() => setIsCatalogFilterOpen(false)}
          />
          <section className="app-container album-page__status" role="alert">
            <h1>
              {status.state === 'not-found'
                ? 'Album not found'
                : 'Album unavailable'}
            </h1>
            <p>
              {status.state === 'not-found'
                ? 'This album is not available in the Vinyl Vault catalog.'
                : status.message}
            </p>
            <Link to={routes.search}>Back to search</Link>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const { album, assets } = status.detail;
  if (!product) return null;
  const isAvailable = product.availability === 'in-stock';
  const priceLabel = formatPrice(product.price);

  return (
    <>
      <main className="album-page">
        <Header
          cartItemCount={cartItemCount}
          filterPanelId={catalogFilterId}
          isFilterOpen={isCatalogFilterOpen}
          onFilterToggle={handleCatalogFilterToggle}
          showSearchOnMobile={false}
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
          className="album-page__hero"
          style={
            {
              '--album-hero-bg': `url(${assets.heroBackground})`,
            } as CSSProperties
          }
          aria-labelledby="album-page-title"
        >
          <div className="app-container album-page__hero-inner">
            <article className="album-page__summary">
              <img
                className="album-page__cover"
                src={album.coverSrc}
                width="360"
                height="360"
                alt={album.coverAlt}
              />
              <div className="album-page__summary-copy">
                <Link
                  className="album-page__artist-link"
                  to={routes.searchByArtist(album.artistSlug)}
                >
                  {album.artist}
                </Link>
                <h1 className="album-page__album-title" id="album-page-title">
                  {album.title}
                </h1>
                <p className="album-page__year">
                  {album.filterMetadata.releaseYear}
                </p>
              </div>
              <button
                className={`album-page__save-button${
                  isCurrentAlbumSaved ? ' album-page__save-button--active' : ''
                }`}
                type="button"
                aria-label={
                  isCurrentAlbumSaved
                    ? `Remove ${album.title} from saved albums`
                    : `Save ${album.title}`
                }
                aria-pressed={isCurrentAlbumSaved}
                onClick={handleSaveToggle}
              >
                <BookmarkIcon filled={isCurrentAlbumSaved} />
              </button>
            </article>

            <Tracklist
              tracks={tracks}
              activeTrackId={activeTrack?.id}
              isPlaying={isPlaying}
              onTrackClick={handleTrackClick}
              onTrackKeyDown={handleTrackKeyDown}
            />
          </div>
        </section>

        <section
          className="album-page__description-section"
          style={
            {
              '--album-description-bg': `url(${assets.descriptionBackground})`,
            } as CSSProperties
          }
        >
          <div className="app-container album-page__description-inner">
            <img
              className="album-page__details-image"
              src={assets.detailsImage}
              width="620"
              height="620"
              alt={assets.detailsImageAlt}
            />
            <div className="album-page__description-copy">
              <p>{status.detail.description}</p>
              <dl className="album-page__metadata">
                {product.pressingCountry ? (
                  <div>
                    <dt>Country</dt>
                    <dd>{product.pressingCountry}</dd>
                  </div>
                ) : null}
                {product.genre.length > 0 ? (
                  <div>
                    <dt>Genre</dt>
                    <dd>{product.genre.join(', ')}</dd>
                  </div>
                ) : null}
                {product.style.length > 0 ? (
                  <div>
                    <dt>Style</dt>
                    <dd>{product.style.join(', ')}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </div>
        </section>

        <section
          className="album-page__store-section"
          style={
            {
              '--album-store-bg': `url(${assets.purchaseBackground})`,
            } as CSSProperties
          }
          aria-labelledby="album-recommendations-title"
        >
          <div className="app-container album-page__store-inner">
            {status.detail.relatedAlbums.length > 0 ? (
              <div className="album-page__recommendations">
                <h2
                  className="visually-hidden"
                  id="album-recommendations-title"
                >
                  Recommended albums
                </h2>
                <div className="album-page__recommendations-grid">
                  {status.detail.relatedAlbums.map((relatedAlbum) => (
                    <AlbumCard
                      key={relatedAlbum.id}
                      album={relatedAlbum}
                      onArtistSelect={handleArtistSelect}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </main>

      <PurchaseBar
        isAvailable={isAvailable}
        priceLabel={priceLabel}
        products={status.detail.products ?? []}
        selectedProductId={selectedProductId}
        onProductChange={setSelectedProductId}
        availability={product.availability}
        onAddToCart={handleAddToCart}
      />
      <AudioPlayer
        audioRef={audioRef}
        album={album}
        activeTrack={activeTrack}
        isPlaying={isPlaying}
        progress={progress}
        volume={volume}
        onPlayToggle={() => setIsPlaying((currentState) => !currentState)}
        onPrevious={() => moveTrack('previous')}
        onNext={() => moveTrack('next')}
        onVolumeChange={setVolume}
        onTimeUpdate={(nextProgress) => setProgress(nextProgress)}
        onEnded={() => {
          setIsPlaying(false);
          moveTrack('next');
        }}
      />
      <Footer />
    </>
  );
}

interface PurchaseBarProps {
  availability: AlbumDetail['product']['availability'];
  products: NonNullable<AlbumDetail['products']>;
  selectedProductId: string;
  onProductChange: (productId: string) => void;
  isAvailable: boolean;
  onAddToCart: () => void;
  priceLabel: string;
}

function PurchaseBar({
  availability,
  isAvailable,
  onAddToCart,
  priceLabel,
  products,
  selectedProductId,
  onProductChange,
}: PurchaseBarProps) {
  return (
    <aside className="album-purchase-bar" aria-label="Album purchase">
      <div className="app-container album-purchase-bar__inner">
        <div className="album-purchase-bar__meta">
          <span
            className={`album-purchase-bar__availability album-purchase-bar__availability--${availability}`}
          >
            {isAvailable ? 'in stock' : 'out of stock'}
          </span>
          <span>{priceLabel}</span>
        </div>
        {products.length > 1 ? (
          <label className="album-purchase-bar__product-select">
            <span>Pressing</span>
            <select
              value={selectedProductId}
              onChange={(event) => onProductChange(event.target.value)}
            >
              {products.map((item) => (
                <option
                  key={item.id}
                  value={String(item.id)}
                  disabled={item.availability === 'out-of-stock'}
                >
                  {item.pressingCountry || 'Standard'} —{' '}
                  {formatPrice(item.price)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <button
          className="album-purchase-bar__button"
          type="button"
          disabled={!isAvailable}
          onClick={onAddToCart}
        >
          ADD TO CART
        </button>
      </div>
    </aside>
  );
}

interface TracklistProps {
  activeTrackId?: string;
  isPlaying: boolean;
  onTrackClick: (track: AlbumTrack) => void;
  onTrackKeyDown: (
    event: KeyboardEvent<HTMLButtonElement>,
    track: AlbumTrack,
  ) => void;
  tracks: AlbumTrack[];
}

function Tracklist({
  activeTrackId,
  isPlaying,
  onTrackClick,
  onTrackKeyDown,
  tracks,
}: TracklistProps) {
  return (
    <section className="album-page__tracklist" aria-label="Tracklist">
      <div className="album-page__tracklist-header" aria-hidden="true">
        <span>#</span>
        <span>TITLE</span>
        <span>DURATION</span>
      </div>
      <div className="album-page__tracks" role="list">
        {tracks.map((track, index) => {
          const isActive = track.id === activeTrackId;
          const previousSide = tracks[index - 1]?.side;
          const side = track.side || 'Other';

          return (
            <div key={track.id} className="album-page__track-group">
              {side !== previousSide ? (
                <p className="album-page__side-heading">SIDE {side}</p>
              ) : null}
              <button
                className={`album-page__track${isActive ? ' album-page__track--active' : ''}`}
                type="button"
                role="listitem"
                aria-current={isActive ? 'true' : undefined}
                onClick={() => onTrackClick(track)}
                onKeyDown={(event) => onTrackKeyDown(event, track)}
              >
                <span>
                  {track.side
                    ? `${track.side}${track.number}`
                    : formatTrackNumber(track.number)}
                </span>
                <span>{track.title}</span>
                <span>{track.duration}</span>
                {isActive && isPlaying ? <PlaybackBars /> : null}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

interface AudioPlayerProps {
  activeTrack: AlbumTrack | null;
  album: AlbumDetail['album'];
  audioRef: RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  onEnded: () => void;
  onNext: () => void;
  onPlayToggle: () => void;
  onPrevious: () => void;
  onTimeUpdate: (value: number) => void;
  onVolumeChange: (value: number) => void;
  progress: number;
  volume: number;
}

function AudioPlayer({
  activeTrack,
  album,
  audioRef,
  isPlaying,
  onEnded,
  onNext,
  onPlayToggle,
  onPrevious,
  onTimeUpdate,
  onVolumeChange,
  progress,
  volume,
}: AudioPlayerProps) {
  const hasAudio = Boolean(activeTrack?.audioSrc);

  function handleTimeUpdate() {
    const audio = audioRef.current;

    if (!audio?.duration) {
      return;
    }

    onTimeUpdate((audio.currentTime / audio.duration) * 100);
  }

  return (
    <aside className="album-player" aria-label="Audio preview player">
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={onEnded} />
      <div className="album-player__progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="album-player__inner">
        <div className="album-player__controls">
          <button
            type="button"
            aria-label="Previous track"
            onClick={onPrevious}
          >
            <SkipBackIcon />
          </button>
          <button
            className="album-player__play"
            type="button"
            aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
            disabled={!hasAudio}
            onClick={onPlayToggle}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button type="button" aria-label="Next track" onClick={onNext}>
            <SkipForwardIcon />
          </button>
        </div>

        <div className="album-player__now-playing">
          <strong>{activeTrack?.title ?? 'No preview selected'}</strong>
          {activeTrack?.previewUrl && !hasAudio ? (
            <a href={activeTrack.previewUrl} target="_blank" rel="noreferrer">
              Open preview on Bandcamp
            </a>
          ) : (
            <span>{album.artist}</span>
          )}
        </div>

        <label className="album-player__volume">
          <span aria-hidden="true">VOL</span>
          <VolumeIcon className="album-player__volume-icon" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(event) => onVolumeChange(Number(event.target.value))}
          />
        </label>

        <img
          className="album-player__cover"
          src={album.coverSrc}
          width="64"
          height="64"
          alt=""
          aria-hidden="true"
        />
      </div>
    </aside>
  );
}
