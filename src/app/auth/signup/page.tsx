'use client';
import { useState } from 'react';
import Link from 'next/link';
import VerifyEmailForm from './VerifyEmailForm';

export default function SignUp() {
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch(`${process.env.BACKEND_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.get('email'),
          userName: formData.get('userName'),
          password: formData.get('password'),
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName')
        }),
      });

      if (res.ok) {
        setUserEmail(formData.get('email') as string);
        setShowVerification(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('An error occurred during registration');
    }
  };

  if (showVerification) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-8 p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-center">Verify Your Email</h2>
          <p className="text-center text-gray-600">
            We&apos;ve sent a 6-digit code to your email. Please enter it below to verify your account.
          </p>
          <VerifyEmailForm email={userEmail} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center">Sign Up</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border p-2"
            />
          </div>
          <div>
            <label htmlFor="userName" className="block text-sm font-medium">
              Username
            </label>
            <input
              id="userName"
              name="userName"
              type="text"
              required
              className="mt-1 block w-full rounded-md border p-2"
            />
          </div>
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              className="mt-1 block w-full rounded-md border p-2"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium">
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              className="mt-1 block w-full rounded-md border p-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-md border p-2"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600"
          >
            Sign Up
          </button>
        </form>
        <p className="text-center">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-blue-500 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
