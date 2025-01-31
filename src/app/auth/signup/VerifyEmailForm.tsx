"use client"
import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { verifyEmail } from "./actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function VerifyEmailForm({ email }: { email: string }) {
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    formData.append("email", email)
    const result = await verifyEmail(formData)
    if (result.success) {
      router.push("/auth/signin")
    } else {
      setError(result.error || "Ein Fehler ist aufgetreten")
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400">
          E-Mail
        </label>
        <Input
          name="email"
          type="email"
          value={email}
          readOnly
          className="bg-[#141414] border-zinc-800 text-white"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400">
          Bestätigungscode
        </label>
        <Input
          name="code"
          type="text"
          required
          maxLength={6}
          className="bg-[#141414] border-zinc-800 text-white focus:ring-red-500 focus:border-red-500 
                   text-center text-2xl tracking-widest"
          placeholder="••••••"
        />
      </div>

      <Button 
        type="submit"
        className="w-full bg-red-600 hover:bg-red-700 text-white"
      >
        E-Mail bestätigen
      </Button>
    </form>
  )
}

