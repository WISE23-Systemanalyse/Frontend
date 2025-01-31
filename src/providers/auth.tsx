"use client";
import { SessionProvider, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

// Umbenennung zurück zu NextAuthProvider für Konsistenz
export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}

// Export der globale Funktion für das Ausloggen mit Bestätigungsabfrage
export const useAuthSignOut = () => {
  return async () => {
    await signOut({ 
      redirect: true,
      callbackUrl: "/auth/signin"
    })
  }
}
