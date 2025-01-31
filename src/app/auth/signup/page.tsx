'use client';
import { useState } from 'react';
import Link from 'next/link';
import VerifyEmailForm from './VerifyEmailForm';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUp() {
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    
    try {
      const res = await fetch(`${process.env.BACKEND_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: formData.get('password'),
          userName: formData.get('userName')
        }),
      });

      if (res.ok) {
        setUserEmail(email);
        setShowVerification(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('An error occurred during registration' + error);
    }
  };

  if (showVerification) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#2C2C2C] border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white text-center">
              E-Mail bestätigen
            </CardTitle>
            <p className="text-sm text-gray-400 text-center">
              Wir haben einen 6-stelligen Code an Ihre E-Mail-Adresse gesendet.
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <VerifyEmailForm email={userEmail} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#2C2C2C] border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-white text-center">
            Registrieren
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                E-Mail
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="bg-[#3C3C3C] text-white border-0 focus:ring-0 focus:ring-white/20 placeholder:text-gray-400"
                placeholder="ihre@email.de"
              />
            </div>

            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-white mb-1">
                Benutzername
              </label>
              <Input
                id="userName"
                name="userName"
                type="text"
                required
                className="bg-[#3C3C3C] text-white border-0 focus:ring-0 focus:ring-white/20 placeholder:text-gray-400"
                placeholder="Benutzername"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                Passwort
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-[#3C3C3C] text-white border-0 focus:ring-0 focus:ring-white/20 placeholder:text-gray-400"
                placeholder="••••••••"
              />
            </div>

            <Button 
              type="submit"
              className="w-full bg-white hover:bg-white/90 text-black transition-colors"
            >
              Registrieren
            </Button>

            <div className="text-center text-sm text-gray-400">
              Bereits registriert?{' '}
              <Link 
                href="/auth/signin" 
                className="text-white hover:text-gray-300"
              >
                Anmelden
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
