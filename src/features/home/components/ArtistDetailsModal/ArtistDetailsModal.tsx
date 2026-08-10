import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';

import { routes } from '../../../../app/routes';
import type { ArtistDetails } from '../../home.types';

interface ArtistDetailsModalProps {
  artist: ArtistDetails;
  onClose: () => void;
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function ArtistDetailsModal({
  artist,
  onClose,
}: ArtistDetailsModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight =
      scrollbarWidth > 0 ? `${scrollbarWidth}px` : previousPaddingRight;
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) {
        return;
      }

      const focusableElements = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="artist-modal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="artist-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="artist-modal-title"
        aria-describedby="artist-modal-biography"
        ref={panelRef}
      >
        <div className="artist-modal__header">
          <button
            className="artist-modal__back-button"
            type="button"
            aria-label="Close artist details"
            onClick={onClose}
            ref={closeButtonRef}
          >
            <span aria-hidden="true" />
          </button>
          <h2 className="artist-modal__title" id="artist-modal-title">
            {artist.name}
          </h2>
        </div>

        <img
          className="artist-modal__image"
          src={artist.imageSrc}
          alt={artist.imageAlt}
          width="1076"
          height="640"
        />

        <div className="artist-modal__body">
          <p className="artist-modal__biography" id="artist-modal-biography">
            {artist.biography}
          </p>

          {artist.albums.length > 0 ? (
            <div
              className="artist-modal__album-list"
              aria-label={`${artist.name} albums`}
            >
              {artist.albums.map((album) => (
                <Link
                  className="artist-modal__album"
                  to={routes.album(album.slug)}
                  aria-label={`${album.artist} - ${album.title}`}
                  key={album.id}
                >
                  <img
                    className="artist-modal__album-cover"
                    src={album.coverSrc}
                    alt={album.coverAlt}
                    width="191"
                    height="191"
                  />
                  <span className="artist-modal__album-artist">
                    {album.artist}
                  </span>
                  <span className="artist-modal__album-title">
                    {album.title}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="empty-state">
              No albums are available for this artist yet.
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
