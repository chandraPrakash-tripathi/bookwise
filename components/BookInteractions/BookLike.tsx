"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { checkLikeStatus, toggleBookLike } from "@/lib/actions/bookInteractions";

interface BookLikeProps {
  bookId: string;
  userId?: string;
  initialLikeCount?: number;
  initialLiked?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const BookLike = ({
  bookId,
  userId,
  initialLikeCount = 0,
  initialLiked = false,
  size = "md",
  className,
}: BookLikeProps) => {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);

  // Set sizes based on the size prop
  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  useEffect(() => {
    // Check if user has liked this book before
    const fetchLikeStatus = async () => {
      if (!userId) return;
      
      try {
        const data = await checkLikeStatus(bookId, userId);
        if (data) {
          setLiked(data.hasLiked);
          setLikeCount(data.likeCount);
        }
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };
    
    fetchLikeStatus();
  }, [bookId, userId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userId) {
      // Handle unauthenticated user
      console.log("Please login to like books");
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await toggleBookLike(bookId, userId, liked);
      
      if (result.success) {
        setLiked(!liked);
        setLikeCount(result.likeCount);
      } else {
        console.error("Error toggling like:", result.error);
      }
    } catch (error) {
      console.error("Error updating like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      className={cn(
        "flex items-center gap-1.5 transition-all duration-300", 
        liked ? "text-red-500" : "text-gray-400 hover:text-red-400",
        !userId && "hover:text-gray-300 cursor-not-allowed",
        isLoading && "opacity-50 cursor-wait",
        className
      )}
      onClick={handleLike}
      disabled={isLoading || !userId}
      aria-label={liked ? "Unlike book" : "Like book"}
    >
      <Heart 
        size={iconSizes[size]} 
        fill={liked ? "currentColor" : "none"} 
        className={cn(
          "transition-transform duration-300", 
          isLoading ? "animate-pulse" : "",
          liked && "scale-110",
          userId && !liked && "group-hover:scale-105"
        )}
      />
      <span className={cn(
        "font-medium transition-all", 
        textSizes[size]
      )}>
        {likeCount}
      </span>
    </button>
  );
};

export default BookLike;