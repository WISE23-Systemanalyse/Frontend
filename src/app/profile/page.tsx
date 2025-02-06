"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { redirect } from 'next/navigation';
import { User } from '@/types/user';
import { Ticket, Users2, ArrowRight } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const API_BASE_URL = process.env.BACKEND_URL;

const DEFAULT_PROFILE_IMAGE = "data:image/jpeg;base64,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";

const ProfilePage = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<User>>({});
  const [imageUrl, setImageUrl] = useState<string>('');
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
        setImageUrl(data.imageUrl || DEFAULT_PROFILE_IMAGE);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [session]);

  const handleInputChange = (field: keyof User, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!session?.user?.id) return;

    const updateData = {
      email: editedData.email || userData?.email,
      firstName: editedData.firstName || userData?.firstName,
      lastName: editedData.lastName || userData?.lastName,
      userName: editedData.userName || userData?.userName,
      imageUrl: imageUrl || DEFAULT_PROFILE_IMAGE
    };
    
    console.log('Update data being sent:', updateData); // Debug-Log

    try {
      const response = await fetch(`${API_BASE_URL}/users/${session.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Fehler beim Aktualisieren der Benutzerdaten');
      }

      const updatedData = await response.json();
      setUserData(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

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
        <div className="bg-[#2C2C2C] rounded-lg p-6 mb-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-white">Mein Profil</h1>
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isEditing 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                {isEditing ? 'Speichern' : 'Bearbeiten'}
              </button>
            </div>

            <div className="flex justify-center mb-6">
              <div className="relative">
                <Image
                  src={imageUrl || userData?.imageUrl || DEFAULT_PROFILE_IMAGE}
                  alt="Profilbild"
                  width={128}
                  height={128}
                  className="rounded-full object-cover"
                />
                {isEditing && (
                  <input
                    type="text"
                    placeholder="Bild-URL eingeben"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="mt-2 w-full bg-[#1C1C1C] text-white rounded-lg px-3 py-2 text-sm"
                  />
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">E-Mail</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedData.email || userData?.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full bg-[#1C1C1C] text-white rounded-lg px-3 py-2 mt-1"
                    />
                  ) : (
                    <p className="text-white">{userData?.email}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-400">Benutzername</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.userName || userData?.userName || ''}
                      onChange={(e) => handleInputChange('userName', e.target.value)}
                      className="w-full bg-[#1C1C1C] text-white rounded-lg px-3 py-2 mt-1"
                    />
                  ) : (
                    <p className="text-white">@{userData?.userName}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Vorname</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.firstName || userData?.firstName || ''}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full bg-[#1C1C1C] text-white rounded-lg px-3 py-2 mt-1"
                    />
                  ) : (
                    <p className="text-white">{userData?.firstName || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-400">Nachname</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.lastName || userData?.lastName || ''}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full bg-[#1C1C1C] text-white rounded-lg px-3 py-2 mt-1"
                    />
                  ) : (
                    <p className="text-white">{userData?.lastName || '-'}</p>
                  )}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card
            className="bg-[#2C2C2C] border-0 hover:bg-[#3C3C3C] transition-all duration-300 cursor-pointer group"
            onClick={() => router.push('/profile/bookings')}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="bg-red-500 p-3 rounded-lg">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
              </div>
              <div className="mt-4">
                <h2 className="text-xl font-semibold text-white group-hover:text-red-500 transition-colors">
                  Meine Buchungen
                </h2>
                <p className="mt-1 text-gray-400">
                  Alle deine Buchungen und Tickets verwalten
                </p>
              </div>
            </div>
          </Card>

          <Card
            className="bg-[#2C2C2C] border-0 hover:bg-[#3C3C3C] transition-all duration-300 cursor-pointer group"
            onClick={() => router.push('/profile/friends')}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="bg-purple-500 p-3 rounded-lg">
                  <Users2 className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
              </div>
              <div className="mt-4">
                <h2 className="text-xl font-semibold text-white group-hover:text-red-500 transition-colors">
                  Freunde
                </h2>
                <p className="mt-1 text-gray-400">
                  Deine Freunde verwalten und neue hinzufügen
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;