'use client'

import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import React, { useEffect } from 'react'
import axios from 'axios'

const User = () => {
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      axios.post(
        'http://localhost:8000/user',
        {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          userName: user.username,
          imageUrl: user.imageUrl
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      ).then(response => {
        console.log('User data sent successfully:', response.data);
      }).catch(error => {
        console.error('Error sending user data:', error);
      });
    }
  }, [user]);

  if (!user) return null;

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Benutzerprofil</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>E-Mail:</strong> {user.primaryEmailAddress?.emailAddress}</p>
          <p><strong>Benutzer-ID:</strong> {user.id}</p>
          <p><strong>Benutzername:</strong> {user.username}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default User

