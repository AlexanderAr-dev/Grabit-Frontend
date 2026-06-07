import { CardPreview, IRentalDetail, IRentalItem, IReview, IUserInfo } from '../types';

export interface BackendMedia {
  id: string;
  url: string;
  media_type: string;
  sort_order: number;
}

export interface BackendListing {
  listing_id: string;
  owner_id: string;
  title: string;
  description: string;
  category_id: number;
  price_per_hour: number;
  quantity: number;
  buffer_hours: number;
  lat?: number;
  lon?: number;
  address?: string;
  status: string;
  avg_rating: number;
  review_count: number;
  media: BackendMedia[];
  attributes: { key: string; value: string }[];
  created_at: string;
  updated_at: string;
}

export interface BackendUserResponse {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  gender?: string;
  birth_date?: string;
  phone?: string;
  language?: string;
  avatar_url?: string;
  profile_complete: boolean;
  active_listings_count: number;
  avg_rating_as_owner: number;
  review_count_as_owner: number;
  avg_rating_as_renter: number;
  review_count_as_renter: number;
  created_at: string;
}

export interface BackendReview {
  review_id: string;
  booking_id: string;
  listing_id: string;
  author_id: string;
  target_id?: string;
  review_type: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface BackendCategory {
  id: number;
  parent_id?: number;
  name: string;
  slug: string;
  sort_order: number;
}

export interface BackendPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export function mapListing(b: BackendListing): IRentalItem {
  return {
    id: b.listing_id,
    title: b.title,
    description: b.description,
    cost: { payment: b.price_per_hour, priceUnit: 'час' },
    category: { id: b.category_id, name: null },
    productType: null,
    address: b.address ?? '',
    rating: b.avg_rating,
    reviewCount: b.review_count,
    previewImage: b.media[0] ? { id: 0, url: b.media[0].url } : undefined,
    createdDate: b.created_at,
    quantity: b.quantity,
    status: b.status,
    lat: b.lat,
    lon: b.lon,
  };
}

export function mapListingDetail(b: BackendListing): IRentalDetail {
  return {
    ...mapListing(b),
    ownerId: b.owner_id,
    attributes: b.attributes,
    media: b.media.map(m => ({ id: m.id, media_id: m.id, url: m.url, mediaType: m.media_type, sort_order: m.sort_order })),
    renter: undefined,
    reviews: b.review_count,
    bookingCalendar: '',
    coordinates: b.lat != null && b.lon != null ? `${b.lat},${b.lon}` : undefined,
    bufferHours: b.buffer_hours,
  };
}

export function mapUser(b: BackendUserResponse): IUserInfo {
  return {
    id: b.id,
    email: b.email,
    login: b.username,
    name: [b.first_name, b.last_name].filter(Boolean).join(' '),
    firstName: b.first_name,
    lastName: b.last_name,
    description: null,
    phoneNumber: b.phone ?? '',
    avatar: b.avatar_url ? { id: 0, url: b.avatar_url } : undefined,
    stats: {
      reviews: b.review_count_as_owner + b.review_count_as_renter,
      rating: b.avg_rating_as_owner,
      offers: b.active_listings_count,
    },
    ratingAsOwner: b.avg_rating_as_owner,
    ratingAsRenter: b.avg_rating_as_renter,
    reviewCountAsOwner: b.review_count_as_owner,
    reviewCountAsRenter: b.review_count_as_renter,
    birthDate: b.birth_date,
    gender: b.gender,
    profileComplete: b.profile_complete,
    language: b.language ?? null,
    isVerified: null,
  };
}

export function mapReview(b: BackendReview): IReview {
  return {
    id: b.review_id,
    adName: null,
    author: { id: 0, name: null },
    authorId: b.author_id,
    createdDate: b.created_at,
    text: b.comment,
    rating: b.rating,
  };
}

export function mapListingToCard(b: BackendListing): CardPreview {
  return {
    id: b.listing_id,
    title: b.title,
    price: b.price_per_hour,
    priceUnit: 'час',
    location: b.address ?? '',
    rating: b.avg_rating,
    reviewCount: b.review_count,
    shortDescription: b.description,
    createdAt: new Date(b.created_at).toLocaleDateString('ru-RU'),
    category: { id: b.category_id, name: null },
    previewImage: b.media[0]?.url,
    status: b.status,
  };
}
