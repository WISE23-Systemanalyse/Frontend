# KinoTicketingSystem-Frontend
Ein modernes Kinoreservierungssystem, entwickelt mit Next.js und TypeScript.

## Features & Anleitungen

### Für Kinobesucher

#### 1. Buchungsprozess
<details>
<summary><b>🎥 Film und Vorstellung auswählen</b></summary>

**Über die Filmübersicht** `/movies`
- Übersichtliche Filmliste nach Genres sortiert
- Detaillierte Filminformationen
- Alle verfügbaren Vorstellungen des gewählten Films
- Einfache Vorstellungsauswahl

**Über den Spielplan** `/programm`
- Tagesaktuelle Vorstellungsübersicht
- Direktbuchung über "Tickets buchen"
</details>

<details>
<summary><b>💺 Sitzplatzauswahl</b></summary>

**Verfügbare Kategorien:**
- 🟢 Standard-Sitze - Bester Preis
- 🔵 Premium-Sitze - Mehr Komfort
- 👑 VIP-Sitze - Bestes Erlebnis

**Buchungsprozess:**
1. Gewünschte Sitze durch Klicken auswählen
2. "Plätze buchen" klicken für Bezahlvorgang
</details>

<details>
<summary><b>💳 Bezahlung & Bestätigung</b></summary>

**PayPal-Zahlung**
- Einfache Bezahlung via PayPal
- Sandbox-Testdaten:
  ```
  Email: sb-zcp7v36903022@personal.example.com
  Password: SO|Of45%
  ```
- Automatische Weiterleitung zur Bestätigung

**Buchungsbestätigung**
- Detaillierte Übersicht aller Buchungsinformationen
- Download der Tickets (PDF)
- Ticket-Sharing mit Freunden (nur für angemeldete Nutzer)
</details>

#### 2. Benutzerverwaltung
<details>
<summary><b>👤 Registrierung & Login</b></summary>

1. Anmelde-Icon in der oberen rechten Ecke
2. Registrierung mit E-Mail-Bestätigung
3. Login mit verifizierten Zugangsdaten
</details>

<details>
<summary><b>📱 Profilverwaltung</b></summary>

- 🎫 Buchungshistorie einsehen
- 👥 Freundesliste verwalten
- ✏️ Persönliche Daten bearbeiten
</details>

### ⚙️ Für Kinobetreiber (Admin)

> Zugriff über `/admin`

<details>
<summary><b>🎬 Filmverwaltung</b></summary>

**`/admin/movies`**
- Filme hinzufügen und bearbeiten
- Filminformationen aktualisieren
</details>

<details>
<summary><b>🏛️ Saalverwaltung</b></summary>

**`/admin/halls`**
- Säle erstellen und konfigurieren
- Saaleditor:
  - Reihen/Spalten mit +/- anpassen
  - Sitztypen durch Klicken/Ziehen ändern:
    - Standard
    - Premium
    - VIP
    - Gang (kein Sitz)
</details>

<details>
<summary><b>💰 Preiskategorien</b></summary>

**`/admin/categories`**
- Feste Sitzplatzkategorien
- Aufpreise pro Kategorie anpassbar
</details>

<details>
<summary><b>📅 Vorstellungen</b></summary>

**`/admin/shows`**
- Vorstellungen anlegen und bearbeiten
- Zeitplan und Saalzuordnung verwalten
</details>

<details>
<summary><b>👥 Benutzerverwaltung</b></summary>

**`/admin/users`**
- Benutzerübersicht und -verwaltung
- Berechtigungen verwalten
</details>

<details>
<summary><b>🎫 Buchungsverwaltung</b></summary>

**`/admin/bookings`**
- Buchungsübersicht und -details
- Buchungsverwaltung und -historie
</details>

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
