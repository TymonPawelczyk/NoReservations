'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { stage2Questions } from '@/lib/questions';
import { AnswersData } from '@/lib/session';
import SpeechBubble from '@/components/SpeechBubble';
import BowlingMiniGame from '@/components/BowlingMiniGame';

interface Stage2Props {
  code: string;
  userId: string;
  onComplete: () => void;
}

type Activity = 'museum' | 'funhouse' | 'bowling' | 'pool' | 'cinema';

export default function Stage2({ code, userId, onComplete }: Stage2Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [partnerAnswers, setPartnerAnswers] = useState<Record<string, string> | null>(null);
  const [showActivitySelection, setShowActivitySelection] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [miniGameScore, setMiniGameScore] = useState<number | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [finalActivity, setFinalActivity] = useState<Activity | null>(null);

  useEffect(() => {
    // Listen to answers
    const unsubscribe = onSnapshot(doc(db, 'answers', code, 'stage2', 'data'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AnswersData;
        const partnerIds = Object.keys(data).filter(id => id !== userId);
        if (partnerIds.length > 0) {
          const partnerData = data[partnerIds[0]];
          setPartnerAnswers(partnerData.answers as Record<string, string>);
        }
      }
    });

    return () => unsubscribe();
  }, [code, userId]);

  useEffect(() => {
    // Listen to session outcome
    const unsubscribe = onSnapshot(doc(db, 'sessions', code), (snapshot) => {
      if (snapshot.exists()) {
        const sessionData = snapshot.data();
        if (sessionData.outcomes?.stage2) {
          setFinalActivity(sessionData.outcomes.stage2);
        }
      }
    });

    return () => unsubscribe();
  }, [code]);

  const handleAnswer = async (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    await setDoc(doc(db, 'answers', code, 'stage2', 'data'), {
      [userId]: {
        answers: newAnswers,
      },
    }, { merge: true });

    if (currentQ < stage2Questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowActivitySelection(true);
    }
  };

  const handleActivitySelect = async (activity: Activity) => {
    // Easter egg: Cinema
    if (activity === 'cinema') {
      setShowEasterEgg(true);
      setTimeout(() => setShowEasterEgg(false), 3000);
      return;
    }

    setSelectedActivity(activity);

    // Save selection
    await setDoc(doc(db, 'answers', code, 'stage2', 'data'), {
      [userId]: {
        answers: { ...answers, finalActivity: activity },
      },
    }, { merge: true });

    // If bowling, show mini-game
    if (activity === 'bowling') {
      setShowMiniGame(true);
    } else {
      calculateFinalActivity(activity);
      setShowComparison(true);
    }
  };

  const handleMiniGameComplete = async (score: number) => {
    setMiniGameScore(score);
    setShowMiniGame(false);

    await setDoc(doc(db, 'answers', code, 'stage2', 'data'), {
      [userId]: {
        answers: { ...answers, finalActivity: 'bowling' },
        miniGameScore: score,
      },
    }, { merge: true });

    calculateFinalActivity('bowling');
    setShowComparison(true);
  };

  const calculateFinalActivity = async (userActivity: Activity) => {
    // For MVP, just use the first person's choice or random if different
    const result = userActivity;

    // Save outcome to session (this will trigger both users' listeners)
    await updateDoc(doc(db, 'sessions', code), {
      'outcomes.stage2': result,
    });
  };

  // Easter egg view
  if (showEasterEgg) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center bg-black/90">
        <div className="text-center">
          <div className="mb-6">
            <div className="text-8xl mb-4">😏</div>
          </div>
          <SpeechBubble 
            text="Chyba żartujesz?? Nuuuda ;)" 
            className="inline-block"
            autoCloseDuration={0}
          />
        </div>
      </div>
    );
  }

  // Mini-game view
  if (showMiniGame) {
    return <BowlingMiniGame onComplete={handleMiniGameComplete} />;
  }

  // Comparison view
  if (showComparison) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <h2 className="text-3xl font-bold text-white text-center">Wyniki Etapu 2</h2>

          <div className="bg-white/10 border-4 border-white/30 p-6 space-y-4">
            <h3 className="text-xl text-white font-bold text-center">Wybrana aktywność</h3>
            
            {finalActivity && (
              <div className="p-4 bg-gradient-to-r from-purple-400 to-pink-500 border-4 border-purple-600 text-center">
                <p className="text-2xl font-bold text-white">
                  {finalActivity === 'museum' && '🎨 Muzeum'}
                  {finalActivity === 'funhouse' && '🎪 FunHouse'}
                  {finalActivity === 'bowling' && '🎳 Kręgle'}
                  {finalActivity === 'pool' && '🏊 Basen'}
                </p>
              </div>
            )}

            {miniGameScore !== null && (
              <div className="mt-4 p-3 bg-yellow-400 text-black text-center">
                <p className="font-bold">Twój wynik w mini-grze: {miniGameScore}/100</p>
              </div>
            )}
          </div>

          <button onClick={onComplete} className="retro-button w-full">
            Powrót do mapy
          </button>
        </div>
      </div>
    );
  }

  // Activity selection view
  if (showActivitySelection) {
    const activities: { id: Activity; label: string; icon: string }[] = [
      { id: 'museum', label: 'Muzeum', icon: '🎨' },
      { id: 'funhouse', label: 'FunHouse', icon: '🎪' },
      { id: 'bowling', label: 'Kręgle', icon: '🎳' },
      { id: 'pool', label: 'Basen', icon: '🏊' },
      { id: 'cinema', label: 'Film w kinie', icon: '🎬' },
    ];

    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Wybierz aktywność</h2>
            <p className="text-pink-200 text-sm">Co będziemy robić?</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {activities.map(activity => (
              <button
                key={activity.id}
                onClick={() => handleActivitySelect(activity.id)}
                className="bg-white/10 border-4 border-white/30 hover:border-yellow-400 p-6 text-center transition-all hover:scale-105"
              >
                <div className="text-5xl mb-2">{activity.icon}</div>
                <p className="text-white font-bold text-sm">{activity.label}</p>
              </button>
            ))}
          </div>

          <button onClick={onComplete} className="block text-center text-pink-200 text-sm hover:text-white">
            ← Powrót
          </button>
        </div>
      </div>
    );
  }

  // Questions view
  const question = stage2Questions[currentQ];

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <p className="text-pink-200 text-sm mb-2">Etap 2: Co robimy?</p>
          <p className="text-white text-xs">Pytanie {currentQ + 1}/{stage2Questions.length}</p>
        </div>

        <div className="bg-white/10 border-4 border-white/30 p-6">
          <h3 className="text-white text-xl font-bold mb-6 text-center">{question.question}</h3>

          <div className="space-y-3">
            {question.options.map(option => (
              <button
                key={option.value}
                onClick={() => handleAnswer(question.id, option.value)}
                className="retro-button w-full text-sm"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={onComplete} className="block text-center text-pink-200 text-sm hover:text-white">
          ← Powrót
        </button>
      </div>
    </div>
  );
}
