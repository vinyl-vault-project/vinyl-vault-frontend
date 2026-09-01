import { getAlbumsByIds } from './albums';
import type { AlbumSummary } from '../features/home/home.types';

export interface PurchasedAlbum {
  albumId: string;
  selectedFormat: 'VINYL' | 'WAV' | 'MP3';
  unitPrice: number;
}

export type OrderStatus = 'pending' | 'cancelled';

export interface AccountOrder {
  id: string;
  number: number;
  date: string;
  dateTime: string;
  status: OrderStatus;
  total: number;
  shipping: {
    name: string;
    phone: string;
    email: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
  };
  items: Array<{
    albumId: string;
    quantity: number;
    unitPrice: number;
    format: string;
    label: string;
  }>;
}

export type AccountOrderSummary = Omit<AccountOrder, 'items'> & {
  items: Array<AccountOrder['items'][number] & { album: AlbumSummary }>;
};

export const accountOrders: AccountOrder[] = [
  {
    id: 'order-2',
    number: 2,
    date: '20 Aug 2026',
    dateTime: '20 Aug 2026 14:32',
    status: 'pending',
    total: 95,
    shipping: {
      name: 'Sem Bib',
      phone: '+49 123 456789',
      email: 'SuperDuper228@gmail.com',
      address: 'Hauptstr. 12',
      postalCode: '75172',
      city: 'Pforzheim',
      country: 'Germany',
    },
    items: [
      {
        albumId: 'drukqs',
        quantity: 1,
        unitPrice: 45,
        format: '2LP',
        label: 'Warp Records',
      },
      {
        albumId: 'endtroducing',
        quantity: 2,
        unitPrice: 18,
        format: '2LP',
        label: "Mo' Wax",
      },
      {
        albumId: 'incunabula',
        quantity: 1,
        unitPrice: 14,
        format: '2LP',
        label: 'Warp Records',
      },
    ],
  },
  {
    id: 'order-1',
    number: 1,
    date: '14 Aug 2026',
    dateTime: '14 Aug 2026 11:10',
    status: 'cancelled',
    total: 104,
    shipping: {
      name: 'Sem Bib',
      phone: '+49 123 456789',
      email: 'SuperDuper228@gmail.com',
      address: 'Hauptstr. 12',
      postalCode: '75172',
      city: 'Pforzheim',
      country: 'Germany',
    },
    items: [
      {
        albumId: 'tomorrows-harvest',
        quantity: 2,
        unitPrice: 52,
        format: '2LP',
        label: 'Warp Records',
      },
      {
        albumId: 'the-less-you-know-the-better',
        quantity: 3,
        unitPrice: 0,
        format: '2LP',
        label: "Mo' Wax",
      },
    ],
  },
];

export function getAccountOrder(id: string): AccountOrderSummary | null {
  const order = accountOrders.find((currentOrder) => currentOrder.id === id);

  if (!order) {
    return null;
  }

  const items = order.items
    .map((item) => ({ ...item, album: getAlbumsByIds([item.albumId])[0] }))
    .filter((item): item is AccountOrderSummary['items'][number] =>
      Boolean(item.album),
    );

  return { ...order, items };
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
    .filter(
      (
        purchase,
      ): purchase is PurchasedAlbum & {
        album: ReturnType<typeof getAlbumsByIds>[number];
      } => Boolean(purchase),
    );
}
