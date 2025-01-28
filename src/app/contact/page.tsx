'use client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import { useState } from 'react'
import { Toast } from "@/components/ui/toast"

interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

const API_BASE_URL = process.env.BACKEND_URL;

export default function Contact() {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{
    message: string;
    variant: 'success' | 'error' | 'loading' | 'default';
    isVisible: boolean;
  }>({
    message: '',
    variant: 'default',
    isVisible: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setToast({
        message: 'Bitte füllen Sie alle Felder aus',
        variant: 'error',
        isVisible: true
      })
      return
    }

    try {
      setIsLoading(true)
      setToast({
        message: 'Nachricht wird gesendet...',
        variant: 'loading',
        isVisible: true
      })

      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Nachricht konnte nicht gesendet werden')
      }

      setToast({
        message: 'Nachricht wurde erfolgreich gesendet!',
        variant: 'success',
        isVisible: true
      })
      
      // Formular zurücksetzen
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      setToast({
        message: 'Nachricht konnte nicht gesendet werden: ' + error,
        variant: 'error',
        isVisible: true
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  return (
    <div className="min-h-screen bg-[#141414] p-8">
      <Toast 
        {...toast} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
      <div className="max-w-7xl w-[85%] mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Kontakt</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Kontaktinformationen */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-6">So erreichen Sie uns</h2>
              
              <div className="space-y-4">
                <Card className="p-4 bg-[#2C2C2C] border-0">
                  <div className="flex items-start space-x-3">
                    <MapPin className="text-red-500 w-5 h-5 mt-1" />
                    <div>
                      <h3 className="font-semibold text-white">Adresse</h3>
                      <p className="text-gray-300">Kinostraße 123</p>
                      <p className="text-gray-300">12345 Filmstadt</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-[#2C2C2C] border-0">
                  <div className="flex items-start space-x-3">
                    <Phone className="text-red-500 w-5 h-5 mt-1" />
                    <div>
                      <h3 className="font-semibold text-white">Telefon</h3>
                      <p className="text-gray-300">Kartenreservierung: 01234 / 567890</p>
                      <p className="text-gray-300">Verwaltung: 01234 / 567891</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-[#2C2C2C] border-0">
                  <div className="flex items-start space-x-3">
                    <Mail className="text-red-500 w-5 h-5 mt-1" />
                    <div>
                      <h3 className="font-semibold text-white">E-Mail</h3>
                      <p className="text-gray-300">info@cinemaplus.de</p>
                      <p className="text-gray-300">reservierung@cinemaplus.de</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-[#2C2C2C] border-0">
                  <div className="flex items-start space-x-3">
                    <Clock className="text-red-500 w-5 h-5 mt-1" />
                    <div>
                      <h3 className="font-semibold text-white">Öffnungszeiten</h3>
                      <p className="text-gray-300">Montag - Freitag: 14:00 - 23:00 Uhr</p>
                      <p className="text-gray-300">Samstag & Sonntag: 13:00 - 23:00 Uhr</p>
                      <p className="text-gray-300">An Feiertagen: 13:00 - 23:00 Uhr</p>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Anfahrt</h2>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="font-semibold text-white">Mit dem Auto:</h3>
                  <p>Direkt an der B123, Ausfahrt Filmstadt-Zentrum</p>
                  <p>Kostenlose Parkplätze direkt am Kino</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Mit öffentlichen Verkehrsmitteln:</h3>
                  <p>Bus: Linien 1, 2, 3 (Haltestelle: Kino-Center)</p>
                  <p>Bahn: S1, S2 (Station: Filmstadt Hauptbahnhof)</p>
                </div>
              </div>
            </section>
          </div>

          {/* Kontaktformular */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-6">Schreiben Sie uns</h2>
            <Card className="p-6 bg-[#2C2C2C] border-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                    Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ihr Name"
                    className="bg-[#3C3C3C] text-white border-0 focus:ring-0 focus:ring-white/20 placeholder:text-gray-400"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                    E-Mail
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ihre@email.de"
                    className="bg-[#3C3C3C] text-white border-0 focus:ring-0 focus:ring-white/20 placeholder:text-gray-400"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-white mb-1">
                    Betreff
                  </label>
                  <Input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Betreff"
                    className="bg-[#3C3C3C] text-white border-0 focus:ring-0 focus:ring-white/20 placeholder:text-gray-400"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-white mb-1">
                    Nachricht
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Ihre Nachricht"
                    className="bg-[#3C3C3C] text-white border-0 focus:ring-0 focus:ring-white/20 placeholder:text-gray-400 min-h-[150px]"
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-white hover:bg-white/90 text-black transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Wird gesendet...' : 'Nachricht senden'}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}