"use server"

import { z } from "zod"
import { cookies } from "next/headers"

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function signIn(formData: FormData) {
  const validatedFields = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return { success: false, error: "Invalid input" }
  }

  const { email, password } = validatedFields.data

  try {
    const response = await fetch("http://localhost:8000/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (response.ok) {
      const data = await response.json()
      // Store the token in an HTTP-only cookie
      cookies().set("jwt", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
      })
      return { success: true }
    } else {
      const errorData = await response.json()
      return { success: false, error: errorData.error || "An error occurred during sign in" }
    }
  } catch (error) {
    console.error("Sign in error:", error)
    return { success: false, error: "An error occurred during sign in" }
  }
}

