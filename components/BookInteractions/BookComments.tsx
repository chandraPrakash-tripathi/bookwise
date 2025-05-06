"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchBookComments, submitBookComment } from "@/lib/actions/bookInteractions";
import { BookComment } from "@/types";

// Use the BookComment type from our server actions
type Comment = BookComment;

interface BookCommentsProps {
  bookId: string;
  userId?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  initialCommentCount?: number;
  maxHeight?: string;
}

const BookComments = ({
  bookId,
  userId,
  size = "md",
  className,
  initialCommentCount = 0,
  maxHeight = "max-h-40",
}: BookCommentsProps) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(initialCommentCount);

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

  const loadComments = async () => {
    if (!showComments) return;
    
    try {
      setIsLoading(true);
      const data = await fetchBookComments(bookId);
      if (data && data.reviews) {
        // Ensure all reviews have non-null review text and properly type-cast
        const validComments = data.reviews
          .filter((comment): comment is Comment => 
            comment !== null && comment.review !== null
          )
          .map(comment => ({
            ...comment,
            review: comment.review || "",  // Convert null to empty string if needed
            user: comment.user || { fullName: "User", profilePicture: null }
          }));
          
        setComments(validComments);
        setCommentCount(validComments.length);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments, bookId]);

  const toggleComments = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowComments(!showComments);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      console.log("Please login to comment");
      return;
    }

    if (!newComment.trim()) return;
    
    try {
      setIsLoading(true);
      const result = await submitBookComment(bookId, userId, newComment);
      
      if (result.success && result.comment) {
        // Ensure the comment is properly formatted for our state
        const newValidComment: Comment = {
          ...result.comment,
          review: result.comment.review || "", // Convert null to empty string
          user: result.comment.user || { fullName: "User", profilePicture: null }
        };
        
        setComments([...comments, newValidComment]);
        setCommentCount(commentCount + 1);
        setNewComment("");
      } else {
        console.error("Error submitting comment:", result.error);
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className={cn("relative", className)} onClick={(e) => e.stopPropagation()}>
      <button 
        className={cn(
          "flex items-center gap-1.5 transition-all duration-300", 
          showComments ? "text-blue-500" : "text-gray-400 hover:text-blue-400",
          !userId && "hover:text-gray-300 cursor-not-allowed"
        )}
        onClick={toggleComments}
        aria-label={showComments ? "Hide comments" : "Show comments"}
      >
        <MessageCircle 
          size={iconSizes[size]} 
          className={cn(
            "transition-transform duration-300",
            showComments && "rotate-[-8deg]"
          )}
        />
        <span className={cn("font-medium", textSizes[size])}>{commentCount}</span>
      </button>

      {showComments && (
        <div className="absolute z-50 left-0 mt-3 p-4 bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl w-64 sm:w-80 border border-gray-700/50 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-semibold">Comments</h3>
            <button 
              onClick={toggleComments} 
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700/50 transition-colors"
              aria-label="Close comments"
            >
              <X size={16} />
            </button>
          </div>

          {isLoading && comments.length === 0 ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : comments.length > 0 ? (
            <div className={cn("overflow-y-auto mb-4 pr-1 scrollbar-hide", maxHeight)}>
              {comments.map((comment) => (
                <div key={comment.id} className="mb-3 pb-3 border-b border-gray-700/50 last:border-0">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-white">
                      {comment.user?.fullName || "User"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-200 mt-1.5 break-words">{comment.review || ""}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-4 text-center py-3">No comments yet. Be the first!</p>
          )}
          
          {userId ? (
            <form className="flex mt-1" onSubmit={handleSubmitComment}>
              <input
                type="text"
                className="flex-1 bg-gray-700/70 text-white rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isLoading}
              />
              <button 
                type="submit"
                className={cn(
                  "bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg px-3 py-2 transition-colors",
                  "flex items-center justify-center",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
                disabled={isLoading || !newComment.trim()}
              >
                <Send size={16} className={isLoading ? "animate-pulse" : ""}/>
              </button>
            </form>
          ) : (
            <p className="text-xs text-center text-gray-400 bg-gray-700/50 rounded-lg py-2">Login to comment</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BookComments;