export default function Impressum() {
  return (
    <div className="min-h-screen bg-[#141414] p-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-6 mb-12 rounded-lg shadow-lg text-center">
        <p className="text-xl font-semibold">
          ⚠️ Dies ist ein Studentenprojekt der DHBW Mannheim
        </p>
        <p className="text-sm mt-2 text-gray-100">
          Keine kommerzielle Website - Alle Funktionen dienen nur der Demonstration
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-12 text-center">Impressum</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
          {/* Team & Hochschule nebeneinander */}
          <section className="bg-[#2C2C2C] p-8 rounded-lg shadow-lg hover:bg-[#3C3C3C] transition-colors duration-300">
            <h2 className="text-2xl font-semibold text-red-500 mb-6">Team</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-3">
                <p className="text-lg">Leon Primer</p>
                <p className="text-lg">Dilmand Saado</p>
                <p className="text-lg">Tarnbir Singh</p>
                <p className="text-lg">Max Meinel</p>
                <p className="text-lg">Florian Kloetzsch</p>
              </div>
            </div>
          </section>

          <section className="bg-[#2C2C2C] p-8 rounded-lg shadow-lg hover:bg-[#3C3C3C] transition-colors duration-300">
            <h2 className="text-2xl font-semibold text-red-500 mb-6">Hochschule</h2>
            <div className="space-y-3">
              <p className="text-lg">DHBW Mannheim</p>
              <p className="text-lg">Coblitzallee 1-9</p>
              <p className="text-lg">68163 Mannheim</p>
              <p className="mt-4 text-lg">Studiengang: Wirtschaftsinformatik SE</p>
            </div>
          </section>

          {/* Kontakt & Haftungshinweis nebeneinander */}
          <section className="bg-[#2C2C2C] p-8 rounded-lg shadow-lg hover:bg-[#3C3C3C] transition-colors duration-300">
            <h2 className="text-2xl font-semibold text-red-500 mb-6">Kontakt</h2>
            <div className="space-y-3">
              {[
                'leon.primer@sap.com',
                'dilmand.saado@sap.com',
                'max.meinel@sap.com',
                'florian.kloetzsch@sap.com',
                'tarnbir.singh@sap.com'
              ].map((email) => (
                <div key={email} className="flex items-center space-x-2 text-lg">
                  <span>📧</span>
                  <a 
                    href={`mailto:${email}`} 
                    className="hover:text-red-500 transition-colors duration-200"
                  >
                    {email}
                  </a>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#2C2C2C] p-8 rounded-lg shadow-lg hover:bg-[#3C3C3C] transition-colors duration-300">
            <h2 className="text-2xl font-semibold text-red-500 mb-6">Haftungshinweis</h2>
            <div className="space-y-4 text-lg">
              <p>
                Dies ist ein Studentenprojekt. Alle dargestellten Informationen, 
                Bilder und Funktionen dienen ausschließlich der Demonstration und 
                haben keinen kommerziellen Charakter.
              </p>
              <p>
                Die Nutzung dieser Website erfolgt auf eigene Gefahr. 
                Alle Angaben ohne Gewähr.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 