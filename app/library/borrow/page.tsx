import { auth } from '@/auth'
import React from 'react'

const page = async() => {

  const session = await auth()
  
  return (
    <div>
      sfs
    </div>
  )
}

export default page
