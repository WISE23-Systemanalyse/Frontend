import { useState } from 'react';
import { User } from '@/types/user';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

interface EditProfileFormProps {
  user: User;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}

export default function EditProfileForm({ user, onClose, onUpdate }: EditProfileFormProps) {
  const { update } = useSession();
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    image: user.imageUrl || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.BACKEND_URL}/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      await update(updatedUser);
      onUpdate(updatedUser);
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#2C2C2C] rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-6">Profil bearbeiten</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Vorname
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-3 py-2 rounded-md bg-[#3C3C3C] border-0 text-white placeholder-gray-400 focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Nachname
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-3 py-2 rounded-md bg-[#3C3C3C] border-0 text-white placeholder-gray-400 focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Profilbild URL
            </label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              className="w-full px-3 py-2 rounded-md bg-[#3C3C3C] border-0 text-white placeholder-gray-400 focus:ring-1 focus:ring-red-500"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="bg-transparent border-gray-600 text-white hover:bg-[#3C3C3C]"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? 'Speichern...' : 'Speichern'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
