'use client';

import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { redirect } from 'next/navigation';
import { ChevronLeft, UserPlus, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Friend } from '@/types/friend';
import { CommonBooking } from '@/types/common-booking';
import { Friendship } from '@/types/friendship';
import { BookingDetails as Booking } from '@/types/booking-details';


export default function FriendsPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [allUsers, setAllUsers] = useState<Friend[]>([]);
  const [commonBookings, setCommonBookings] = useState<CommonBooking[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin');
    },
  });

  useEffect(() => {
    const fetchFriends = async () => {
      if (!session?.user?.id) return;

      try {
        // 1. Hole alle Freundschaften
        const response = await fetch(`${process.env.BACKEND_URL}/friendships/user/${session.user.id}`);
        if (!response.ok) throw new Error('Failed to fetch friends');
        const friendships = await response.json();

        // 2. Extrahiere die Freundes-IDs
        const friendIds = friendships.map((friendship: Friendship) => 
          friendship.user1Id === session.user.id ? friendship.user2Id : friendship.user1Id
        );

        // 3. Hole die Benutzerdetails für jeden Freund
        const enrichedFriends = await Promise.all(
          friendIds.map(async (friendId: string) => {
            try {
              const userResponse = await fetch(`${process.env.BACKEND_URL}/users/${friendId}`);
              if (!userResponse.ok) throw new Error(`Failed to fetch user ${friendId}`);
              return await userResponse.json();
            } catch (error) {
              console.error(`Fehler beim Laden des Benutzers ${friendId}:`, error);
              return null;
            }
          })
        );

        // Filtere null-Werte heraus
        const validFriends = enrichedFriends.filter((friend): friend is Friend => friend !== null);
        setFriends(validFriends);
      } catch (error) {
        console.error('Error fetching friends:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriends();
  }, [session]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`${process.env.BACKEND_URL}/users`);
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setAllUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchAllUsers();
  }, [session]);

  useEffect(() => {
    const filtered = friends.filter(friend => 
      friend.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (friend.firstName && friend.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (friend.lastName && friend.lastName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredFriends(filtered);
  }, [searchQuery, friends]);

  const fetchCommonBookings = async (friendId: number) => {
    if (!session?.user?.id) return;
    
    try {
      const [userBookings, friendBookings] = await Promise.all([
        fetch(`${process.env.BACKEND_URL}/users/${session.user.id}/bookings`).then(res => res.json()),
        fetch(`${process.env.BACKEND_URL}/users/${friendId}/bookings`).then(res => res.json())
      ]);

      // Finde gemeinsame Shows (nur einmal pro Show)
      const userShowIds = new Set(userBookings.map((booking: Booking) => booking.show_id));
      const friendShowIds = new Set(friendBookings.map((booking: Booking) => booking.show_id));
      const commonShowIds = [...userShowIds].filter(id => friendShowIds.has(id));

      // Nimm die erste Buchung für jede gemeinsame Show
      const commonBookings = commonShowIds.map(showId => 
        userBookings.find((booking: Booking) => booking.show_id === showId)
      );

      // Reichere die gemeinsamen Buchungen mit allen Details an
      const enrichedCommonBookings = await Promise.all(
        commonBookings.map(async (booking: any) => {
          // Seat Details
          const seatResponse = await fetch(`${process.env.BACKEND_URL}/seats/${booking.seat_id}`);
          const seatData = await seatResponse.json();

          // Kategorie Details
          const categoryResponse = await fetch(`${process.env.BACKEND_URL}/categories/${seatData.category_id}`);
          const categoryData = await categoryResponse.json();

          // Show Details
          const showResponse = await fetch(`${process.env.BACKEND_URL}/shows/${booking.show_id}`);
          const showData = await showResponse.json();

          // Movie Details
          const movieResponse = await fetch(`${process.env.BACKEND_URL}/movies/${showData.movie_id}`);
          const movieData = await movieResponse.json();

          // Kombiniere alle Daten
          return {
            ...booking,
            seat: {
              ...seatData,
              category: categoryData
            },
            show: {
              ...showData,
              movie: movieData
            }
          };
        })
      );

      console.log('Angereicherte gemeinsame Buchungen:', enrichedCommonBookings);
      setCommonBookings(enrichedCommonBookings);
    } catch (error) {
      console.error('Error fetching common bookings:', error);
    }
  };

  const handleOpenFriendModal = async (friend: Friend) => {
    setSelectedFriend(friend);
    await fetchCommonBookings(friend.id);
    setShowFriendModal(true);
  };

  const handleOpenAddFriendModal = async () => {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const users = await response.json();
      setAllUsers(users);
      setShowAddFriendModal(true);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    if (!session?.user?.id) return;

    try {
      // 1. Hole die Freundschafts-ID
      const response = await fetch(`${process.env.BACKEND_URL}/friendships/user/${session.user.id}`);
      const friendships = await response.json();
      
      const friendship = friendships.find((f: Friendship) => 
        (f.user1Id === session.user.id && f.user2Id === friendId.toString()) || 
        (f.user2Id === session.user.id && f.user1Id === friendId.toString())
      );

      if (!friendship) throw new Error('Freundschaft nicht gefunden');

      // 2. Lösche die Freundschaft
      const deleteResponse = await fetch(`${process.env.BACKEND_URL}/friendships/${friendship.id}`, {
        method: 'DELETE',
      });

      if (!deleteResponse.ok) throw new Error('Fehler beim Entfernen der Freundschaft');

      // 3. UI aktualisieren
      setFriends(friends.filter(friend => friend.id !== friendId));
      setShowFriendModal(false);
      setSelectedFriend(null);
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const handleAddFriend = async (userId: number) => {
    if (!session?.user?.id) return;

    try {
      // 1. Erstelle neue Freundschaft
      const response = await fetch(`${process.env.BACKEND_URL}/friendships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user1Id: session.user.id,
          user2Id: userId.toString()
        })
      });

      if (!response.ok) throw new Error('Fehler beim Hinzufügen des Freundes');

      // 2. Hole die Details des neuen Freundes
      const userResponse = await fetch(`${process.env.BACKEND_URL}/users/${userId}`);
      const newFriend = await userResponse.json();

      // 3. UI aktualisieren
      setFriends([...friends, newFriend]);
      setShowAddFriendModal(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-pulse text-red-600">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/profile')}
            className="text-white hover:text-red-500 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-white">Meine Freunde</h1>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={handleOpenAddFriendModal}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Freund hinzufügen
          </button>
        </div>

        {/* Search Section */}
        <div className="bg-[#2C2C2C] rounded-xl p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Freunde suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1C1C1C] text-white rounded-lg px-4 py-2 pl-10"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
            <button
              onClick={() => {}}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Suchen
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between bg-[#1C1C1C] p-3 rounded-lg"
                >
                  <div>
                    <p className="text-white">{user.userName}</p>
                    {user.firstName && user.lastName && (
                      <p className="text-sm text-gray-400">
                        {user.firstName} {user.lastName}
                      </p>
                    )}
                  </div>
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                  >
                    <UserPlus className="w-4 h-4" />
                    Hinzufügen
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Friends List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFriends.map((friend) => (
            <div
              key={friend.id}
              onClick={() => handleOpenFriendModal(friend)}
              className="bg-[#1C1C1C] p-4 rounded-lg cursor-pointer hover:bg-[#2C2C2C] transition-colors"
            >
              <p className="text-white font-medium">{friend.userName}</p>
              <p className="text-gray-400 text-sm">{friend.email}</p>
              {friend.firstName && friend.lastName && (
                <p className="text-gray-400 text-sm mt-1">
                  {friend.firstName} {friend.lastName}
                </p>
              )}
            </div>
          ))}
          {friends.length > 0 && filteredFriends.length === 0 && (
            <div className="text-center text-gray-400 py-8 col-span-full">
              Keine Freunde gefunden
            </div>
          )}
          {friends.length === 0 && (
            <div className="text-center text-gray-400 py-8 col-span-full">
              Noch keine Freunde hinzugefügt
            </div>
          )}
        </div>

        {/* Friend Details Modal */}
        {showFriendModal && selectedFriend && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#2C2C2C] rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Freund Details</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleRemoveFriend(selectedFriend.id)}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    Freund entfernen
                  </button>
                  <button onClick={() => setShowFriendModal(false)} className="text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-white">{selectedFriend.userName}</h4>
                  <p className="text-gray-400">{selectedFriend.email}</p>
                  {selectedFriend.firstName && selectedFriend.lastName && (
                    <p className="text-gray-400">{selectedFriend.firstName} {selectedFriend.lastName}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Gemeinsame Veranstaltungen</h4>
                  {commonBookings.map((booking) => (
                    <div key={booking.id} className="bg-[#1C1C1C] p-4 rounded-lg">
                      <p className="text-white font-medium">
                        {booking.show?.movie?.title || 'Unbekannter Film'}
                      </p>
                      <div className="text-gray-400 text-sm mt-2">
                        {booking.show?.start_time && (
                          <>
                            <p>Datum: {new Date(booking.show.start_time).toLocaleDateString('de-DE')}</p>
                            <p>Zeit: {new Date(booking.show.start_time).toLocaleTimeString('de-DE')}</p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {commonBookings.length === 0 && (
                    <p className="text-gray-400">Keine gemeinsamen Veranstaltungen</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Friend Modal */}
        {showAddFriendModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#2C2C2C] rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Freund hinzufügen</h3>
                <button 
                  onClick={() => {
                    setShowAddFriendModal(false);
                    setSearchQuery(''); // Reset Suche beim Schließen
                  }} 
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Nutzer suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1C1C1C] text-white rounded-lg px-4 py-2"
                />
              </div>

              <div className="space-y-2">
                {allUsers
                  .filter(user => 
                    user.id.toString() !== session?.user?.id &&
                    !friends.some(friend => friend.id === user.id) &&
                    (user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     (user.firstName && user.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                     (user.lastName && user.lastName.toLowerCase().includes(searchQuery.toLowerCase())))
                  )
                  .map(user => (
                    <div key={user.id} className="flex items-center justify-between bg-[#1C1C1C] p-4 rounded-lg">
                      <div>
                        <p className="text-white">{user.userName}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                        {user.firstName && user.lastName && (
                          <p className="text-sm text-gray-400">{user.firstName} {user.lastName}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddFriend(user.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Hinzufügen
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}