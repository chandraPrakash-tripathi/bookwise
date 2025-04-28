export interface PushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  universityId: number;
  universityCard: string;
  password: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  role: "USER" | "ADMIN" | "LIBRARY";
  profilePicture?: string;
  bio?: string;
  pushSubscription?: PushSubscription;
  lastActivityDate: Date;
  createdAt: Date;
}

export interface Library {
  id: string;
  name: string;
  userId: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  location?: { x: number; y: number }; // PostGIS point type
  latitude: number;
  longitude: number;
  logoUrl: string | null;  // Changed from optional to nullable
  description: string | null;  // Changed from optional to nullable
  openingHours?: {
    [day: string]: {
      open: string;
      close: string;
      isClosed: boolean;
    };
  };
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
  updatedAt: Date;
}

export interface Book {
  id: string;
  libraryId: string;
  title: string;
  author: string;
  genre: string;
  isbn: string | null;  // Changed from optional to nullable
  publicationYear: number | null;  // Changed from optional to nullable
  publisher: string | null;  // Changed from optional to nullable
  rating: number;
  coverUrl: string;
  coverColor: string;
  description: string;
  totalCopies: number;
  availableCopies: number;
  videoUrl: string; // Changed to required (not optional)
  summary: string;
  isApproved: boolean;
  approvedBy: string | null; // Changed from optional to nullable
  createdAt: Date;
  updatedAt: Date  | null;
}

export interface BookWithLibrary extends Book {
  library: Library;
  distance?: number; // For nearby searches
  averageRating?: number;
  reviewCount?: number;
  likeCount?: number;
}

export interface BookReview {
  id: string;
  bookId: string;
  userId: string;
  rating: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface BookLike {
  id: string;
  bookId: string;
  userId: string;
  createdAt: Date;
}

export interface BorrowRecord {
  id: string;
  userId: string;
  bookId: string;
  libraryId: string;
  requestDate: Date;
  borrowDate: Date | null;  // Changed to nullable
  dueDate: Date | string | null;  // Changed to nullable and allow string
  returnDate: Date | string | null;  // Already nullable
  status: "PENDING" | "APPROVED" | "REJECTED" | "BORROW" | "RETURNED" | "OVERDUE";
  deliveryMethod: "TAKEAWAY" | "DELIVERY";
  deliveryAddressId: string | null;  // Already correctly nullable
  handledBy: string | null;  // Already correctly nullable
  notes: string | null;  // Already correctly nullable
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BorrowRecordWithDetails extends BorrowRecord {
  book: Book;
  user: User;
  library: Library;
  deliveryAddress?: DeliveryAddress;
  bookCondition?: BookConditionRecord;
}

export interface BookConditionRecord {
  id: string;
  borrowRecordId: string;
  beforeBorrowPhotos: string[];
  afterReturnPhotos: string[];
  beforeConditionNotes?: string;
  afterConditionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryAddress {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  favoriteGenres: string[];
  favoriteAuthors: string[];
  readingGoal?: number;
  booksRead: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: "BORROW_REQUEST" | "REQUEST_APPROVED" | "REQUEST_REJECTED" | "BOOK_RETURNED" | "RETURN_REMINDER" | "NEW_BOOK_ADDED" | "BOOK_REVIEW" | "ACCOUNT_APPROVED" | "SYSTEM_NOTIFICATION";
  title: string;
  message: string;
  data?: unknown;
  isRead: boolean;
  createdAt: Date;
}

// Request/Response interfaces

export interface AuthCredentials {
  fullName: string;
  email: string;
  password: string;
  universityId: number;
  universityCard: string;
}

export interface UserUpdateParams {
  fullName?: string;
  email?: string;
  password?: string;
  profilePicture?: string;
  bio?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  role?: "USER" | "ADMIN" | "LIBRARY";
}

export interface PushSubscriptionParams {
  userId: string;
  subscription: PushSubscription;
}

export interface LibraryRegisterParams {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number;
  longitude: number;
  logoUrl?: string;
  description?: string;
  openingHours?: {
    [day: string]: {
      open: string;
      close: string;
      isClosed: boolean;
    };
  };
}

export interface BookParams {
  libraryId: string;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  publicationYear: number;
  publisher?: string;
  rating: number;
  coverUrl: string;
  coverColor: string;
  description: string;
  totalCopies: number;
  availableCopies: number; // Optional in params as it defaults to 0
  videoUrl: string; // Changed to required
  summary: string;
}

export interface BorrowBookParams {
  libraryId: string; // Added libraryId
  bookId: string;
  userId: string;
  deliveryMethod: "TAKEAWAY" | "DELIVERY";
  deliveryAddressId?: string;
  notes?: string;
 
}

export interface ReviewBookParams {
  bookId: string;
  userId: string;
  rating: number;
  review?: string;
}

export interface BookConditionParams {
  borrowRecordId: string;
  photos: string[];
  conditionNotes?: string;
  isReturnCondition: boolean;
}

export interface NotificationParams {
  userId: string;
  type: "BORROW_REQUEST" | "REQUEST_APPROVED" | "REQUEST_REJECTED" | "BOOK_RETURNED" | "RETURN_REMINDER" | "NEW_BOOK_ADDED" | "BOOK_REVIEW" | "ACCOUNT_APPROVED" | "SYSTEM_NOTIFICATION";
  title: string;
  message: string;
  data?: unknown;
}

export interface NearbyLibraryParams {
  latitude: number;
  longitude: number;
  radius?: number; // in kilometers
}

export interface DeliveryAddressParams {
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

// API response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// Updated to match database schema with nullable fields
interface BookType {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  description: string | null;
  genre: string;
  isbn: string | null;
  publicationYear: number | null;
  publisher: string | null;
  rating: number;
  coverColor: string | null;
}

// Updated to match database schema with nullable fields
export interface BorrowRecordType {
  id: string;
  bookId: string;
  userId: string;
  libraryId: string;
  borrowDate: Date;
  dueDate: string | Date;
  returnDate: string | Date | null;
  status: string;
  deliveryMethod: string | null;
}

// Updated to match database schema with nullable fields
interface LibraryType {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
}

