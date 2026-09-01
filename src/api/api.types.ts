export interface AuthUserDto {
  id: number | string;
  username: string;
  email: string;
}
export interface AuthTokensDto {
  access: string;
  refresh: string;
}
export interface AuthResponseDto extends AuthTokensDto {
  user: AuthUserDto;
}
export interface ArtistDto {
  id: number | string;
  name: string;
  slug: string;
  image_url: string | null;
  biography: string | null;
  releases: ReleaseDto[];
}
export interface ArtistReferenceDto {
  id: number | string;
  name: string;
  slug: string;
  origin_country?: string | null;
}
export interface ReleaseDto {
  id: number | string;
  slug: string;
  title: string;
  release_year: number | null;
  cover_url: string | null;
  artists: ArtistReferenceDto[];
  price?: string | number | null;
  genres?: Array<string | NamedDto>;
  styles?: Array<string | NamedDto>;
  country?: string | null;
}
export interface NamedDto {
  id: number | string;
  name: string;
  slug?: string;
}
export interface TrackDto {
  id: number | string;
  side: string | null;
  position: number | null;
  title: string;
  duration_seconds: number | null;
  audio_preview_url: string | null;
}
export interface ProductDto {
  id: number | string;
  pressing_country: string | null;
  price: string;
  stock_quantity: number;
  is_active: boolean;
}
export interface ReleaseDetailDto extends ReleaseDto {
  description: string | null;
  tracks: TrackDto[];
  products: ProductDto[];
}
export interface PaginatedDto<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
export interface CatalogFiltersDto {
  genres: string[];
  styles: string[];
  countries: string[];
  year_range: { min: number; max: number };
}
export interface SavedReleaseDto {
  id: number | string;
  release: ReleaseDto;
}
export interface CartItemDto {
  id: number | string;
  product: ProductDto & { release: ReleaseDto };
  quantity: number;
  subtotal: string;
}
export interface CartDto {
  id?: number | string;
  items: CartItemDto[];
  total: string;
}
export type CartItemResponseDto = CartItemDto;
export interface OrderItemDto {
  id: number | string;
  product: ProductDto & { release: ReleaseDto };
  quantity: number;
  price: string;
  subtotal: string;
}
export interface OrderDto {
  id: number | string;
  order_number: string;
  status: string;
  total: string;
  created_at: string;
  line_items_count?: number;
  subtotal?: string;
  checkout_data?: CreateOrderPayload;
  items?: OrderItemDto[];
}
export interface CreateOrderPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  shipping_address: string;
  postal_code: string;
  country: string;
}
