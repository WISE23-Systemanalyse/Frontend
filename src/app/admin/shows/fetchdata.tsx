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

export const fetchShowings = async () => {
    const response = await fetch(`${process.env.BACKEND_URL}/shows`);
    if (!response.ok) {
        throw new Error('Vorstellungen konnten nicht geladen werden');
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

    return true;
};