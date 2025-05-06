import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { bookLikes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";

// GET endpoint to check if user has liked a book and get like count
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params Promise to get the id
    const bookId = (await params).id;
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

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

    return NextResponse.json({ likeCount, hasLiked });
  } catch (error) {
    console.error("Error fetching book likes:", error);
    return NextResponse.json(
      { error: "Failed to fetch likes" },
      { status: 500 }
    );
  }
}

// POST endpoint to like a book
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params Promise to get the id
    const bookId = (await params).id;
    const { userId } = await request.json();

    // Validate user session
    const session = await auth();
    if (!session || session.user?.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user already liked the book
    const existingLike = await db.select().from(bookLikes).where(
      and(
        eq(bookLikes.bookId, bookId),
        eq(bookLikes.userId, userId)
      )
    ).limit(1);

    if (existingLike.length > 0) {
      return NextResponse.json(
        { error: "User already liked this book" },
        { status: 400 }
      );
    }

    // Add new like
    await db.insert(bookLikes).values({
      bookId,
      userId
    });

    // Get updated like count
    const allLikes = await db.select().from(bookLikes).where(eq(bookLikes.bookId, bookId));
    
    return NextResponse.json({ 
      message: "Book liked successfully", 
      likeCount: allLikes.length 
    });
  } catch (error) {
    console.error("Error liking book:", error);
    return NextResponse.json(
      { error: "Failed to like book" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to unlike a book
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params Promise to get the id
    const bookId = (await params).id;
    const { userId } = await request.json();

    // Validate user session
    const session = await auth();
    if (!session || session.user?.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete the like
    await db.delete(bookLikes).where(
      and(
        eq(bookLikes.bookId, bookId),
        eq(bookLikes.userId, userId)
      )
    );

    // Get updated like count
    const allLikes = await db.select().from(bookLikes).where(eq(bookLikes.bookId, bookId));
    
    return NextResponse.json({ 
      message: "Book unliked successfully", 
      likeCount: allLikes.length 
    });
  } catch (error) {
    console.error("Error unliking book:", error);
    return NextResponse.json(
      { error: "Failed to unlike book" },
      { status: 500 }
    );
  }
}