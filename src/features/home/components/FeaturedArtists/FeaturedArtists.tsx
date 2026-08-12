import type { MouseEvent } from 'react';

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
          <div className="featured-artists__strip">
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
                  if (artist.hasDetails) {
                    onArtistSelect(artist.slug, event);
                  }
                }}
                key={artist.id}
              >
                <img
                  className="featured-artists__image"
                  src={artist.imageSrc}
                  alt={artist.imageAlt}
                />
                <span className="featured-artists__name">{artist.name}</span>
              </button>
            ))}
            <button
              className="featured-artists__next"
              type="button"
              aria-label="Show more featured artists"
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
