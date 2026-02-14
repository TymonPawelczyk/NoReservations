'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, missingVars } from '@/lib/firebase';
import { generateUserId } from '@/lib/session';
import { AvatarKey, AVATAR_DISPLAY_NAMES } from '@/lib/avatars';
import Avatar from '@/components/Avatar';

export default function JoinSessionPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarKey | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!code.trim() || code.length !== 6) {
      setError('Wpisz 6-cyfrowy kod sesji!');
      return;
    }

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
      const sessionRef = doc(db, 'sessions', code);

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 15000)
      );

      const sessionSnap = await Promise.race([
        getDoc(sessionRef),
        timeoutPromise,
      ]);

      if (!sessionSnap.exists()) {
        setError('Sesja o tym kodzie nie istnieje!');
        setLoading(false);
        return;
      }

      const sessionData = sessionSnap.data();
      const participants = sessionData.participants || {};

      // Check if user is already in the session (rejoining)
      const existingUserId = Object.keys(participants).find(uid => {
        const participant = participants[uid];
        return participant.displayName === displayName.trim() && 
               participant.avatarKey === selectedAvatar;
      });

      let uid: string;
      
      if (existingUserId) {
        // User is rejoining - use existing userId
        uid = existingUserId;
        
        // Update lastSeenAt
        await updateDoc(sessionRef, {
          [`participants.${uid}.lastSeenAt`]: new Date().toISOString(),
        });
      } else {
        // New user joining
        if (Object.keys(participants).length >= 2) {
          setError('Sesja jest już pełna (2/2)! Jeśli wracasz, użyj tego samego imienia i avatara co wcześniej.');
          setLoading(false);
          return;
        }

        uid = generateUserId();
        const now = new Date();

        await updateDoc(sessionRef, {
          [`participants.${uid}`]: {
            displayName: displayName.trim(),
            avatarKey: selectedAvatar,
            lastSeenAt: now.toISOString(),
          },
          [`ready.${uid}`]: false,
        });
      }

      // Save to localStorage
      localStorage.setItem('sessionCode', code);
      localStorage.setItem('userId', uid);

      router.push(`/session/${code}`);
    } catch (err) {
      console.error('Error joining session:', err);
      const message = err instanceof Error && err.message === 'timeout'
        ? 'Nie udało się połączyć z bazą danych. Sprawdź połączenie z internetem.'
        : 'Błąd dołączania do sesji. Spróbuj ponownie.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-xl sm:text-3xl font-bold text-white mb-2">Dołącz do sesji</h1>
          <p className="text-sm text-pink-200">Wpisz kod od partnera</p>
        </div>

        <div className="bg-white/10 border-4 border-white/20 p-4 sm:p-6 space-y-4">
          <div>
            <label htmlFor="code" className="block text-white text-sm font-bold mb-2">
              Kod sesji (6 cyfr):
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
              placeholder="123456"
              className="retro-input w-full"
              maxLength={6}
            />
          </div>

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
          onClick={handleJoin}
          disabled={loading || !code || !selectedAvatar || !displayName.trim()}
          className="retro-button w-full"
        >
          {loading ? 'Dołączanie...' : 'Dołącz'}
        </button>

        <a href="/" className="block text-center text-pink-200 text-sm hover:text-white">
          ← Powrót
        </a>
      </div>
    </main>
  );
}
