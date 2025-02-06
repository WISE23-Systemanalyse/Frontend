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
   - wähle eine Vorstellung aus der Liste aus

   über /programm
   - hier werden alle Vorstellungen für das Kino angezeigt
   - über Tickets buchen kannst du zu einer bestimmten Vorstellung gehen

3. **Sitzplätze auswählen**
   - Wählen hier aus verschiedenen Kategorien:
     * Standard-Sitze für besten Preis
     * Premium-Sitze für mehr Komfort
     * VIP-Sitze für das beste Erlebnis
   - zum Auswählen eines Sitzes diesen einfach anwählen
   - wenn du alle Sitze ausgewählt hast kannst du auf Plätze buchen klicken

4. **Bezahlung**
   - bei uns kann man über PayPal bezahlen
   - dazu braucht man folgende Sandbox daten:
     * email: sb-zcp7v36903022@personal.example.com
     * password: SO|Of45%
   - nach der Bazahlung wird man zur Buchungsbestätigung weitergeleitet

   **Buchungsbestätigung**
   - hier wird werden alle details über die Buchung angezeigt
   - wenn mann die Tickets anwählt, kann man diese herunterladen oder Freunden zuweisen (dazu muss man angemeldet sein)

#### 👤 Benutzerkonto verwalten
1. **Registrierung & Login**
   - oben rechts gibt es ein Anmelden Icon
   - hier kann man sich registrieren oder einloggen
   - wenn man sich registriert benötigt man noch eine Bestätigungsmail

2. **Ihre Profil**
   - hier kann man alle Buchungen einsehen
   - Freunde einsehen und neue Freunde hinzufügen
   - Profilinformationen bearbeiten

### Für Kinobetreiber (Admin)
#### 🎬 Filmverwaltung
diese findet man und /admin
**Filme verwalten**
   - Neue Filme hinzufügen
   - Filminformationen aktualisieren

**Saalverwaltung**
   - Neue Säle anlegen
   - mit + und - können die Reihen oder Spalten angepasst werden
   - durch klicken oder zeihen über die Sitze kann man diese vom Typ verändern (je nachdem, welche Typ oben ausgewählt ist Standard, Premium oder VIP oder kein Sitz für Gänge)

**Kategorien verwalten**
   - die Kategorien sind immer Fest
   - dort kann man den aufpreis für die jeweilige Kategorie anpassen

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
