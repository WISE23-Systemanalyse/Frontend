'use client';
import { useState } from 'react';
import Link from 'next/link';
import VerifyEmailForm from './VerifyEmailForm';
import { signUp } from './actions';

export default function SignUp() {
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await signUp(formData);
      if (result.success) {
        setUserEmail(formData.get('email') as string);
        setShowVerification(true);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('An error occurred during registration' + error);
    }
  };

  const inputClasses = `
    w-full px-3 py-2 rounded-md bg-[#3C3C3C] border-0 text-white 
    placeholder-gray-400 focus:ring-1 focus:ring-red-500
    [&:-webkit-autofill]:bg-[#3C3C3C]
    [&:-webkit-autofill]:text-white
    [&:-webkit-autofill]:[-webkit-text-fill-color:white]
    [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]
    [&:-webkit-autofill]:border-0
  `;

  if (showVerification) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 p-6 bg-[#2C2C2C] rounded-lg">
          <h2 className="text-2xl font-bold text-white text-center">E-Mail bestätigen</h2>
          <p className="text-center text-gray-400">
            Wir haben einen 6-stelligen Code an deine E-Mail gesendet. Bitte gib diesen unten ein.
          </p>
          <VerifyEmailForm email={userEmail} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 p-6 bg-[#2C2C2C] rounded-lg">
        <h2 className="text-2xl font-bold text-white text-center">Registrieren</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
              E-Mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-400 mb-1">
              Benutzername
            </label>
            <input
              id="userName"
              name="userName"
              type="text"
              required
              className={inputClasses}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-400 mb-1">
                Vorname
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-400 mb-1">
                Nachname
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className={inputClasses}
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
              Passwort
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className={inputClasses}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-md py-2 px-4 transition-colors mt-6"
          >
            Registrieren
          </button>
        </form>
        <p className="text-center text-gray-400">
          Bereits registriert?{' '}
          <Link href="/auth/signin" className="text-red-500 hover:text-red-400">
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  );
}
