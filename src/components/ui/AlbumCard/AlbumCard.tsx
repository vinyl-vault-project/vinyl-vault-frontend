import { type MouseEvent, useId } from 'react';
import { Link } from 'react-router';

import { routes } from '../../../app/routes';
import type { AlbumSummary } from '../../../features/home/home.types';
import './AlbumCard.scss';

interface AlbumCardProps {
  album: AlbumSummary;
  onArtistSelect: (
    artistSlug: string,
    event: MouseEvent<HTMLButtonElement>,
  ) => void;
}

export function AlbumCard({ album, onArtistSelect }: AlbumCardProps) {
  const accessibleName = `${album.artist} - ${album.title}`;
  const titleId = useId();

  return (
    <article className="album-card" aria-labelledby={titleId}>
      <Link
        className="album-card__cover-link"
        to={routes.album(album.slug)}
        aria-label={`Open ${accessibleName} album`}
      >
        <span className="album-card__cover-frame">
          <img
            className="album-card__cover"
            src={album.coverSrc}
            width="191"
            height="191"
            alt={album.coverAlt}
          />
        </span>
      </Link>
      <button
        className="album-card__artist-button"
        type="button"
        aria-label={`View ${album.artist} details`}
        title={album.artist}
        onClick={(event) => onArtistSelect(album.artistSlug, event)}
      >
        <span className="album-card__artist-name">{album.artist}</span>
      </button>
      <Link
        className="album-card__title-link"
        id={titleId}
        to={routes.album(album.slug)}
        aria-label={`Open ${accessibleName} album`}
        title={album.title}
      >
        {album.title}
      </Link>
    </article>
  );
}
