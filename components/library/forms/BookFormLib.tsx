'use client'
import React, { useState } from 'react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { bookSchema } from '@/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Book } from '@/types';
import FileUpload from "@/components/FileUpload";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ColorPicker from '@/components/admin/ColorPicker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from 'lucide-react';
import { createLibraryBook } from '@/lib/library/actions/book';

interface Props extends Partial<Book> {
  type?: "create" | "update";
}

const BookFormDialog = ({ type = "create", ...bookData }: Props) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

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
      isbn: bookData?.isbn || "",
      publicationYear: bookData?.publicationYear || 0,
      publisher: bookData?.publisher || "",
    },
  });

  // Define the onSubmit function outside of the JSX
  const onSubmit = async (values: z.infer<typeof bookSchema>) => {
    // Debug log to see values
    console.log("Form Values:", values);

    if (type === "update" && bookData?.id) {
      console.log("Would update book with ID:", bookData.id);
      toast.info("Update functionality not implemented yet");
      return;
    }

    // Assuming you have a createBook function similar to the reference
    try {
      // Replace with your actual createBook function
       const result = await createLibraryBook(values);
      

      if (result.success && result.data) {
        toast.success("Book Created Successfully");
        setOpen(false); // Close dialog on success
        router.push(`/library/books/${result.data.id}`);
      } else {
        toast.error("Error creating book");
      }
    } catch (error) {
      toast.error("Error creating book");
      console.error(error);
    }
  };

  const buttonText = type === "create" ? "Add Book to Library" : "Update Book";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-black text-white hover:bg-gray-800">
          <Plus size={16} />
          Add New Book
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{type === "create" ? "Add New Book" : "Update Book"}</DialogTitle>
          <DialogDescription>
            Fill in the book details and submit the form to {type === "create" ? "create a new book" : "update this book"}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(onSubmit)} 
              className="space-y-6"
            >
              <FormField
                name="title"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel className="capitalize">Book Title</FormLabel>
                    <FormControl>
                      <Input
                        required
                        placeholder="Enter book title"
                        {...field}
                        className="book-form_input min-h-14 border border-gray-100 bg-slate-300 p-4 text-base font-semibold placeholder:font-normal placeholder:text-slate-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="author"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel className="capitalize">Author</FormLabel>
                    <FormControl>
                      <Input
                        required
                        placeholder="Enter the author name"
                        {...field}
                        className="book-form_input min-h-14 border border-gray-100 bg-slate-300 p-4 text-base font-semibold placeholder:font-normal placeholder:text-slate-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="genre"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel className="capitalize">Genre</FormLabel>
                    <FormControl>
                      <Input
                        required
                        placeholder="Enter the genre of the book"
                        {...field}
                        className="book-form_input min-h-14 border border-gray-100 bg-slate-300 p-4 text-base font-semibold placeholder:font-normal placeholder:text-slate-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="isbn"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel className="capitalize">ISBN</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter ISBN"
                        {...field}
                        className="book-form_input min-h-14 border border-gray-100 bg-slate-300 p-4 text-base font-semibold placeholder:font-normal placeholder:text-slate-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="publisher"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel className="capitalize">Publisher</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter publisher name"
                        {...field}
                        className="book-form_input min-h-14 border border-gray-100 bg-slate-300 p-4 text-base font-semibold placeholder:font-normal placeholder:text-slate-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="publicationYear"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel className="capitalize">Publication Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter publication year"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                        className="book-form_input min-h-14 border border-gray-100 bg-slate-300 p-4 text-base font-semibold placeholder:font-normal placeholder:text-slate-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="rating"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1">
                    <FormLabel className="text-base font-normal text-black">
                      Rating
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        placeholder="Book rating"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 1)}
                        className="book-form_input min-h-14 border border-gray-100 bg-slate-300 p-4 text-base font-semibold placeholder:font-normal placeholder:text-slate-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="totalCopies"
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
                        placeholder="Enter total copies"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 1)}
                        className="book-form_input min-h-14 border border-gray-100 bg-slate-300 p-4 text-base font-semibold placeholder:font-normal placeholder:text-slate-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="coverUrl"
                control={form.control}
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
                name="coverColor"
                control={form.control}
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
                name="description"
                control={form.control}
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
                        className="book-form_input min-h-14 border border-gray-100 bg-slate-300 p-4 text-base font-semibold placeholder:font-normal placeholder:text-slate-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="videoUrl"
                control={form.control}
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
                name="summary"
                control={form.control}
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
                        className="book-form_input min-h-14 border border-gray-100 bg-slate-300 p-4 text-base font-semibold placeholder:font-normal placeholder:text-slate-500"
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
      </DialogContent>
    </Dialog>
  );
};

export default BookFormDialog;