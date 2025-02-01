interface ShowData {
    show_id: number;
    movie_id: number;
    hall_id: number;
    start_time: string;
}

interface Movie {
    id: number;
    title: string;
    description: string;
    duration: number;
    image_url: string;
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

export const checkHallAvailability = async (hallId: number, startTime: string, movieDuration: number, showId: number) => {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/shows/hall/${hallId}`);
        if (!response.ok) throw new Error('Fehler beim Laden der Vorstellungen');
        const shows: ShowData[] = await response.json();
        
        const newShowStart = new Date(startTime);
        const newShowEnd = new Date(newShowStart.getTime() + (movieDuration + 60) * 60000);
        
        // Stelle sicher, dass showId als number verglichen wird
        const currentShowId = Number(showId);
        
        // Filtere die zu bearbeitende Show aus den Vergleichen aus
        const otherShows = shows.filter(show => Number(show.show_id) !== currentShowId);
        
        // Prüfe Überschneidungen mit allen anderen Shows
        for (const show of otherShows) {
            const showStart = new Date(show.start_time);
            // Hole die Filmdauer für diese Show
            const movieResponse = await fetch(`${process.env.BACKEND_URL}/movies/${show.movie_id}`);
            if (!movieResponse.ok) throw new Error('Fehler beim Laden der Filmdaten');
            const movie: Movie = await movieResponse.json();
            const showEnd = new Date(showStart.getTime() + (movie.duration + 60) * 60000);

            // Prüfe ob sich die Zeiträume überschneiden
            if (
                (newShowStart >= showStart && newShowStart < showEnd) || // Neue Show startet während einer anderen
                (newShowEnd > showStart && newShowEnd <= showEnd) || // Neue Show endet während einer anderen
                (newShowStart <= showStart && newShowEnd >= showEnd) // Neue Show umschließt eine andere
            ) {
                const formattedShowStart = showStart.toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'UTC'
                });
                const formattedShowEnd = showEnd.toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'UTC'
                });
                throw new Error(
                    `Zeitkonflikt mit existierender Vorstellung (${formattedShowStart} - ${formattedShowEnd} Uhr)`
                );
            }
        }

        return true;
    } catch (error) {
        throw error;
    }
};

export const updateShow = async (id: string, data: ShowData) => {
    try {
        // Hole die Filmdauer des ausgewählten Films
        const movieResponse = await fetch(`${process.env.BACKEND_URL}/movies/${data.movie_id}`);
        if (!movieResponse.ok) throw new Error('Film nicht gefunden');
        const movie: Movie = await movieResponse.json();

        // Prüfe die Verfügbarkeit
        await checkHallAvailability(
            data.hall_id,
            data.start_time,
            movie.duration,
            data.show_id
        );

        // Wenn verfügbar, aktualisiere die Show
        const response = await fetch(`${process.env.BACKEND_URL}/shows/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: parseInt(id),
                movie_id: data.movie_id,
                hall_id: data.hall_id,
                start_time: data.start_time
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server Fehler:', errorText);
            throw new Error('Vorstellung konnte nicht aktualisiert werden');
        }

        return response.json();
    } catch (error) {
        throw error;
    }
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

