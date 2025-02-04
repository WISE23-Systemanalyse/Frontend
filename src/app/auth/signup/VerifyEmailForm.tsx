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
        <label htmlFor="email" className="block text-sm font-medium text-gray-400">
          E-Mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          readOnly
          className="mt-1 block w-full rounded-md bg-[#3C3C3C] border-0 text-gray-400"
        />
      </div>
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-400">
          Bestätigungscode
        </label>
        <input
          id="code"
          name="code"
          type="text"
          required
          maxLength={6}
          className="mt-1 block w-full rounded-md bg-[#3C3C3C] border-0 text-white text-center text-2xl tracking-widest focus:ring-1 focus:ring-red-500"
        />
      </div>
      <button 
        type="submit" 
        className="w-full bg-red-600 hover:bg-red-700 text-white rounded-md p-2 transition-colors"
      >
        E-Mail bestätigen
      </button>
    </form>
  )
}

