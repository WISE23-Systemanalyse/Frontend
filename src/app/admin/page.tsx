'use client'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchUser } from './fetchdata'
import Link from 'next/link'

interface User {
  id: number
  name: string
  email: string
}

export default function UserQuery() {
  const [userId, setUserId] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="flex items-center justify-center h-screen w-screen" style={{ backgroundColor: '#141414' }}>
      <Card className="w-full max-w-md mx-auto bg-[#2C2C2C] border-0">
        <CardHeader>
          <CardTitle className="text-white">Benutzerabfrage</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/admin/createMovie" className="block mb-4">
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white">Neuen Film anlegen</Button>
          </Link>

          <div className="flex space-x-2 mb-4">
            <Input
              type="number"
              placeholder="Benutzer ID eingeben"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="bg-[#3C3C3C] text-white border-0 ring-offset-0 focus-visible:ring-1 focus-visible:ring-red-500 focus-visible:ring-offset-0 placeholder:text-gray-400"
            />
            <Button 
              onClick={() => fetchUser({ userId: Number(userId), setUser, setIsLoading, setError })} 
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? 'Lädt...' : 'Abfragen'}
            </Button>
          </div>

          {error && <p className="text-red-500 mb-2">{error}</p>}
          {user && (
            <div className="bg-[#3C3C3C] p-4 rounded-md text-white min-h-[160px]">
              <h3 className="font-bold mb-2">Benutzerdaten:</h3>
              <div className="space-y-2">
                <p className="text-gray-400">ID: <span className="text-white">{user.id}</span></p>
                <p className="text-gray-400">Name: <span className="text-white">{user.name}</span></p>
                <p className="text-gray-400">E-Mail: <span className="text-white">{user.email}</span></p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
