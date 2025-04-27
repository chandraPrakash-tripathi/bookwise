"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { bookSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";

import { z } from "zod";
import ColorPicker from "../ColorPicker";
import FileUpload from "@/components/FileUpload";
import { createBook } from "@/lib/admin/actions/book";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Book } from "@/types";

interface Props extends Partial<Book> {
  type?: "create" | "update";
}
const BookForm = ({ type = "create", ...bookData }: Props) => {
  const router = useRouter();

  // Initialize form with bookData if available (for updates)
  const form = useForm<z.infer<typeof bookSchema>>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: bookData?.title || "",
      author: bookData?.author || "",
      description: bookData?.description || "",
      genre: bookData?.genre || "",
      rating: bookData?.rating || 1,
      totalCopies: bookData?.totalCopies || 1,
      coverUrl: bookData?.coverUrl || "",
      coverColor: bookData?.coverColor || "",
      videoUrl: bookData?.videoUrl || "",
      summary: bookData?.summary || "",

    },
  });

  const onSubmit = async (values: z.infer<typeof bookSchema>) => {
    console.log("Form Values:", values);

    // You might want to handle updates differently
    if (type === "update" && bookData?.id) {
      // Example: updateBook(bookData.id, values);
      // Since this functionality isn't implemented yet, just log it
      console.log("Would update book with ID:", bookData.id);
      toast.info("Update functionality not implemented yet");
      return;
    }

    const result = await createBook({
      ...values,
      libraryId: bookData.libraryId || "",
      isbn: bookData.isbn || "",
      publicationYear: bookData.publicationYear || new Date().getFullYear(),
      availableCopies: bookData.availableCopies || values.totalCopies,
    });

    if (result.success) {
      toast.success("Book Created Successfully");
      router.push(`/admin/books/${result.data.id}`);
    } else {
      toast.error("Error creating book: " + result.message);
    }
  };

  // Change button text based on form type
  const buttonText = type === "create" ? "Add Book to Library" : "Update Book";

  return (
    <div className="flex flex-col gap-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            name={"title"}
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2 mt-8">
                <FormLabel className="capitalize">Book Title</FormLabel>
                <FormControl>
                  <Input
                    required
                    placeholder="Enter book title"
                    {...field}
                    className="book-form_input min-h-14 border border-gray-100 bg-slate-300 p-4 text-base font-semibold placeholder:font-normal placeholder:text-slate-500 "
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name={"author"}
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel className="capitalize">Author</FormLabel>
                <FormControl>
                  <Input
                    required
                    placeholder="Enter the author name"
                    {...field}
                    className="book-form_input min-h-14 border border-gray-100 bg-slate-300 p-4 text-base font-semibold placeholder:font-normal placeholder:text-slate-500 "
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name={"genre"}
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel className="capitalize">Genre</FormLabel>
                <FormControl>
                  <Input
                    required
                    placeholder="Enter the genre of the book"
                    {...field}
                    className="book-form_input min-h-14 border border-gray-100 bg-slate-300 p-4 text-base font-semibold placeholder:font-normal placeholder:text-slate-500 "
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={"rating"}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel className="text-base font-normal text-black ">
                  Rating
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    placeholder="Book rating"
                    {...field}
                    className="book-form_input min-h-14 border border-gray-100 bg-slate-300 p-4 text-base font-semibold placeholder:font-normal placeholder:text-slate-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name={"totalCopies"}
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel className="capitalize">
                  Total number of books
                </FormLabel>
                <FormControl>
                  <Input
                    required
                    type="number"
                    min={1}
                    max={1000}
                    placeholder="Enter book title"
                    {...field}
                    className="book-form_input min-h-14 border border-gray-100 bg-slate-300 p-4 text-base font-semibold placeholder:font-normal placeholder:text-slate-500 "
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={"coverUrl"}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel className="text-base font-normal text-black">
                  Book Image
                </FormLabel>
                <FormControl>
                  <FileUpload
                    type="image"
                    accept="image/*"
                    placeholder="Upload a book cover"
                    folder="books/covers"
                    variant="light"
                    onFileChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={"coverColor"}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel className="text-base font-normal text-black">
                  Primary Color
                </FormLabel>
                <FormControl>
                  <ColorPicker
                    onPickerChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={"description"}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel className="text-base font-normal text-black">
                  Book Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Book description"
                    {...field}
                    rows={10}
                    className="book-form_input"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={"videoUrl"}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel className="text-base font-normal text-black">
                  Book Trailer
                </FormLabel>
                <FormControl>
                  <FileUpload
                    type="video"
                    accept="video/*"
                    placeholder="Upload a book trailer"
                    folder="books/videos"
                    variant="light"
                    onFileChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={"summary"}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel className="text-base font-normal text-black">
                  Book Summary
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Book summary"
                    {...field}
                    rows={5}
                    className="book-form_input min-h-14 border border-gray-100 bg-gray-300 p-4 text-base font-semibold placeholder:font-normal placeholder:text-slate-500"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="book-form_btn text-white min-h-14 w-full bg-black hover:bg-gray-700"
          >
            {buttonText}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default BookForm;
