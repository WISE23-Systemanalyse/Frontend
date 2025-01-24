"use client";
import React from 'react'
import { useSession } from "next-auth/react";
import { signIn, signOut } from "next-auth/react";
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

const Profile = () => {
  const { data: session } = useSession();
  const [userData, setUserData] = React.useState(null);

useEffect (() => {
  const fetchUserData = async () => {
    if (session) {
      const response = await fetch('http://localhost:8000/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken.token}`
        }
      });
      const data = await response.json();
      setUserData(data);
    }
  };
  fetchUserData();
}, [session]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center">Profile</h2>
        {session ? (
          <div className='space-y-4 border-spacing-0.5'>
            <h1>Profile</h1>
            <p>ID: {session.accessToken.id}</p>
            <p>Email: {session.accessToken.email}</p>
            <p>First Name: {userData?.firstName}</p>
            <p>Last Name: {userData?.lastName}</p>
            <p>Username: {session?.user?.userName}</p>
            <p>First Name: {session?.user?.firstName}</p>
            <p>Image: {session?.user?.imageUrl}</p>

            <button onClick={()=>signOut()}>Logout</button>
          </div>
          ): <>
          <button onClick={()=> signIn()}>Login</button>
          <button onClick={()=> redirect("/auth/signup") }>Sign Up</button>
          </>
        
        }

      </div>
    </div>
  )
}

export default Profile