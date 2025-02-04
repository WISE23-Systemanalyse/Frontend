import { User } from "@/types/user";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useState } from 'react';
import EditProfileForm from './edit-profile-form';

interface ProfileHeaderProps {
  user: User;
  onProfileUpdate: (updatedUser: User) => void;
}

export default function ProfileHeader({ user, onProfileUpdate }: ProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);

  const getInitials = () => {
    if (!user.firstName || !user.lastName) return 'U';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  console.log('Debug - Image URL:', user.imageUrl); // Debug log

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24 border-2 border-red-600">
          <AvatarImage src={user.imageUrl || ''} />
          <AvatarFallback className="bg-[#3C3C3C] text-white text-xl">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-400">@{user.userName}</p>
          <p className="text-gray-500">{user.email}</p>
        </div>
      </div>
      <div className="flex gap-3 w-full md:w-auto">
        <Button
          onClick={() => setIsEditing(true)}
          className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white"
        >
          Profil bearbeiten
        </Button>
      </div>

      {isEditing && (
        <EditProfileForm
          user={user}
          onClose={() => setIsEditing(false)}
          onUpdate={onProfileUpdate}
        />
      )}
    </div>
  );
}
