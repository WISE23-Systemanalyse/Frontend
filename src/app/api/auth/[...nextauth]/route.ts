import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

declare module "next-auth" {
  interface JWT {
    id: string
    email: string
    accessToken: string
  }
  interface User {
    id: string
    email: string
    accessToken: string
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        try {
          const res = await fetch(`${process.env.BACKEND_URL}/signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || "Authentication failed")
          }

          const data = await res.json()
          // Decode the JWT token to get user information
          const tokenString = data.token.token
          return {
            id: data.userId || '', // Ensure you have userId in your API response
            email: data.email,
            userName: data.userName,
            accessToken: tokenString,
          }
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
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken

      }
      return token
    },
    async session({ session, token }) {
      session.user.accessToken = token.accessToken
      return session
    },
  },
})

export const GET = handler
export const POST = handler

