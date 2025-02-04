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
      setUser(session.user);
    }
  }, [session]);

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (status === 'loading' || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#141414]">
        <div className="animate-pulse text-red-600">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-[#2C2C2C] rounded-lg p-6">
          <ProfileHeader user={user} onProfileUpdate={handleProfileUpdate} />
        </div>
        <div className="bg-[#2C2C2C] rounded-lg p-6">
          <ProfileTabs />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;