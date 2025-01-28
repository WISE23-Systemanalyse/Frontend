interface Movie {
    id: number;
    title: string;
    description: string;
    duration: number;  // Filmlänge in Minuten
    image_url: string;
}

interface Show {
    id: number;
    movie_id: number;
    hall_id: number;
    start_time: string;
    movie_duration?: number;
}

interface CreateShowData {
    movie_id: number;
    hall_id: number;
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

// Funktion zum Prüfen der Verfügbarkeit
export const checkHallAvailability = async (hallId: number, startTime: string, movieDuration: number) => {
    try {
        // Hole alle Shows für diesen Saal
        const response = await fetch(`${process.env.BACKEND_URL}/shows/hall/${hallId}`);
        if (!response.ok) throw new Error('Fehler beim Laden der Vorstellungen');
        const shows: Show[] = await response.json();
        
        console.log("Aufrufparameter: Saal ID: " + hallId + ", Startzeit: " + startTime + ", Filmdauer: " + movieDuration);
        console.log(shows);

        const newShowStart = new Date(startTime);
        console.log("newShowStart: " + newShowStart);
        const newShowEnd = new Date(newShowStart.getTime() + (movieDuration + 60) * 60000); // Filmdauer + 1 Stunde in Millisekunden
        console.log("newShowEnd: " + newShowEnd);
        const fourHoursBefore = new Date(newShowStart.getTime() - 4 * 60 * 60000);
        console.log("fourHoursBefore: " + fourHoursBefore);

        // Prüfe Überschneidungen
        const conflictingShow = shows.find(show => {
            const showStart = new Date(show.start_time);
            const showEnd = new Date(showStart.getTime() + ((show.movie_duration || 0) + 60) * 60000);

            // Prüfe ob die neue Show mit einer existierenden Show überlappt
            return (
                (newShowStart >= showStart && newShowStart <= showEnd) || // Neue Show startet während einer anderen
                (newShowEnd >= showStart && newShowEnd <= showEnd) || // Neue Show endet während einer anderen
                (newShowStart <= showStart && newShowEnd >= showEnd) // Neue Show umschließt eine andere
            ) && showStart >= fourHoursBefore; // Nur Shows in den nächsten 4 Stunden berücksichtigen
        });

        if (conflictingShow) {
            throw new Error('Der Saal ist zu dieser Zeit bereits belegt');
        }

        return true;
    } catch (error) {
        throw error;
    }
};

export const createShow = async (showData: CreateShowData) => {
    try {
        // Hole zuerst die Filmdauer
        const movieResponse = await fetch(`${process.env.BACKEND_URL}/movies/${showData.movie_id}`);
        if (!movieResponse.ok) throw new Error('Film nicht gefunden');
        const movie: Movie = await movieResponse.json();

        // Prüfe die Verfügbarkeit
        await checkHallAvailability(
            showData.hall_id,
            showData.start_time,
            movie.duration
        );

        // Wenn verfügbar, erstelle die Show
        const response = await fetch(`${process.env.BACKEND_URL}/shows`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...showData,
                movie_duration: movie.duration // Füge die Filmdauer hinzu
            }),
        });

        if (!response.ok) {
            throw new Error('Fehler beim Erstellen der Vorstellung');
        }

        return response.json();
    } catch (error) {
        throw error;
    }
};