"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { redirect } from 'next/navigation';
import { User } from '@/types/user';

const API_BASE_URL = process.env.BACKEND_URL;

const ProfilePage = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin');
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`${API_BASE_URL}/users/${session.user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [session]);

  if (status === 'loading' || !userData) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#141414] text-white">
        <div className="animate-pulse text-red-600">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-[#2C2C2C] rounded-lg p-6">
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white mb-6">Mein Profil</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">E-Mail</label>
                  <p className="text-white">{userData.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Benutzername</label>
                  <p className="text-white">@{userData.userName}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Vorname</label>
                  <p className="text-white">{userData.firstName || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Nachname</label>
                  <p className="text-white">{userData.lastName || '-'}</p>
                </div>
              </div>
            </div>

            {userData.isAdmin && (
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-red-600/10 text-red-600 rounded-full text-sm font-medium">
                    Administrator
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;