export const routes = {
  home: '/',
  cart: '/cart',
  account: '/account',
  accountLibrary: '/account',
  accountOrder: (orderId: string) => `/account/orders/${orderId}`,
  contact: '/contact',
  about: '/about',
  instagram: 'https://www.instagram.com/',
  privacy: '/privacy',
  search: '/search',
  album: (slug: string) => `/albums/${slug}`,
  searchByArtist: (artistSlug: string) =>
    `/search?artist=${encodeURIComponent(artistSlug)}`,
  searchByQuery: (query: string) => `/search?q=${encodeURIComponent(query)}`,
} as const;
