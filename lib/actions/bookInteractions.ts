'use server';

import { db } from "@/db/drizzle";
import { bookLikes, bookReviews, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { BookComment } from "@/types";

/**
 * Check if a user has liked a book and get the total like count
 */
export async function checkLikeStatus(bookId: string, userId: string) {
  try {
    // Get total like count
    const allLikes = await db.select().from(bookLikes).where(eq(bookLikes.bookId, bookId));
    const likeCount = allLikes.length;

    // Check if user has liked the book
    let hasLiked = false;
    if (userId) {
      const userLike = await db.select().from(bookLikes).where(
        and(
          eq(bookLikes.bookId, bookId),
          eq(bookLikes.userId, userId)
        )
      ).limit(1);
      
      hasLiked = userLike.length > 0;
    }

    return { likeCount, hasLiked };
  } catch (error) {
    console.error("Error fetching book likes:", error);
    throw new Error("Failed to fetch likes");
  }
}

/**
 * Toggle like/unlike status for a book
 */
export async function toggleBookLike(bookId: string, userId: string, currentlyLiked: boolean) {
  try {
    // Validate user session
    const session = await auth();
    if (!session || session.user?.id !== userId) {
      return { 
        success: false, 
        error: "Unauthorized",
        likeCount: 0
      };
    }

    if (currentlyLiked) {
      // Unlike the book
      await db.delete(bookLikes).where(
        and(
          eq(bookLikes.bookId, bookId),
          eq(bookLikes.userId, userId)
        )
      );
    } else {
      // Check if user already liked the book (double-check to prevent duplicates)
      const existingLike = await db.select().from(bookLikes).where(
        and(
          eq(bookLikes.bookId, bookId),
          eq(bookLikes.userId, userId)
        )
      ).limit(1);

      if (existingLike.length === 0) {
        // Add new like
        await db.insert(bookLikes).values({
          bookId,
          userId
        });
      }
    }

    // Get updated like count
    const allLikes = await db.select().from(bookLikes).where(eq(bookLikes.bookId, bookId));
    
    return { 
      success: true, 
      likeCount: allLikes.length
    };
  } catch (error) {
    console.error("Error toggling book like:", error);
    return { 
      success: false, 
      error: "Failed to update like status",
      likeCount: 0
    };
  }
}



/**
 * Fetch all comments/reviews for a book
 */
export async function fetchBookComments(bookId: string): Promise<{ 
  reviews: BookComment[] 
}> {
  try {
    // Join with users to get user details
    const reviews = await db
      .select({
        id: bookReviews.id,
        userId: bookReviews.userId,
        bookId: bookReviews.bookId,
        rating: bookReviews.rating,
        review: bookReviews.review,
        createdAt: bookReviews.createdAt,
        updatedAt: bookReviews.updatedAt,
        user: {
          fullName: users.fullName,
          profilePicture: users.profilePicture,
        }
      })
      .from(bookReviews)
      .leftJoin(users, eq(bookReviews.userId, users.id))
      .where(eq(bookReviews.bookId, bookId))
      .orderBy(bookReviews.createdAt);
      
    return { reviews };
  } catch (error) {
    console.error("Error fetching book reviews:", error);
    throw new Error("Failed to fetch reviews");
  }
}

/**
 * Submit a new comment/review for a book
 */
export async function submitBookComment(
  bookId: string, 
  userId: string, 
  reviewText: string, 
  rating: number = 0
): Promise<{
  success: boolean;
  error?: string;
  comment: BookComment | null;
}> {
  try {
    // Validate user session
    const session = await auth();
    if (!session || session.user?.id !== userId) {
      return { 
        success: false, 
        error: "Unauthorized",
        comment: null
      };
    }

    // Validate review data
    if (!reviewText.trim()) {
      return {
        success: false,
        error: "Review text is required",
        comment: null
      };
    }

    // Add new review
    const [newReview] = await db.insert(bookReviews)
      .values({
        bookId,
        userId,
        rating,
        review: reviewText
      })
      .returning();

    // Get user info to return with the review
    const [user] = await db
      .select({
        fullName: users.fullName,
        profilePicture: users.profilePicture
      })
      .from(users)
      .where(eq(users.id, userId));

    const comment: BookComment = {
      ...newReview,
      user: user || null
    };

    return {
      success: true,
      comment
    };
  } catch (error) {
    console.error("Error adding review:", error);
    return {
      success: false,
      error: "Failed to add review",
      comment: null
    };
  }
}

/**
 * Delete a comment/review
 */
export async function deleteBookComment(reviewId: string, userId: string) {
  try {
    // Validate user session
    const session = await auth();
    if (!session) {
      return {
        success: false,
        error: "Unauthorized"
      };
    }

    // Check if the user is the review owner or an admin
    if (session.user?.id !== userId && (session.user as { role: string } | null)?.role !== "ADMIN") {
      return {
        success: false,
        error: "Not authorized to delete this review"
      };
    }

    // Delete the review
    await db.delete(bookReviews).where(eq(bookReviews.id, reviewId));
    
    return {
      success: true
    };
  } catch (error) {
    console.error("Error deleting review:", error);
    return {
      success: false,
      error: "Failed to delete review"
    };
  }
}