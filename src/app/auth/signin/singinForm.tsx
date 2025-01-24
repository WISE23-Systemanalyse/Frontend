"use client"
import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "./actions"

export default function SignInForm() {
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    const result = await signIn(formData)
    if (result.success) {
      router.push("/dashboard") // Redirect to dashboard after successful sign in
    } else {
      setError(result.error || "An error occurred during sign in")
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input id="email" name="email" type="email" required className="mt-1 block w-full rounded-md border p-2" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="mt-1 block w-full rounded-md border p-2"
        />
      </div>
      <button type="submit" className="w-full bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600">
        Sign In
      </button>
    </form>
  )
}

