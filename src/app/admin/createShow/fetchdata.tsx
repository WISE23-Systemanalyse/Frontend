interface ShowData {
  movie_id: string;
  hall_id: string;
  start_time: string;
}

export const fetchHalls = async () => {
    const response = await fetch(`${process.env.BACKEND_URL}/halls`)
    const data = await response.json()
    return data
}

export const fetchMovies = async () => {
    const response = await fetch(`${process.env.BACKEND_URL}/movies`)
    const data = await response.json()
    return data
}

export const createShow = async (showData: ShowData) => {
  const response = await fetch(`${process.env.BACKEND_URL}/shows`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(showData)
  });

  if (!response.ok) {
    throw new Error('Fehler beim Erstellen der Vorstellung');
  }

  return response.json();
};