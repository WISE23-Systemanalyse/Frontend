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

  useEffect(() => {
    if (session) {
      console.log(session.user);
      setUser(session.user);

    }
  }, [session]);

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (status === 'loading' || !user) {
    return <div className="flex justify-center items-center h-screen bg-black text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <ProfileHeader user={user} onProfileUpdate={handleProfileUpdate} />
        <ProfileTabs />
      </div>
    </div>
  );
};

export default ProfilePage;