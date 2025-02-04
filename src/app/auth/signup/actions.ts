"use server"
import { z } from "zod"
import { hash} from "bcrypt"

const signUpSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  userName: z.string().min(3, "Benutzername muss mindestens 3 Zeichen lang sein"),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

export async function signUp(formData: FormData) {
  const validatedFields = signUpSchema.safeParse({
    email: formData.get("email"),
    userName: formData.get("userName"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName")
  })

  if (!validatedFields.success) {
    const errors = validatedFields.error.issues
      .map((issue) => `${issue.message}`)
      .join(", ")
    return { success: false, error: errors }
  }

  const hasPass = await hash(validatedFields.data.password, 10)
  console.log("log: hashPass " + hasPass)

  const { email, userName, firstName, lastName } = validatedFields.data

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.toLowerCase()!,
        userName: userName.toLowerCase()!,
        password: hasPass.toString()!,
        firstName: firstName!,
        lastName: lastName!
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
    const response = await fetch(`${process.env.BACKEND_URL}/verifyemail`, {
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
