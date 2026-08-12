import { getAlbumsByIds } from './albums';

export interface PurchasedAlbum {
  albumId: string;
  selectedFormat: 'VINYL' | 'WAV' | 'MP3';
  unitPrice: number;
}

export const purchasedAlbums: PurchasedAlbum[] = [
  { albumId: 'drukqs', selectedFormat: 'VINYL', unitPrice: 45 },
  { albumId: 'endtroducing', selectedFormat: 'WAV', unitPrice: 18 },
  { albumId: 'incunabula', selectedFormat: 'MP3', unitPrice: 14 },
];

export function getPurchasedAlbumSummaries() {
  return purchasedAlbums
    .map((purchase) => {
      const album = getAlbumsByIds([purchase.albumId])[0];

      return album ? { ...purchase, album } : null;
    })
    .filter((purchase): purchase is PurchasedAlbum & {
      album: ReturnType<typeof getAlbumsByIds>[number];
    } => Boolean(purchase));
}
