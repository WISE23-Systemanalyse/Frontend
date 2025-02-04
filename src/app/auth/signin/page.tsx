"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push("/profile")
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setError("An unexpected error occurred")
    }
  }

  const inputClasses = `
    w-full px-3 py-2 rounded-md bg-[#3C3C3C] border-0 text-white 
    placeholder-gray-400 focus:ring-1 focus:ring-red-500
    [&:-webkit-autofill]:bg-[#3C3C3C]
    [&:-webkit-autofill]:text-white
    [&:-webkit-autofill]:[-webkit-text-fill-color:white]
    [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]
    [&:-webkit-autofill]:border-0
  `

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 p-6 bg-[#2C2C2C] rounded-lg">
        <div>
          <h2 className="text-2xl font-bold text-white text-center">Anmelden</h2>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-gray-400 mb-1">
              E-Mail
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={inputClasses}
              placeholder="deine@email.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
              Passwort
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={inputClasses}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-md py-2 px-4 transition-colors mt-6"
          >
            Anmelden
          </button>
        </form>
        <p className="text-center text-gray-400">
          Noch kein Konto?{' '}
          <Link href="/auth/signup" className="text-red-500 hover:text-red-400">
            Registrieren
          </Link>
        </p>
      </div>
    </div>
  )
}
