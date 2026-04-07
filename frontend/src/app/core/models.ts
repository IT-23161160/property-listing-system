export interface User {
  userId: string;
  name: string;
  email: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN' | string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Property {
  propertyId: string;
  title: string;
  description: string;
  price: number;
  location: string;
  sellerId: string;
  available: boolean;
  imagePath?: string;
  imageUrl?: string;
  categoryId?: string;
}

export interface Category {
  categoryId: string;
  name: string;
}

export interface Review {
  reviewId: string;
  userId: string;
  propertyId: string;
  rating: number;
  comment: string;
}

export interface Favorite {
  favoriteId: string;
  userId: string;
  propertyId: string;
  status: string;
}

export interface Booking {
  requestId: string;
  buyerId: string;
  propertyId: string;
  message: string;
  scheduledDate: string;
  status: string;
}

export interface PropertyDetailPayload {
  property: Property;
  seller: Pick<User, 'userId' | 'name' | 'email'>;
  reviews: Review[];
  categoryName: string;
  isBookmarked: boolean;
  canReview: boolean;
  sessionUserId: string;
}

export interface FavoritesPayload {
  favorites: Favorite[];
  properties: Property[];
  userId: string;
}

export interface AdminUsersPayload {
  users: User[];
  propertyCounts: Record<string, number>;
}

export interface AdminUserDetailsPayload {
  user: User;
  properties: Property[];
}

export interface AdminBookingsPayload {
  bookings: Booking[];
  propertyTitles: Record<string, string>;
  buyerNames: Record<string, string>;
  sellerNames: Record<string, string>;
}
