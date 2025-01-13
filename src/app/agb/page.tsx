export default function AGB() {
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

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Allgemeine Geschäftsbedingungen</h1>
        
        <div className="bg-[#2C2C2C] p-8 rounded-lg shadow-lg space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-red-500 mb-4">§1 Geltungsbereich</h2>
            <p>
              Diese Website ist ein Studentenprojekt der DHBW Mannheim und dient ausschließlich 
              Demonstrationszwecken. Es werden keine tatsächlichen Dienstleistungen angeboten 
              oder Verträge geschlossen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-red-500 mb-4">§2 Nutzungsbedingungen</h2>
            <div className="space-y-2">
              <p>
                Die Nutzung dieser Demo-Website ist kostenlos und unverbindlich. 
                Alle dargestellten Funktionen sind rein demonstrativer Natur.
              </p>
              <p>
                Es ist nicht möglich, tatsächliche Kinokarten zu erwerben oder 
                verbindliche Reservierungen vorzunehmen.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-red-500 mb-4">§3 Haftungsausschluss</h2>
            <div className="space-y-2">
              <p>
                Die Betreiber dieser Website übernehmen keine Haftung für die 
                Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten Informationen.
              </p>
              <p>
                Alle Preisangaben, Vorstellungszeiten und sonstigen Informationen sind fiktiv 
                und dienen ausschließlich der Demonstration.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-red-500 mb-4">§4 Urheberrecht</h2>
            <div className="space-y-2">
              <p>
                Die auf dieser Website verwendeten Bilder, Texte und andere Medien 
                dienen ausschließlich Demonstrationszwecken.
              </p>
              <p>
                Filminformationen und Bilder stammen von der TMDB-API und unterliegen 
                deren Nutzungsbedingungen. Alle Rechte liegen bei den jeweiligen Eigentümern.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-red-500 mb-4">§5 Datenschutz</h2>
            <div className="space-y-2">
              <p>
                Es werden keine personenbezogenen Daten gespeichert oder verarbeitet. 
                Alle Eingaben dienen ausschließlich der Demonstration der Website-Funktionalität.
              </p>
              <p>
                Die Website verwendet keine Tracking-Tools oder Analyse-Software.
              </p>
            </div>
          </section>

          <div className="mt-8 p-4 bg-[#1C1C1C] rounded-lg">
            <p className="text-sm text-gray-400">
              Stand: {new Date().toLocaleDateString('de-DE')}
              <br />
              Diese AGB dienen nur der Demonstration und haben keine rechtliche Bindung.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 