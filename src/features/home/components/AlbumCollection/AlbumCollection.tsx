import type { MouseEvent } from 'react';

import { AlbumCard } from '../../../../components/ui/AlbumCard/AlbumCard';
import type { AlbumSummary } from '../../home.types';

interface AlbumCollectionProps {
  title: string;
  albums: AlbumSummary[];
  onArtistSelect: (
    artistSlug: string,
    event: MouseEvent<HTMLButtonElement>,
  ) => void;
}

export function AlbumCollection({
  title,
  albums,
  onArtistSelect,
}: AlbumCollectionProps) {
  return (
    <section
      className="album-collection"
      aria-labelledby={`${title.toLowerCase().replaceAll(' ', '-')}-title`}
    >
      <div className="home-page__container">
        <h2
          className="section-title"
          id={`${title.toLowerCase().replaceAll(' ', '-')}-title`}
        >
          {title}
        </h2>
        {albums.length > 0 ? (
          <div className="album-collection__grid">
            {albums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onArtistSelect={onArtistSelect}
              />
            ))}
          </div>
        ) : (
          <p className="empty-state">No albums are available right now.</p>
        )}
      </div>
    </section>
  );
}
