"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'

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

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#2C2C2C] border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-white text-center">
            Anmelden
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                E-Mail
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#3C3C3C] text-white border-0 focus:ring-0 focus:ring-white/20 placeholder:text-gray-400"
                placeholder="ihre@email.de"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                Passwort
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#3C3C3C] text-white border-0 focus:ring-0 focus:ring-white/20 placeholder:text-gray-400"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-white hover:bg-white/90 text-black transition-colors"
            >
              Anmelden
            </Button>

            <div className="text-center text-sm text-gray-400">
              Noch kein Konto?{' '}
              <Link 
                href="/auth/signup" 
                className="text-white hover:text-gray-300"
              >
                Registrieren
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
