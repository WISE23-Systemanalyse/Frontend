// Frontend/src/app/booking/fetchdata.tsx
'use client';

import { useEffect, useState } from 'react';

interface Booking {
  id: number;
  user_id: string;
  show_id: number;
  seat_id: number;
  booking_time: string;
  payment_id: number;
}

export const useFetchBookingData = (bookingId?: string) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        if (bookingId) {
          const response = await fetch(`http://localhost:8000/bookings/${bookingId}`);
          if (!response.ok) {
            throw new Error('Buchung konnte nicht geladen werden');
          }
          const data = await response.json();
          setBooking(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  return { booking, isLoading, error };
};

export const useCreateBooking = () => {
  const createBooking = async (bookingData: Omit<Booking, 'id' | 'booking_time'>) => {
    try {
      const response = await fetch('http://localhost:8000/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error('Buchung konnte nicht erstellt werden');
      }

      return await response.json();
    } catch (error) {
      throw error instanceof Error ? error : new Error('Ein Fehler ist aufgetreten');
    }
  };

  return { createBooking };
};

export const useUserBookings = (userId: string) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const response = await fetch(`http://localhost:8000/bookings/user/${userId}`);
        if (!response.ok) {
          throw new Error('Buchungen konnten nicht geladen werden');
        }
        const data = await response.json();
        setBookings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserBookings();
    }
  }, [userId]);

  return { bookings, isLoading, error };
};

export const useShowBookings = (showId: number) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShowBookings = async () => {
      try {
        const response = await fetch(`http://localhost:8000/bookings/show/${showId}`);
        if (!response.ok) {
          throw new Error('Buchungen für diese Vorstellung konnten nicht geladen werden');
        }
        const data = await response.json();
        setBookings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      } finally {
        setIsLoading(false);
      }
    };

    if (showId) {
      fetchShowBookings();
    }
  }, [showId]);

  return { bookings, isLoading, error };
};

export default Booking;