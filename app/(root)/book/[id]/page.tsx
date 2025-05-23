import { auth } from '@/auth'
import BookOverview from '@/components/BookOverview'
import BookVideo from '@/components/BookVideo'
import { db } from '@/db/drizzle'
import { books } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import React from 'react'

const page = async({params}:{params:Promise<{id:string,}>}) => {
    const id = (await params).id
    const session = await auth()
    console.log(id)

    const [bookDetails] = await db.select().from(books).where(eq(books.id, id)).limit(1)
    if (!bookDetails) {
        redirect('/404')
    }

    // Transform null values to undefined for compatibility with BookOverview props
    const bookWithDefaults = {
      ...bookDetails,
      isApproved: bookDetails.isApproved ?? false,
      isbn: bookDetails.isbn ?? null,
      publicationYear: bookDetails.publicationYear ?? null,
      publisher: bookDetails.publisher ?? null,
      approvedBy: bookDetails.approvedBy ?? null,
      createdAt: bookDetails.createdAt ?? new Date(),
      updatedAt: bookDetails.updatedAt ?? new Date(),
    }

    return (
    <>
    <BookOverview {...bookWithDefaults} userId={session?.user?.id as string}/>
     <div className='book-details lg:mt-36 mt-16 mb-20 flex flex-col gap-16 lg:flex-row'>
      <div className='flex-[1.5]'>
        <section className='flex flex-col gap-7'>
          <h3 className='text-semibold text-2xl text-yellow-200'>
            Video
          </h3>
          <BookVideo videoUrl={bookDetails.videoUrl} />
          
          <section className='mt-10 flex flex-col gap-7'>
            <h3>Summary</h3>
            
            <div className='space-y-5 text-xl text-white'>
              {bookDetails.summary.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </section>

        </section>
      </div>
      </div> 
    </>
  )
}

export default page