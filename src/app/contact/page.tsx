'use client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Hier könnte die Logik für das Absenden des Formulars implementiert werden
  }

  return (
    <div className="min-h-screen bg-[#141414] p-8">
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
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ihr Name"
                    className="bg-[#3C3C3C] border-0"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    E-Mail
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ihre@email.de"
                    className="bg-[#3C3C3C] border-0"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">
                    Betreff
                  </label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="Betreff"
                    className="bg-[#3C3C3C] border-0"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                    Nachricht
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Ihre Nachricht"
                    className="bg-[#3C3C3C] border-0 min-h-[150px]"
                  />
                </div>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white">
                  Nachricht senden
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}