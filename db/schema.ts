import {
  uuid,
  pgTable,
  varchar,
  text,
  integer,
  pgEnum,
  date,
  timestamp,
  boolean,
  doublePrecision,
  json,
  jsonb,
  point,
} from "drizzle-orm/pg-core";

// ENUMS
export const STATUS_ENUM = pgEnum("status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const ROLE_ENUM = pgEnum("role", ["USER", "ADMIN", "LIBRARY"]);

export const RECEIPT_TYPE_ENUM = pgEnum("receipt_type", [
  "BORROW",
  "RETURN",
]);

export const BORROW_STATUS_ENUM = pgEnum("borrow_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "BORROW",
  "RETURNED",
  "OVERDUE",
]);

export const DELIVERY_METHOD_ENUM = pgEnum("delivery_method", [
  "TAKEAWAY",
  "DELIVERY",
]);

export const NOTIFICATION_TYPE_ENUM = pgEnum("notification_type", [
  "BORROW_REQUEST",
  "REQUEST_APPROVED",
  "REQUEST_REJECTED",
  "BOOK_RETURNED",
  "RETURN_REMINDER",
  "NEW_BOOK_ADDED",
  "BOOK_REVIEW",
  "ACCOUNT_APPROVED",
  "SYSTEM_NOTIFICATION",
]);

// TABLES
export const users = pgTable("users", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: text("email").notNull().unique(),
  universityId: integer("university_id").notNull().unique(),
  universityCard: text("university_card").notNull(),
  password: text("password").notNull(),
  status: STATUS_ENUM('status').default("PENDING"),
  role: ROLE_ENUM('role').default("USER"),
  profilePicture: text("profile_picture"),
  bio: text("bio"),
  pushSubscription: jsonb("push_subscription"),
  lastActivityDate: date("last_activity_date").defaultNow(),
  createdAt: timestamp("created_at", {withTimezone:true}).defaultNow(),
});

export const libraries = pgTable("libraries", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  email: text("email").notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  zipCode: varchar("zip_code", { length: 20 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  // Replace geography with point for location
  location: point("location"),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  logoUrl: text("logo_url"),
  description: text("description"),
  openingHours: jsonb("opening_hours"),
  status: STATUS_ENUM('status').default("PENDING"),
  createdAt: timestamp("created_at", {withTimezone:true}).defaultNow(),
  updatedAt: timestamp("updated_at", {withTimezone:true}).defaultNow(),
});

export const books = pgTable("books", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  libraryId: uuid("library_id").references(() => libraries.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  genre: text("genre").notNull(),
  isbn: varchar("isbn", { length: 20 }),
  publicationYear: integer("publication_year"),
  publisher: varchar("publisher", { length: 255 }),
  rating: integer("rating").notNull(),
  coverUrl: text("cover_url").notNull(),
  coverColor: varchar("cover_color", { length: 7 }).notNull(),
  description: text("description").notNull(),
  totalCopies: integer("total_copies").notNull().default(1),
  availableCopies: integer("available_copies").notNull().default(0),
  videoUrl: text("video_url").notNull(),
  summary: varchar("summary").notNull(),
  isApproved: boolean("is_approved").default(false),
  approvedBy: uuid("approved_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const bookReviews = pgTable("book_reviews", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  bookId: uuid("book_id").references(() => books.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(),
  review: text("review"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const bookLikes = pgTable("book_likes", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  bookId: uuid("book_id").references(() => books.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const borrowRecords = pgTable("borrow_records", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  bookId: uuid("book_id").references(() => books.id).notNull(),
  libraryId: uuid("library_id").references(() => libraries.id).notNull(),
  requestDate: timestamp("request_date", { withTimezone: true }).defaultNow().notNull(),
  borrowDate: timestamp("borrow_date", { withTimezone: true }),
  dueDate: date("due_date"),
  returnDate: date("return_date"),
  status: BORROW_STATUS_ENUM("status").default("PENDING").notNull(),
  deliveryMethod: DELIVERY_METHOD_ENUM("delivery_method").default("TAKEAWAY").notNull(),
  deliveryAddressId: uuid("delivery_address_id").references(() => deliveryAddresses.id),
  handledBy: uuid("handled_by").references(() => users.id),
  notes: text("notes"),
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const bookConditionRecords = pgTable("book_condition_records", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  borrowRecordId: uuid("borrow_record_id").references(() => borrowRecords.id).notNull(),
  beforeBorrowPhotos: json("before_borrow_photos").default([]),
  afterReturnPhotos: json("after_return_photos").default([]),
  beforeConditionNotes: text("before_condition_notes"),
  afterConditionNotes: text("after_condition_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const deliveryAddresses = pgTable("delivery_addresses", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  zipCode: varchar("zip_code", { length: 20 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  userId: uuid("user_id").references(() => users.id).notNull().unique(),
  favoriteGenres: json("favorite_genres").default([]),
  favoriteAuthors: json("favorite_authors").default([]),
  readingGoal: integer("reading_goal"),
  booksRead: integer("books_read").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  type: NOTIFICATION_TYPE_ENUM("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  data: jsonb("data"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const receipts = pgTable("receipts", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  borrowRecordId: uuid("borrow_record_id").references(() => borrowRecords.id).notNull(),
  type: RECEIPT_TYPE_ENUM("type").notNull(),
  baseCharge: integer("base_charge").notNull().default(70), // Default 70 Rs for 7 days
  extraDays: integer("extra_days").default(0),
  extraCharge: integer("extra_charge").default(0), // Extra charge for late return
  totalCharge: integer("total_charge").notNull(),
  generatedBy: uuid("generated_by").references(() => users.id).notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow(),
  notes: text("notes"),
  isPrinted: boolean("is_printed").default(false),
  printedAt: timestamp("printed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});