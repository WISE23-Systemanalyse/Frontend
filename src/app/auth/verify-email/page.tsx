import VerifyEmailForm from "./VerifyEmailForm"
import React from "react";

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { email: string }
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center">Verify Your Email</h2>
        <p className="text-center text-gray-600">
          We've sent a 6-digit code to your email. Please enter it below to verify your account.
        </p>
        <VerifyEmailForm email={searchParams.email} />
      </div>
    </div>
  )
}

