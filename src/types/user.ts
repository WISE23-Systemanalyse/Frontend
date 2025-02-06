export interface User {
    isAdmin: any
    id: string
    email: string
    userName: string
    firstName?: string
    lastName?: string
    imageUrl?: string
    isVerified?: boolean
    accessToken?: string
}