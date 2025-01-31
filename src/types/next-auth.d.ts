/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth"
import { JWT } from "next-auth/jwt"
import { User } from "@/types/user"

declare module "next-auth" {
    interface Session {
        user: User
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        email: string
        accessToken: string
        imageURL: string
        
    }
}
