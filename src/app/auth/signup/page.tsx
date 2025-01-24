import SignUpForm from "./SignUpForm.tsx"
import React from "react"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center">Sign Up</h2>
        <SignUpForm />
      </div>
    </div>
  )
}

