import { type MouseEvent, type PointerEvent, useRef } from 'react';

import featuredArtistsNextArrow from '../../../../assets/vinyl-vault/featured-artists-next-arrow.svg';
import artistPlaceholder from '../../../../assets/vinyl-vault/broken-vinyl-404.png';
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
  const dragState = useRef({
    isDragging: false,
    moved: false,
    startX: 0,
    scrollLeft: 0,
  });

  function scrollArtists(direction: 1 | -1) {
    const strip = stripRef.current;
    if (!strip) return;

    strip.scrollBy({
      left: direction * Math.max(strip.clientWidth * 0.8, 240),
      behavior: 'smooth',
    });
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const strip = event.currentTarget;
    dragState.current = {
      isDragging: true,
      moved: false,
      startX: event.clientX,
      scrollLeft: strip.scrollLeft,
    };
    strip.setPointerCapture(event.pointerId);
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
        {artists.length > 0 ? (
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
              {artists.map((artist, index) => (
                <button
                  className={[
                    'featured-artists__card',
                    `featured-artists__card--${artist.width}`,
                    index === artists.length - 1
                      ? 'featured-artists__card--edge'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  type="button"
                  aria-label={
                    artist.hasDetails
                      ? `View ${artist.name} details`
                      : `${artist.name} details are not available yet`
                  }
                  aria-disabled={!artist.hasDetails}
                  onClick={(event) => {
                    if (!dragState.current.moved && artist.hasDetails) {
                      onArtistSelect(artist.slug, event);
                    }
                  }}
                  key={artist.id}
                >
                  <img
                    className="featured-artists__image"
                    src={artist.imageSrc}
                    alt={artist.imageAlt}
                    onError={(event) => {
                      event.currentTarget.src = artistPlaceholder;
                    }}
                  />
                  <span className="featured-artists__name">{artist.name}</span>
                </button>
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
