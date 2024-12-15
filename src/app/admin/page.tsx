'use client'
//import { useState } from 'react'
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { fetchUser } from './fetchdata'
import { UserList } from '@/components/UserList'
import { Protect} from '@clerk/nextjs'



// interface User {
//   id: number
//   name: string
//   email: string
// }

export default function UserQuery(request: Request) {
  // const [userId, setUserId] = useState('')
  // const [user, setUser] = useState<User | null>(null)
  // const [isLoading, setIsLoading] = useState(false)
  // const [error, setError] = useState<string | null>(null)

  return (
    <Protect 
      role= 'org_2qAAf8Y3WwPLhps3xcM1Eosy8nX:admin'
      fallback={
        <div className="flex items-center justify-center h-screen w-screen">
      <h1 className="text-4xl">You do not have permission to this page</h1>
    </div>
      }
      >
      <div className='flex h-screen w-screen justify-center items-center'>
        <UserList />
      </div>
     </Protect>
  )
}
  






















     {/* <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Benutzerabfrage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Input
            type="number"
            placeholder="Benutzer ID eingeben"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <Button onClick={() => fetchUser({ userId: Number(userId), setUser, setIsLoading, setError })} disabled={isLoading}>
            {isLoading ? 'Lädt...' : 'Abfragen'}
          </Button>
        </div>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {user && (
          <div>
            <h3 className="font-bold mb-2">Benutzerdaten:</h3>
            <p>ID: {user.id}</p>
            <p>Name: {user.name}</p>
            <p>E-Mail: {user.email}</p>
          </div>
        )}
      </CardContent>
    </Card> */}