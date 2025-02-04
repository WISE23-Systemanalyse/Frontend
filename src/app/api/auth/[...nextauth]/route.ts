import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { User } from "@/types/user"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${process.env.BACKEND_URL}/signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          })

          if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || "Authentication failed")
          }
          const data = await res.json()
          console.log(data.user);
          return data.token.user
        } catch (error) {
          console.error("Authorization error:", error)
          throw error // Propagate the error to show in the UI
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        // Update the token with the new user data
        return { ...token, ...session };
      }
      return { ...token, ...user };
    },
    async session({ session, token }) {
      session.user = token as unknown as User;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export const GET = handler
export const POST = handler