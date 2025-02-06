# KinoTicketingSystem-Frontend
Ein modernes Kinoreservierungssystem, entwickelt mit Next.js und TypeScript.

## Voraussetzungen

Bevor Sie beginnen, stellen Sie sicher, dass folgende Software installiert ist:

- Node.js (Version 18 oder höher)
- npm (normalerweise mit Node.js installiert)
- Git

## Installation

1. Klonen Sie das Repository

2. Installieren Sie die Abhängigkeiten

npm install

3. Erstellen Sie eine `.env` Datei 

.env:

BACKEND_URL=http://localhost:8000

(Passen Sie die URL an Ihre Backend-Konfiguration an)

4. Starten Sie die Entwicklungsserver

npm run dev

Stellen Sie sicher, dass Sie sich in dem 'src' Verzeichnis befinden.

Seien Sie sicher, dass das Backend läuft und die Backend-URL in der `.env` korrekt konfiguriert ist.

5. Öffnen Sie [http://localhost:3000](http://localhost:3000) in Ihrem Browser

Die Anwendung ist dann unter `http://localhost:3000` verfügbar.

## Produktion

Bauen Sie die Anwendung für die Produktion:

npm run build

## Features & Anleitungen

### Für Kinobesucher
#### 🎫 So buchen Sie Ihre Kinotickets
1. **Film und Vorstellung auswählen**
   über /movies
   - hier sind Filme aufgelistet
   - iese sind über das genre sortiert
   - wähle einen Film aus
   - hier werden alle Vorstellungen des gewählten Films aufgelistet
   - wähle eine Vorstellung aus

   über /programm
   - 

2. **Vorstellung wählen**
   - Wählen Sie Ihr gewünschtes Datum
   - Wählen Sie die passende Vorstellungszeit
   - Sehen Sie direkt Verfügbarkeit und Preise

3. **Sitzplätze auswählen**
   - Wählen Sie aus verschiedenen Kategorien:
     * Standard-Sitze für besten Preis
     * Premium-Sitze für mehr Komfort
     * VIP-Sitze für das beste Erlebnis
   - Sehen Sie die Verfügbarkeit in Echtzeit
   - Wählen Sie einen oder mehrere Plätze

4. **Bezahlung**
   - Sichere Bezahlung via PayPal
   - Sofortige Buchungsbestätigung
   - Tickets per E-Mail

#### 👤 Ihr Benutzerkonto verwalten
1. **Registrierung & Login**
   - Einfache Registrierung mit E-Mail
   - Schneller Login
   - Passwort vergessen? Nutzen Sie die Reset-Funktion

2. **Ihre Buchungen**
   - Sehen Sie alle Ihre Buchungen
   - Verwalten Sie Ihre Tickets
   - Prüfen Sie Ihre Buchungshistorie

### Für Kinobetreiber (Admin)
#### 🎬 Filmverwaltung
1. **Filme verwalten**
   - Neue Filme hinzufügen
   - Filminformationen aktualisieren
   - FSK und Genres festlegen
   - Filmbilder hochladen

#### 📅 Vorstellungen planen
1. **Spielplan erstellen**
   - Vorstellungen für Filme anlegen
   - Säle zuweisen
   - Preise festlegen
   - Sondervorstellungen markieren

#### 🏛️ Säle einrichten
1. **Saalverwaltung**
   - Neue Säle anlegen
   - Sitzplan gestalten
   - Preiskategorien zuweisen
   - Bereiche definieren

#### 👥 Benutzerverwaltung
1. **Benutzer verwalten**
   - Kundenkonten überblicken
   - Berechtigungen vergeben
   - Buchungen einsehen
   - Support leisten

#### 📊 System konfigurieren
1. **Grundeinstellungen**
   - Basispreise festlegen
   - Kategorieaufschläge anpassen
   - E-Mail-Vorlagen gestalten
   - System-Updates durchführen

## Technologie-Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn/ui
- React Query

## Wichtige Hinweise

- Alle Zeiten im System werden in UTC gespeichert und angezeigt
- Das Backend muss separat installiert und konfiguriert werden
- Stellen Sie sicher, dass die Backend-URL in der `.env.local` korrekt konfiguriert ist
