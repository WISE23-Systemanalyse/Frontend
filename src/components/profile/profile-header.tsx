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
    if (!user.firstName || !user.lastName) {
      return 'Username';
    }
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  console.log('Debug - Image URL:', user.imageUrl); // Debug log

  return (
    <Card className="bg-[#1C1C1C] border-gray-800">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={"globe.svg"}
              alt={`${user.firstName} ${user.lastName}`}
              onError={(e) => {
                console.log('Image failed to load, using fallback');
                e.currentTarget.src = '/default-avatar.png';
              }}
            />
            <AvatarFallback className="bg-red-600 text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-white">{`${user.firstName} ${user.lastName}`}</h1>
            <p className="text-gray-400">{user.email}</p>
            <p className="text-gray-500">@{user.userName}</p>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end items-center w-full">
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700"
          >
            Ausloggen
          </Button>
        </div>
        {isEditing && (
          <EditProfileForm
            user={user}
            onClose={() => setIsEditing(false)}
            onUpdate={onProfileUpdate}
          />
        )}
      </CardContent>
    </Card>
  );
}
