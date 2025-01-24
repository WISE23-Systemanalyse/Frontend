"use server"

import { z } from "zod"

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  userName: z.string().min(3, "Username must be at least 3 characters long"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

export async function signUp(formData: FormData) {
  const validatedFields = signUpSchema.safeParse({
    email: formData.get("email"),
    userName: formData.get("userName"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
  })

  if (!validatedFields.success) {
    const errors = validatedFields.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(", ")
    return { success: false, error: `Invalid input: ${errors}` }
  }

  const { email, userName, password, firstName, lastName } = validatedFields.data

  try {
    const response = await fetch("http://localhost:8000/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        userName,
        password,
        firstName,
        lastName,
      }),
    })

    if (response.ok) {
      return { success: true, email }
    } else {
      const errorData = await response.json()
      return { success: false, error: errorData.error || "An error occurred during sign up" }
    }
  } catch (error) {
    console.error("Sign up error:", error)
    return { success: false, error: "An error occurred during sign up" }
  }
}

