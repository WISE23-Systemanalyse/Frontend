'use client'
//import { useState } from 'react'
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { fetchUser } from './fetchdata'
import { UserList } from '@/components/UserList'
import { useUser } from '@clerk/nextjs'
import { Protect} from '@clerk/nextjs'
import { useEffect, useState } from 'react';



// interface User {
//   id: number
//   name: string
//   email: string
// }

export default function UserQuery() {
  const { user, isLoaded } = useUser();
  const [data, setData] = useState({ isAdmin: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isLoaded || !user?.id) {
        console.log('Nicht geladen oder keine User ID:', { isLoaded, userId: user?.id });
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('Starte Fetch für User:', user.id);
        const response = await fetch(`http://localhost:8000/users/${user.id}`);
        
        if (!response.ok) {
          console.error('Server Antwort nicht OK:', response.status, response.statusText);
          throw new Error('Fehler beim Laden der Nutzerdaten');
        }
        
        const userData = await response.json();
        console.log('Erhaltene User Daten:', userData);
        setData(userData);
      } catch (error) {
        console.error('Fehler beim Abrufen der Nutzerdaten:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [user?.id, isLoaded]);

  if (!isLoaded || isLoading) {
    return <div>Laden...</div>;
  }

  return (
    <div className="flex items-center justify-center h-screen w-screen">
      {data.isAdmin ? (
        <div className='flex h-screen w-screen justify-center items-center'>
          <UserList />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen w-screen">
          <h1 className="text-4xl">Sie haben keine Administratorrechte</h1>
        </div>
      )}
    </div>
  );
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