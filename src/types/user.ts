export interface User {
    id: string
    email: string
    userName: string
    firstName?: string
    lastName?: string
    imageUrl?: string
    isVerified?: boolean
    isAdmin?: boolean
    accessToken?: string
}