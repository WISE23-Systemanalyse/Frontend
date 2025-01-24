"use server"

import { z } from "zod"

const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
})

export async function verifyEmail(formData: FormData) {
  const validatedFields = verifyEmailSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
  })

  if (!validatedFields.success) {
    return { success: false, error: "Invalid input" }
  }

  const { email, code } = validatedFields.data

  try {
    const response = await fetch("http://localhost:8000/verifyemail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code }),
    })

    if (response.ok) {
      return { success: true }
    } else {
      const errorData = await response.json()
      return { success: false, error: errorData.error || "An error occurred during email verification" }
    }
  } catch (error) {
    console.error("Email verification error:", error)
    return { success: false, error: "An error occurred during email verification" }
  }
}

