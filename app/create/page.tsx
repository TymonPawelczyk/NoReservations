'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { db, missingVars } from '@/lib/firebase';
import { generateSessionCode, generateUserId } from '@/lib/session';
import { AvatarKey, AVATAR_DISPLAY_NAMES } from '@/lib/avatars';
import Avatar from '@/components/Avatar';

export default function CreateSessionPage() {
  const router = useRouter();
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarKey | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!selectedAvatar || !displayName.trim()) {
      setError('Wybierz avatar i wpisz imię!');
      return;
    }

    setLoading(true);
    setError('');

    // Check if Firebase is configured
    if (missingVars.length > 0) {
      setError(`Brak konfiguracji Firebase! Ustaw zmienne środowiskowe na Vercel.`);
      setLoading(false);
      return;
    }

    try {
      const code = generateSessionCode();
      const uid = generateUserId();
      
      // Session starts 1 hour from now (configurable)
      const now = new Date();
      const startAt = new Date(now.getTime() + 60 * 60 * 1000); // +1h

      // Timeout to prevent hanging if Firestore is unreachable
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 15000)
      );

      await Promise.race([
        setDoc(doc(db, 'sessions', code), {
          code,
          createdAt: now.toISOString(),
          startAt: startAt.toISOString(),
          stage: 1,
          stageUnlockedAt: startAt.toISOString(),
          ready: { [uid]: false },
          participants: {
            [uid]: {
              displayName: displayName.trim(),
              avatarKey: selectedAvatar,
              lastSeenAt: now.toISOString(),
            },
          },
        }),
        timeoutPromise,
      ]);

      // Save to localStorage
      localStorage.setItem('sessionCode', code);
      localStorage.setItem('userId', uid);

      router.push(`/session/${code}`);
    } catch (err) {
      console.error('Error creating session:', err);
      const message = err instanceof Error && err.message === 'timeout'
        ? 'Nie udało się połączyć z bazą danych. Sprawdź konfigurację Firebase na Vercel.'
        : 'Błąd tworzenia sesji. Spróbuj ponownie.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-xl sm:text-3xl font-bold text-white mb-2">Utwórz sesję</h1>
          <p className="text-sm text-pink-200">Wybierz swój avatar i nazwę</p>
        </div>

        {/* Avatar Selection */}
        <div className="bg-white/10 border-4 border-white/20 p-4 sm:p-6 space-y-4">
          <label className="block text-white text-sm font-bold mb-2">
            Wybierz avatar:
          </label>
          <div className="flex justify-center gap-6">
            {(['tymon', 'paula'] as AvatarKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedAvatar(key)}
                className={`p-2 border-4 transition-all ${
                  selectedAvatar === key
                    ? 'border-yellow-400 bg-yellow-400/20 scale-110'
                    : 'border-white/30 hover:border-white/50'
                }`}
                type="button"
              >
                <Avatar avatarKey={key} emotion="happy" size={80} animated={selectedAvatar === key} />
                <p className="text-white text-xs mt-2">{AVATAR_DISPLAY_NAMES[key]}</p>
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="displayName" className="block text-white text-sm font-bold mb-2">
              Twoje imię:
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Wpisz imię..."
              className="retro-input w-full text-base"
              maxLength={20}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-3 text-center text-sm border-4 border-red-700">
            {error}
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={loading || !selectedAvatar || !displayName.trim()}
          className="retro-button w-full"
        >
          {loading ? 'Tworzenie...' : 'Utwórz sesję'}
        </button>

        <a href="/" className="block text-center text-pink-200 text-sm hover:text-white">
          ← Powrót
        </a>
      </div>
    </main>
  );
}
