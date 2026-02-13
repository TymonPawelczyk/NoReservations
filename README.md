# 🎮 BEZ REZERWACJI

Pixel-art dating app MVP dla dwóch osób. Wspólna randka w mobilnej aplikacji webowej!

## 🚀 Szybki Start

### Wymagania
- Node.js 18+ 
- npm
- Konto Firebase (darmowe)

### 1. Instalacja

```bash
npm install
```

### 2. Konfiguracja Firebase

1. Wejdź na [Firebase Console](https://console.firebase.google.com/)
2. Utwórz nowy projekt (lub użyj istniejącego)
3. Dodaj Web App do projektu
4. Włącz **Firestore Database** (tryb testowy OK dla MVP)
   - Przejdź do: Build → Firestore Database → Create database
   - Wybierz lokalizację (np. europe-west)
   - Zacznij w **test mode** (reguły bezpieczeństwa domyślne)

5. Skopiuj konfigurację Firebase:
   - Przejdź do Project Settings → General → Your apps
   - Skopiuj `firebaseConfig`

6. Utwórz plik `.env.local` w katalogu głównym:

```bash
cp .env.local.example .env.local
```

7. Wypełnij wartości w `.env.local` danymi z Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=twoj-projekt.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=twoj-projekt
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=twoj-projekt.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 3. Uruchomienie Lokalnie

```bash
npm run dev
```

Aplikacja będzie dostępna na: **http://localhost:3000**

### 4. Deploy na Vercel

#### Opcja A: Przez CLI

```bash
npm install -g vercel
vercel
```

#### Opcja B: Przez GitHub

1. Wypchnij kod na GitHub
2. Połącz repozytorium z [Vercel](https://vercel.com)
3. Dodaj zmienne środowiskowe w Vercel Dashboard:
   - Settings → Environment Variables
   - Dodaj wszystkie `NEXT_PUBLIC_FIREBASE_*` z `.env.local`
4. Deploy!

## 📱 Jak Używać

### Dla pierwszej osoby (Host):
1. Kliknij **"Utwórz sesję"**
2. Wybierz avatar (Tymon lub Paula)
3. Wpisz swoje imię
4. Otrzymasz **6-cyfrowy kod sesji**
5. Prześlij kod partnerowi (SMS, WhatsApp, etc.)

### Dla drugiej osoby (Partner):
1. Kliknij **"Dołącz do sesji"**
2. Wpisz otrzymany **6-cyfrowy kod**
3. Wybierz avatar
4. Wpisz swoje imię
5. Dołączasz do sesji!

### Rozgrywka:
- **Etap 1 (Jedzenie)**: Odpowiadacie na pytania, wynik: Włoskie vs Hot Pot
- **Etap 2 (Aktywności)**: Wybieracie zajęcie + mini-gra w kręglach
  - 🎬 Easter egg: "Film w kinie" → avatar mówi "Nuuuda ;)"
- **Etap 3 (Quiz)**: Quiz wiedzy → nagrody (masaż jeśli 3+/5)

### Ważne mechanizmy:
- **Podczas wypełniania**: Możesz cofnąć się przyciskiem "← Cofnij" do poprzedniego pytania
- **Po ukończeniu etapu**: Odpowiedzi są zablokowane - możesz tylko przeglądać wyniki
- **Przejście dalej**: Gdy oboje klikną "Lecimy dalej", automatycznie odblokowuje się następny etap
- **Synchronizacja**: Wszyscy widzą te same wyniki w tym samym czasie (real-time)

## 🏗️ Struktura Projektu

```
/app
  /create          # Tworzenie sesji
  /join            # Dołączanie do sesji
  /session/[code]  # Główny widok sesji
  layout.tsx       # Layout z PWA meta
  page.tsx         # Strona główna
  globals.css      # Style retro/pixel

/components
  Avatar.tsx            # Komponent avatara
  SpeechBubble.tsx      # Dymek do easter eggów
  BowlingMiniGame.tsx   # Mini-gra w kręgle
  /stages
    Stage1.tsx          # Etap 1: Jedzenie
    Stage2.tsx          # Etap 2: Aktywności
    Stage3.tsx          # Etap 3: Quiz

/lib
  firebase.ts      # Firebase config
  session.ts       # Typy i helpers sesji
  avatars.ts       # Mapa avatarów
  questions.ts     # Pytania do etapów

/public
  /avatars         # PNG avatary (tymon, paula)
  manifest.json    # PWA manifest
```

## 🎨 Assety

Avatary w `/public/avatars/`:
- `avatar-paula-{closed|happy|open|suprised}.png`
- `avatar-tymon-{closed|happy|open|suprised}.png`

Każdy avatar ma 4 emotki do różnych sytuacji.

## 🔥 Firebase Structure

### Collections:

#### `sessions/{code}`
```json
{
  "code": "123456",
  "createdAt": "2026-02-13T10:00:00Z",
  "startAt": "2026-02-13T11:00:00Z",
  "stage": 1,
  "stageUnlockedAt": "2026-02-13T11:00:00Z",
  "ready": {
    "user_123": false,
    "user_456": false
  },
  "participants": {
    "user_123": {
      "displayName": "Tymon",
      "avatarKey": "tymon",
      "lastSeenAt": "2026-02-13T10:05:00Z"
    }
  },
  "outcomes": {
    "stage1": "hotpot",
    "stage2": "bowling"
  }
}
```

#### `answers/{code}/stage1/data`
```json
{
  "user_123": {
    "answers": {
      "q1": "light",
      "q2": "fork"
    }
  }
}
```

#### `answers/{code}/stage2/data`
```json
{
  "user_123": {
    "answers": {
      "finalActivity": "bowling"
    },
    "miniGameScore": 85
  }
}
```

#### `answers/{code}/stage3/data`
```json
{
  "user_123": {
    "answers": {
      "q1": "parasite"
    },
    "quizScore": 4
  }
}
```

## 🎯 Features

✅ **Zrealizowane:**
- Tworzenie/dołączanie sesji (6-cyfrowy kod)
- Wybór avatara (pixel art: Tymon, Paula)
- Real-time sync przez Firestore
- 3 etapy rozgrywki z pytaniami
- Deterministic scoring (ten sam wynik dla obu)
- **Synchronizacja wyników** - obie osoby widzą outcome jednocześnie
- **Blokada odpowiedzi** - po ukończeniu etapu nie można zmienić odpowiedzi
- **Przycisk "Cofnij"** - cofanie się do poprzednich pytań podczas wypełniania
- **Automatyczne przejście** - gdy oboje klikną "Lecimy dalej" (2/2)
- Easter egg: "Film w kinie" w Etapie 2
- Mini-gra w kręgle (timing bar)
- Quiz wiedzy z nagrodami
- Retro/pixel art styling
- Mobile-first design
- PWA manifest (Add to Home Screen)

## 📋 TODO dla wersji 2.0

- [ ] Timer do automatycznego odblokowania etapów
- [ ] Reset etapu dla obu użytkowników (cofnięcie wszystkich odpowiedzi)
- [ ] Animacje przejść między pytaniami
- [ ] Więcej pytań i etapów
- [ ] Personalizacja nagród
- [ ] Historia sesji (przegląd starych randek)
- [ ] Eksport wyników jako zdjęcie/screenshot
- [ ] Notifications (PWA push gdy partner odpowiedział)
- [ ] Dark/light mode toggle
- [ ] Więcej avatarów i emotek
- [ ] Sound effects (retro 8-bit)
- [ ] Leaderboard mini-gier
- [ ] Konfiguracja czasu startu etapów w UI
- [ ] Walidacja Firestore Security Rules (produkcja)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom retro CSS
- **Database**: Firebase Firestore
- **Hosting**: Vercel
- **PWA**: manifest.json + meta tags

## 🔐 Bezpieczeństwo

⚠️ **UWAGA**: Obecna konfiguracja Firebase to **test mode**.

Dla produkcji, ustaw Firestore Security Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Sessions: read dla wszystkich, write tylko dla uczestników
    match /sessions/{code} {
      allow read: if true;
      allow create: if request.auth == null; // Anonimowo w MVP
      allow update: if request.auth == null;
    }
    
    // Answers: write dla własnego userId
    match /answers/{code}/{stage}/{document=**} {
      allow read: if true;
      allow write: if true; // W MVP bez auth
    }
  }
}
```

## 📱 PWA / Add to Home Screen

### iOS (Safari):
1. Otwórz stronę w Safari
2. Kliknij przycisk "Share" 
3. "Add to Home Screen"
4. Gotowe! Ikona na ekranie głównym

### Android (Chrome):
1. Otwórz stronę w Chrome
2. Menu → "Add to Home screen"
3. Potwierdź
4. Ikona na ekranie głównym

## 🐛 Troubleshooting

**Problem: Firebase błędy "Permission denied"**
- Sprawdź czy Firestore Database jest włączony w test mode
- Sprawdź czy `.env.local` ma poprawne klucze

**Problem: Nie widać partnera w sesji**
- Upewnij się, że oba urządzenia mają połączenie z internetem
- Sprawdź czy Firebase Firestore działa (Firebase Console)
- Odśwież stronę (real-time listener czasem potrzebuje czasu)

**Problem: Avatary się nie ładują**
- Sprawdź czy katalog `public/avatars/` zawiera pliki PNG
- Sprawdź konsolę przeglądarki pod kątem błędów 404

**Problem: Build fails on Vercel**
- Sprawdź czy wszystkie zmienne `NEXT_PUBLIC_FIREBASE_*` są dodane w Vercel
- Sprawdź logi build w Vercel Dashboard

## 🤝 Contributing

To jest MVP. Możesz:
- Dodać nowe pytania do `lib/questions.ts`
- Stworzyć nowe mini-gry
- Dodać więcej avatarów do `public/avatars/`
- Ulepszyć styling w `app/globals.css`

## 📄 License

MIT - robota na potrzeby osobiste/prywatne.

---

**Made with 💕 for special dates** | Pixel Dating Experience 🎮
