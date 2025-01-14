export type Screening = {
    id: string;
    movieTitle: string;
    date: string;
    time: string;
    theater: string;
    availableSeats: number;
    imageUrl: string;
  };
  
  export async function getUpcomingScreenings(): Promise<Screening[]> {
    // Simulierte API-Anfrage
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simuliert Netzwerklatenz
  
    // Beispieldaten
    return [
      { id: '1', movieTitle: 'Inception', date: '2023-07-15', time: '20:00', theater: 'Saal 1', availableSeats: 100, imageUrl: '/placeholder.svg?height=400&width=300' },
      { id: '2', movieTitle: 'The Dark Knight', date: '2023-07-16', time: '19:30', theater: 'Saal 2', availableSeats: 80, imageUrl: '/placeholder.svg?height=400&width=300' },
      { id: '3', movieTitle: 'Interstellar', date: '2023-07-17', time: '21:00', theater: 'Saal 3', availableSeats: 120, imageUrl: '/placeholder.svg?height=400&width=300' },
    ];
  }
  