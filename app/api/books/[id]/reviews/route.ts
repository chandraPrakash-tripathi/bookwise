import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { bookReviews, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

// GET endpoint to fetch book reviews/comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params Promise to get the id
    const bookId = (await params).id;

    // Join with users to get user details
    const reviews = await db
      .select({
        id: bookReviews.id,
        userId: bookReviews.userId,
        bookId: bookReviews.bookId,
        rating: bookReviews.rating,
        review: bookReviews.review,
        createdAt: bookReviews.createdAt,
        user: {
          fullName: users.fullName,
          profilePicture: users.profilePicture,
        }
      })
      .from(bookReviews)
      .leftJoin(users, eq(bookReviews.userId, users.id))
      .where(eq(bookReviews.bookId, bookId))
      .orderBy(bookReviews.createdAt);

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error fetching book reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST endpoint to add a new review/comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params Promise to get the id
    const bookId = (await params).id;
    const { userId, review, rating = 0 } = await request.json();

    // Validate user session
    const session = await auth();
    if (!session || session.user?.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate review data
    if (!review.trim()) {
      return NextResponse.json(
        { error: "Review text is required" },
        { status: 400 }
      );
    }

    // Add new review
    const [newReview] = await db.insert(bookReviews)
      .values({
        bookId,
        userId,
        rating,
        review
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

    return NextResponse.json({
      ...newReview,
      user
    });
  } catch (error) {
    console.error("Error adding review:", error);
    return NextResponse.json(
      { error: "Failed to add review" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove a review/comment
export async function DELETE(
  request: NextRequest
) {
  try {
    const { reviewId, userId } = await request.json();

    // Validate user session
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if the user is the review owner or an admin
    if (session.user?.id !== userId && (session.user as { role: string } | null)?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Not authorized to delete this review" },
        { status: 403 }
      );
    }

    // Delete the review
    await db.delete(bookReviews).where(eq(bookReviews.id, reviewId));
    
    return NextResponse.json({ 
      message: "Review deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}