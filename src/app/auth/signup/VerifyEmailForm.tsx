"use client"
import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { verifyEmail } from "./actions"

export default function VerifyEmailForm({ email }: { email: string }) {
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    formData.append("email", email)
    const result = await verifyEmail(formData)
    if (result.success) {
      router.push("/auth/signin")
    } else {
      setError(result.error || "An error occurred during verification")
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          readOnly
          className="mt-1 block w-full rounded-md border p-2 bg-gray-100"
        />
      </div>
      <div>
        <label htmlFor="code" className="block text-sm font-medium">
          Verification Code
        </label>
        <input
          id="code"
          name="code"
          type="text"
          required
          maxLength={6}
          className="mt-1 block w-full rounded-md border p-2 text-center text-2xl tracking-widest"
        />
      </div>
      <button type="submit" className="w-full bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600">
        Verify Email
      </button>
    </form>
  )
}

