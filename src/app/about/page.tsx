'use client'
import { Card } from "@/components/ui/card"
import { Film, Speaker, Popcorn, History, Accessibility, CupSoda } from 'lucide-react'

export default function About() {
  return (
    <div className="min-h-screen bg-[#141414] p-8">
      <div className="max-w-7xl w-[85%] mx-auto">
        <h1 className="text-5xl font-bold text-white mb-4">Über CinemaPlus</h1>
        <p className="text-xl text-gray-300 max-w-2xl mb-12">
          Seit 1995 bieten wir unseren Besuchern ein einzigartiges Kinoerlebnis.
        </p>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-[#2C2C2C] border-0 hover:bg-[#3C3C3C] transition-colors duration-200">
            <Film className="w-10 h-10 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Modernste Technik</h3>
            <p className="text-gray-300">
              6 Kinosäle ausgestattet mit 4K-Projektoren und Dolby Atmos Sound für ein perfektes Filmerlebnis.
            </p>
          </Card>

          <Card className="p-6 bg-[#2C2C2C] border-0 hover:bg-[#3C3C3C] transition-colors duration-200">
            <Speaker className="w-10 h-10 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Premium Sound</h3>
            <p className="text-gray-300">
              Kristallklarer Sound und perfekte Akustik in allen Sälen für ein immersives Klangerlebnis.
            </p>
          </Card>

          <Card className="p-6 bg-[#2C2C2C] border-0 hover:bg-[#3C3C3C] transition-colors duration-200">
            <Popcorn className="w-10 h-10 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Snackbar</h3>
            <p className="text-gray-300">
              Frisches Popcorn, kühle Getränke und eine große Auswahl an Snacks für den perfekten Filmgenuss.
            </p>
          </Card>

          <Card className="p-6 bg-[#2C2C2C] border-0 hover:bg-[#3C3C3C] transition-colors duration-200">
            <CupSoda className="w-10 h-10 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">VIP Service</h3>
            <p className="text-gray-300">
              Getränke- und Snackservice direkt am Platz - für ein entspanntes Kinoerlebnis ohne Warteschlangen.
            </p>
          </Card>

          <Card className="p-6 bg-[#2C2C2C] border-0 hover:bg-[#3C3C3C] transition-colors duration-200">
            <Accessibility className="w-10 h-10 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Barrierefreiheit</h3>
            <p className="text-gray-300">
              Alle Säle und Einrichtungen sind barrierefrei zugänglich für ein Kino ohne Hindernisse.
            </p>
          </Card>

          <Card className="p-6 bg-[#2C2C2C] border-0 hover:bg-[#3C3C3C] transition-colors duration-200">
            <History className="w-10 h-10 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Tradition</h3>
            <p className="text-gray-300">
              Über 25 Jahre Erfahrung in der Unterhaltungsbranche mit stetigem Fokus auf Innovation.
            </p>
          </Card>
        </div>

        {/* Geschichte Section */}
        <div className="bg-[#2C2C2C] rounded-lg p-8">
          <h2 className="text-3xl font-bold text-white mb-6">Unsere Geschichte</h2>
          <div className="space-y-6 text-gray-300">
            <p>
              Was 1995 als kleines Programmkino begann, hat sich zu einem der modernsten Multiplexkinos 
              der Region entwickelt. Dabei sind wir unseren Wurzeln treu geblieben: Qualitätskino für 
              jeden Geschmack, persönlicher Service und faire Preise.
            </p>
            <p>
              Heute verfügen unsere modern ausgestatteten Säle über die neueste Generation von 
              Projektions- und Soundsystemen. Jeder Saal ist mit luxuriösen Sitzen und optimaler 
              Sichtergonomie ausgestattet, um Ihnen das bestmögliche Kinoerlebnis zu bieten.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 