export const fetchUsers = async () => {
    const response = await fetch(`${process.env.BACKEND_URL}/users`)
    const data = await response.json()
    console.log(data);
    return data
}

export const deleteUser = async (userId: number) => {
    const response = await fetch(`${process.env.BACKEND_URL}/users/${userId}`, {
        method: 'DELETE',
    })
    if (!response.ok) {
        throw new Error('Fehler beim Löschen des Benutzers')
    }
    return response.json()
}