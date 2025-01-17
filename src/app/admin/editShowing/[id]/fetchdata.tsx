interface ShowData {
    id: number;
    movie_id: number;
    hall_id: number;
    start_time: string;
}

export const fetchShow = async (id: string): Promise<ShowData> => {
    const response = await fetch(`${process.env.BACKEND_URL}/shows/${id}`);
    if (!response.ok) {
        throw new Error('Vorstellung konnte nicht geladen werden');
    }
    const data = await response.json();
    return data;
}

export const fetchHalls = async () => {
    const response = await fetch(`${process.env.BACKEND_URL}/halls`);
    if (!response.ok) {
        throw new Error('Säle konnten nicht geladen werden');
    }
    const data = await response.json();
    return data;
}

export const fetchMovies = async () => {
    const response = await fetch(`${process.env.BACKEND_URL}/movies`);
    if (!response.ok) {
        throw new Error('Filme konnten nicht geladen werden');
    }
    const data = await response.json();
    return data;
}

export const updateShow = async (id: string, data: ShowData) => {
    console.log('Sende Update:', data);
    
    // Sende die Daten direkt, ohne Date-Konvertierung
    const response = await fetch(`${process.env.BACKEND_URL}/shows/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: parseInt(id),
            movie_id: data.movie_id,
            hall_id: data.hall_id,
            start_time: data.start_time // Sende den String direkt
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Server Fehler:', errorText);
        throw new Error('Vorstellung konnte nicht aktualisiert werden');
    }

    return response.json();
};

export const deleteShow = async (id: string) => {
    const response = await fetch(`${process.env.BACKEND_URL}/shows/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Server Fehler:', errorText);
        throw new Error('Vorstellung konnte nicht gelöscht werden');
    }

    return response.json();
};

