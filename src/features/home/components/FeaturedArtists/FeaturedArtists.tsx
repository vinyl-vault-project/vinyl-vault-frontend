import {
  type MouseEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import featuredArtistsNextArrow from '../../../../assets/vinyl-vault/featured-artists-next-arrow.svg';
import type { FeaturedArtist } from '../../home.types';

interface FeaturedArtistsProps {
  artists: FeaturedArtist[];
  onArtistSelect: (
    artistSlug: string,
    event: MouseEvent<HTMLButtonElement>,
  ) => void;
}

export function FeaturedArtists({
  artists,
  onArtistSelect,
}: FeaturedArtistsProps) {
  const stripRef = useRef<HTMLDivElement | null>(null);
  const loopResetTimeout = useRef<number | null>(null);
  const currentIndex = useRef(0);
  const [invalidArtistIds, setInvalidArtistIds] = useState<Set<string>>(
    () => new Set(),
  );
  const dragState = useRef({
    isDragging: false,
    moved: false,
    startX: 0,
    scrollLeft: 0,
  });
  const visibleArtists = artists.filter(
    (artist) => !invalidArtistIds.has(artist.id),
  );
  const hasLoop = visibleArtists.length > 1;
  const carouselArtists = hasLoop
    ? Array.from({ length: 4 }, () => visibleArtists).flat()
    : visibleArtists;
  const firstArtistIndex = hasLoop ? visibleArtists.length : 0;
  const lastArtistIndex = firstArtistIndex + visibleArtists.length - 1;

  const resetLoopPosition = useCallback(() => {
    const strip = stripRef.current;
    if (!strip || !hasLoop) return;

    const cards = Array.from(
      strip.querySelectorAll<HTMLButtonElement>('.featured-artists__card'),
    );
    const nextIndex =
      firstArtistIndex +
      ((currentIndex.current - firstArtistIndex + visibleArtists.length) %
        visibleArtists.length);

    if (nextIndex !== currentIndex.current) {
      strip.scrollTo({ left: cards[nextIndex].offsetLeft, behavior: 'auto' });
      currentIndex.current = nextIndex;
    }
  }, [firstArtistIndex, hasLoop, visibleArtists.length]);

  const scheduleLoopReset = useCallback(() => {
    if (loopResetTimeout.current !== null) {
      window.clearTimeout(loopResetTimeout.current);
    }

    loopResetTimeout.current = window.setTimeout(() => {
      resetLoopPosition();
      loopResetTimeout.current = null;
    }, 550);
  }, [resetLoopPosition]);

  const scrollArtists = useCallback(
    (direction: 1 | -1) => {
      const strip = stripRef.current;
      if (!strip || !hasLoop) return;

      if (loopResetTimeout.current !== null) {
        window.clearTimeout(loopResetTimeout.current);
        loopResetTimeout.current = null;
        resetLoopPosition();
      }

      const cards = Array.from(
        strip.querySelectorAll<HTMLButtonElement>('.featured-artists__card'),
      );
      const nextIndex = currentIndex.current + direction;

      strip.scrollTo({ left: cards[nextIndex].offsetLeft, behavior: 'smooth' });
      currentIndex.current = nextIndex;

      if (nextIndex < firstArtistIndex || nextIndex > lastArtistIndex) {
        scheduleLoopReset();
      }
    },
    [firstArtistIndex, hasLoop, lastArtistIndex, resetLoopPosition, scheduleLoopReset],
  );

  useLayoutEffect(() => {
    const strip = stripRef.current;
    if (!strip || !hasLoop) return;

    const frameId = window.requestAnimationFrame(() => {
      const cards = strip.querySelectorAll<HTMLButtonElement>(
        '.featured-artists__card',
      );
      currentIndex.current = firstArtistIndex;
      strip.scrollTo({
        left: cards[firstArtistIndex].offsetLeft,
        behavior: 'auto',
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [firstArtistIndex, hasLoop, visibleArtists.length]);

  useEffect(() => {
    if (!hasLoop) return undefined;

    const intervalId = window.setInterval(() => {
      scrollArtists(1);
    }, 5_000);

    return () => {
      window.clearInterval(intervalId);
      if (loopResetTimeout.current !== null) {
        window.clearTimeout(loopResetTimeout.current);
      }
    };
  }, [hasLoop, scrollArtists]);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const strip = event.currentTarget;
    dragState.current = {
      isDragging: true,
      moved: false,
      startX: event.clientX,
      scrollLeft: strip.scrollLeft,
    };
    // Pointer capture on a mouse click prevents the nested artist button
    // from receiving a reliable click in Chromium. Touch still needs it to
    // keep swipe gestures intact when a finger leaves the carousel.
    if (event.pointerType !== 'mouse') {
      strip.setPointerCapture(event.pointerId);
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const strip = event.currentTarget;
    const movement = event.clientX - dragState.current.startX;
    if (!dragState.current.isDragging || Math.abs(movement) < 4) return;

    dragState.current.moved = true;
    strip.scrollLeft = dragState.current.scrollLeft - movement;
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (!dragState.current.isDragging) return;
    dragState.current.isDragging = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (dragState.current.moved) {
      const cards = Array.from(
        event.currentTarget.querySelectorAll<HTMLButtonElement>(
          '.featured-artists__card',
        ),
      );
      currentIndex.current = cards.reduce((closestIndex, card, index) => {
        const closestCard = cards[closestIndex];
        return Math.abs(card.offsetLeft - event.currentTarget.scrollLeft) <
          Math.abs(closestCard.offsetLeft - event.currentTarget.scrollLeft)
          ? index
          : closestIndex;
      }, currentIndex.current);
      event.currentTarget.scrollTo({
        left: cards[currentIndex.current].offsetLeft,
        behavior: 'smooth',
      });
      if (
        currentIndex.current < firstArtistIndex ||
        currentIndex.current > lastArtistIndex
      ) {
        scheduleLoopReset();
      }
    }
    window.setTimeout(() => {
      dragState.current.moved = false;
    }, 0);
  }

  return (
    <section
      className="featured-artists"
      aria-labelledby="featured-artists-title"
    >
      <div className="app-container">
        <h2 className="section-title" id="featured-artists-title">
          Featured Artists
        </h2>
        {visibleArtists.length > 0 ? (
          <div className="featured-artists__carousel">
            <button
              className="featured-artists__navigation featured-artists__navigation--previous"
              type="button"
              aria-label="Show previous featured artists"
              onClick={() => scrollArtists(-1)}
            >
              <img src={featuredArtistsNextArrow} alt="" aria-hidden="true" />
            </button>
            <div
              ref={stripRef}
              className="featured-artists__strip"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
            >
              {carouselArtists.map((artist, index) => (
                <ArtistCard
                  artist={artist}
                  isClone={index < firstArtistIndex || index > lastArtistIndex}
                  key={`${artist.id}-${index}`}
                  onImageError={() => {
                    setInvalidArtistIds((currentIds) => {
                      if (currentIds.has(artist.id)) return currentIds;

                      const nextIds = new Set(currentIds);
                      nextIds.add(artist.id);
                      return nextIds;
                    });
                  }}
                  onSelect={onArtistSelect}
                  wasDragged={() => dragState.current.moved}
                />
              ))}
            </div>
            <button
              className="featured-artists__navigation featured-artists__navigation--next"
              type="button"
              aria-label="Show more featured artists"
              onClick={() => scrollArtists(1)}
            >
              <img src={featuredArtistsNextArrow} alt="" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <p className="empty-state">
            No featured artists are available right now.
          </p>
        )}
      </div>
    </section>
  );
}

interface ArtistCardProps {
  artist: FeaturedArtist;
  isClone: boolean;
  onImageError: () => void;
  onSelect: FeaturedArtistsProps['onArtistSelect'];
  wasDragged: () => boolean;
}

function ArtistCard({
  artist,
  isClone,
  onImageError,
  onSelect,
  wasDragged,
}: ArtistCardProps) {
  return (
    <button
      className={[
        'featured-artists__card',
        `featured-artists__card--${artist.width}`,
      ].join(' ')}
      type="button"
      aria-hidden={isClone || undefined}
      aria-label={
        artist.hasDetails
          ? `View ${artist.name} details`
          : `${artist.name} details are not available yet`
      }
      aria-disabled={!artist.hasDetails}
      tabIndex={isClone ? -1 : undefined}
      onClick={(event) => {
        // Cloned cards are part of the visual infinite loop, but they still
        // represent the same artist and must remain clickable.
        if (!wasDragged() && artist.hasDetails) {
          onSelect(artist.slug, event);
        }
      }}
    >
      <img
        className="featured-artists__image"
        src={artist.imageSrc}
        alt={isClone ? '' : artist.imageAlt}
        onError={onImageError}
      />
      <span className="featured-artists__name">{artist.name}</span>
    </button>
  );
}
