"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { redirect } from 'next/navigation';
import ProfileHeader from '@/components/profile/profile-header';
import ProfileTabs from '@/components/profile/profile-tabs';
import { User } from '@/types/user';

const ProfilePage = () => {
  const [user, setUser] = useState<User>();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin');
    },
  });

  const AccessToken = session?.user.accessToken;
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/me`, {
          headers: {
            Authorization: `Bearer ${AccessToken}`,
          },
        });

        const data = await response.json();
        if (response.status === 401) {
          throw new Error('Unauthorized access');
        }

        if (response.status === 404) {
          throw new Error('User not found');
        }

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch user');
        }

        const user: User = data.message;
        console.log('User:', user);
        setUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    
    if (AccessToken) {
      fetchUser();
    }
  }, [AccessToken]);

  if (status === 'loading' || !user) {
    return <div className="flex justify-center items-center h-screen bg-black text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <ProfileHeader user={user!} />
        <ProfileTabs />
      </div>
    </div>
  );
};

export default ProfilePage;