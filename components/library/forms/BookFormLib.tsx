"use client";
import ColorPicker from "@/components/admin/ColorPicker";
import FileUpload from "@/components/FileUpload";
import { createLibraryBook, updateLibraryBook } from "@/lib/library/actions/book";
import { bookSchemaLib } from "@/lib/validations";
import { Book } from "@/types";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

interface Props extends Partial<Book> {
  type?: "create" | "update";
  onSubmit?: (data: z.infer<typeof bookSchemaLib>) => void;
  libraryId: string;
  bookToEdit?: Book | null;
}

const BookFormLib: React.FC<Props> = ({
  type :providedType,
  onSubmit,
  libraryId,
  bookToEdit,
  title = "",
  description = "",
  author = "",
  genre = "",
  isbn = "",
  publicationYear,
  publisher = "",
  rating = 1,
  coverUrl = "",
  coverColor = "#FFFFFF",
  videoUrl = "",
  summary = "",
  totalCopies = 1,
  availableCopies,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title,
    description,
    author,
    genre,
    isbn,
    publicationYear: publicationYear || undefined,
    publisher,
    rating,
    coverUrl,
    coverColor,
    videoUrl,
    summary,
    totalCopies,
    availableCopies,
    libraryId,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const type = providedType || (bookToEdit?.id ? "update" : "create");

  useEffect(() => {
    if (bookToEdit) {
      setFormData({
        title: bookToEdit.title,
        description: bookToEdit.description,
        author: bookToEdit.author,
        genre: bookToEdit.genre,
        isbn: bookToEdit.isbn || "",
        publicationYear: bookToEdit.publicationYear || undefined,
        publisher: bookToEdit.publisher  || "",
        rating: bookToEdit.rating,
        coverUrl: bookToEdit.coverUrl,
        coverColor: bookToEdit.coverColor,
        videoUrl: bookToEdit.videoUrl,
        summary: bookToEdit.summary,
        totalCopies: bookToEdit.totalCopies,
        libraryId: bookToEdit.libraryId,
        availableCopies: bookToEdit.availableCopies,
      });
    }
  }, [bookToEdit]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === "number" ? (value ? Number(value) : "") : value;

    setFormData({
      ...formData,
      [name]: newValue,
    });
    
    // Log form data on each change
    console.log(`Field "${name}" updated to:`, newValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Log the complete form data on submission
    console.log(`Form submitted with type: ${type}`);
    console.log("Form data:", formData);
    
    if (type === "update" && !bookToEdit?.id) {
      toast.error("Cannot update book: Missing book ID");
      setIsSubmitting(false);
      return;
    }

    try {
      const validData = bookSchemaLib.parse(formData);
      console.log("Validated form data:", validData);
      
      let response;
      
      // Call the appropriate server action based on type
      if (type === "create") {
        console.log("Creating new book");
        response = await createLibraryBook(validData);
      } else if (type === "update" && bookToEdit?.id) {
        console.log(`Updating existing book with ID: ${bookToEdit.id}`);
        response = await updateLibraryBook(bookToEdit.id, validData);
      } else {
        throw new Error("Invalid operation or missing book ID");
      }
      
      if (response.success) {
        toast.success(response.message);
        // If onSubmit prop is provided, call it as well
        if (onSubmit) {
          onSubmit(validData);
        }
        setErrors({});
        // Optionally reset form or redirect
      } else {
        toast.error(response.message || "Failed to submit book");
        console.error("Server error:", response.error);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            formattedErrors[err.path[0]] = err.message;
          }
        });
        setErrors(formattedErrors);
        console.error("Validation errors:", formattedErrors);
      } else {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error(`An error occurred: ${errorMessage}`);
        console.error("Form submission error:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const genreOptions = [
    "Fiction",
    "Non-fiction",
    "Science Fiction",
    "Fantasy",
    "Mystery",
    "Thriller",
    "Romance",
    "Historical Fiction",
    "Biography",
    "Autobiography",
    "Self-help",
    "Business",
    "Technology",
    "Science",
    "Art",
    "Poetry",
    "Drama",
    "Horror",
    "Adventure",
    "Children's",
    "Young Adult",
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">
        {type === "create" ? "Add New Book" : "Update Book"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="libraryId" value={libraryId} />

        <div className="grid md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="col-span-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Author */}
          <div>
            <label
              htmlFor="author"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Author *
            </label>
            <input
              id="author"
              name="author"
              type="text"
              value={formData.author}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.author ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.author && (
              <p className="mt-1 text-sm text-red-500">{errors.author}</p>
            )}
          </div>

          {/* Genre */}
          <div>
            <label
              htmlFor="genre"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Genre *
            </label>
            <select
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.genre ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Genre</option>
              {genreOptions.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
            {errors.genre && (
              <p className="mt-1 text-sm text-red-500">{errors.genre}</p>
            )}
          </div>

          {/* ISBN */}
          <div>
            <label
              htmlFor="isbn"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ISBN (optional)
            </label>
            <input
              id="isbn"
              name="isbn"
              type="text"
              value={formData.isbn || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.isbn && (
              <p className="mt-1 text-sm text-red-500">{errors.isbn}</p>
            )}
          </div>

          {/* Publication Year */}
          <div>
            <label
              htmlFor="publicationYear"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Publication Year (optional)
            </label>
            <input
              id="publicationYear"
              name="publicationYear"
              type="number"
              min="1000"
              max={new Date().getFullYear()}
              value={formData.publicationYear || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.publicationYear && (
              <p className="mt-1 text-sm text-red-500">
                {errors.publicationYear}
              </p>
            )}
          </div>

          {/* Publisher */}
          <div>
            <label
              htmlFor="publisher"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Publisher (optional)
            </label>
            <input
              id="publisher"
              name="publisher"
              type="text"
              value={formData.publisher || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.publisher && (
              <p className="mt-1 text-sm text-red-500">{errors.publisher}</p>
            )}
          </div>

          {/* Rating */}
          <div>
            <label
              htmlFor="rating"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Rating * (1-5)
            </label>
            <input
              id="rating"
              name="rating"
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.rating ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.rating && (
              <p className="mt-1 text-sm text-red-500">{errors.rating}</p>
            )}
          </div>

          {/* Total Copies */}
          <div>
            <label
              htmlFor="totalCopies"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Total Copies *
            </label>
            <input
              id="totalCopies"
              name="totalCopies"
              type="number"
              min="1"
              value={formData.totalCopies}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.totalCopies ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.totalCopies && (
              <p className="mt-1 text-sm text-red-500">{errors.totalCopies}</p>
            )}
          </div>

          {/* Available Copies */}
          <div>
            <label
              htmlFor="availableCopies"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Available Copies (optional)
            </label>
            <input
              id="availableCopies"
              name="availableCopies"
              type="number"
              min="0"
              value={formData.availableCopies || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.availableCopies && (
              <p className="mt-1 text-sm text-red-500">
                {errors.availableCopies}
              </p>
            )}
          </div>

          {/* Cover URL */}
          <div>
            <label
              htmlFor="coverUrl"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Cover URL *
            </label>
            <FileUpload
              type="image"
              accept="image/*"
              placeholder="Upload a book cover"
              folder="books/covers"
              variant="light"
              onFileChange={(filePath: string) => {
                setFormData({ ...formData, coverUrl: filePath });
                console.log("Cover URL updated:", filePath);
              }}
              value={formData.coverUrl}
            />
            {errors.coverUrl && (
              <p className="mt-1 text-sm text-red-500">{errors.coverUrl}</p>
            )}
          </div>

          {/* Cover Color */}
          <div>
            <label
              htmlFor="coverColor"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Cover Color * (hex)
            </label>
            <div className="flex gap-2">
              <ColorPicker
                onPickerChange={(color: string) => {
                  setFormData({ ...formData, coverColor: color });
                  console.log("Cover color updated:", color);
                }}
                value={formData.coverColor}
              />
            </div>
            {errors.coverColor && (
              <p className="mt-1 text-sm text-red-500">{errors.coverColor}</p>
            )}
          </div>

          {/* Video URL */}
          <div className="col-span-2">
            <label
              htmlFor="videoUrl"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Video URL *
            </label>
            <FileUpload
              type="video"
              accept="video/*"
              placeholder="Upload a book trailer"
              folder="books/videos"
              variant="light"
              onFileChange={(filePath: string) => {
                setFormData({ ...formData, videoUrl: filePath });
                console.log("Video URL updated:", filePath);
              }}
              value={formData.videoUrl}
            />
            {errors.videoUrl && (
              <p className="mt-1 text-sm text-red-500">{errors.videoUrl}</p>
            )}
          </div>

          {/* Description */}
          <div className="col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Summary */}
          <div className="col-span-2">
            <label
              htmlFor="summary"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Summary *
            </label>
            <textarea
              id="summary"
              name="summary"
              rows={4}
              value={formData.summary}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.summary ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.summary && (
              <p className="mt-1 text-sm text-red-500">{errors.summary}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => console.log("Form cancelled, current values:", formData)}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : type === "create" ? "Add Book" : "Update Book"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookFormLib;