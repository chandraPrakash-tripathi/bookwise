import BookForm from '@/components/admin/forms/BookForm'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <div>
      <Button asChild className='back-btn relative left-1'>
        <Link href='/admin/books'>Go Back</Link>
      </Button>

      <section className='w-full max-w-2xl'>
        <BookForm/>

      </section>
    </div>
  )
}

export default page
