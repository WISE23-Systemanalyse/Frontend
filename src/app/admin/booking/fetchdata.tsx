interface Movie {
    id: number;
    title: string;
    year: number;
    description: string;
    rating: number;
    imageUrl: string;
}

export const fetchMovies = async () => {
    const response = await fetch(`${process.env.BACKEND_URL}/movies`)
    if (!response.ok) {
        throw new Error('Fehler beim Laden der Filme')
    }
    const data: Movie[] = await response.json()
    return data
}

export const fetchBookingDetails = async () => {
    const response = await fetch(`${process.env.BACKEND_URL}/bookings/details`)
    if (!response.ok) {
        throw new Error('Fehler beim Laden der Buchungen')
    }
    const data = await response.json()
    return data
}

export const deleteBooking = async (bookingId: number) => {
  const response = await fetch(`${process.env.BACKEND_URL}/bookings/${bookingId}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    throw new Error('Fehler beim Löschen der Buchung')
  }
  
  return true
}
