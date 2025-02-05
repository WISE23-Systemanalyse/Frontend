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

## Features


## Features

- 🎫 Kinoprogramm-Verwaltung
- 🎬 Film-Management
- 👥 Benutzerverwaltung
- 🏛️ Saalverwaltung
- 📅 Vorstellungsplanung
- 🎯 Sitzplatzreservierung

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
