'use client'

import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import React from 'react'
import axios from 'axios'

const User  = () => {
  const { user } = useUser()
  console.log("useUser: " + useUser);
  console.log(user);
   axios.post(
    'http://localhost:8000/user',
    {
      id: user?.id,
      name: user?.firstName + " " + user?.lastName,
      email: user?.emailAddresses
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
    return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Benutzerprofil</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Name:</strong> {user?.firstName}</p>
          <p><strong>E-Mail:</strong> {user?.primaryEmailAddress?.emailAddress}</p>
          <p><strong>Benutzer-ID:</strong> {user?.id}</p>
        </div>
      </CardContent>
    </Card>
  )
}
export default User
