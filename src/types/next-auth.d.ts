/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth"
import { User } from "@/types/user"

declare module "next-auth" {
    interface Session {
        user: User
    }
}
