"use client"
import SignInForm  from "./singinForm.tsx"
import React from "react"
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function SignInPage() {
  const { data: session } = useSession();
  if(session) {
    return redirect("/profile")
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center">Sign In</h2>
        <SignInForm />
      </div>
    </div>
  )
}

