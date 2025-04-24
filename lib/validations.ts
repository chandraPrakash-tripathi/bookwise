import { z } from "zod";

export const signupSchema = z.object({
    fullName:z.string().min(3),
    email:z.string().email(),
    password:z.string().min(8),
    universityId: z.coerce.number(),
    universityCard: z.string().nonempty("University Card is Required")

})

export const signInSchema = z.object({
    email:z.string().email(),
    password:z.string().min(8),
})


export const bookSchema = z.object({
  libraryId: z.string().uuid(),
  title: z.string().trim().min(2).max(255),
  author: z.string().trim().min(2).max(255),
  genre: z.string().trim().min(2), // no max, as genre is stored as text
  isbn: z.string().trim().max(20).optional(),
  publicationYear: z.number().int().min(0).max(new Date().getFullYear()).optional(),
  publisher: z.string().trim().max(255).optional(),
  rating: z.coerce.number().int().min(1).max(5),
  coverUrl: z.string().url(),
  coverColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, {
      message: "coverColor must be a valid hex code like #FFFFFF",
    }),
  description: z.string().trim().min(10),
  totalCopies: z.coerce.number().int().positive().lte(10000),
  videoUrl: z.string().url(),
  summary: z.string().trim().min(10),
});