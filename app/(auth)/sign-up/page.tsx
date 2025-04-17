'use client'
import AuthForm from '@/components/AuthForm'
import { signupSchema } from '@/lib/validations'
import React from 'react'

const page = () => {
  return (
    <div>
      <AuthForm
        type="SIGN_UP"
        schema={signupSchema}
        defaultValues={{
          email: "",
          password: "",
          fullName: "",
          universityId: 0,
          universityCard: "",
        }}
        onSubmit=''
      />
    </div>
  )
}

export default page
