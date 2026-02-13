'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { stage1Questions } from '@/lib/questions';
import { AnswersData } from '@/lib/session';

interface Stage1Props {
  code: string;
  userId: string;
  onComplete: () => void;
}

export default function Stage1({ code, userId, onComplete }: Stage1Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [partnerAnswers, setPartnerAnswers] = useState<Record<string, string> | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [outcome, setOutcome] = useState<'italian' | 'hotpot' | null>(null);
  const [finishedAnswering, setFinishedAnswering] = useState(false);

  useEffect(() => {
    // Listen to answers
    const unsubscribe = onSnapshot(doc(db, 'answers', code, 'stage1', 'data'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AnswersData;
        const partnerIds = Object.keys(data).filter(id => id !== userId);
        if (partnerIds.length > 0) {
          setPartnerAnswers(data[partnerIds[0]].answers as Record<string, string>);
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
        if (sessionData.outcomes?.stage1) {
          setOutcome(sessionData.outcomes.stage1);
          // Auto-show comparison when outcome is ready
          if (finishedAnswering) {
            setShowComparison(true);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [code, finishedAnswering]);

  const handleAnswer = async (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    // Save to Firestore
    await setDoc(doc(db, 'answers', code, 'stage1', 'data'), {
      [userId]: {
        answers: newAnswers,
      },
    }, { merge: true });

    // Move to next question or show comparison
    if (currentQ < stage1Questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Mark as finished
      setFinishedAnswering(true);
      // Try to calculate outcome (will only work if both finished)
      await calculateOutcome(newAnswers);
    }
  };

  const calculateOutcome = async (userAnswers: Record<string, string>) => {
    // Wait for partner answers
    const answersDoc = await getDoc(doc(db, 'answers', code, 'stage1', 'data'));
    if (!answersDoc.exists()) return;

    const allAnswers = answersDoc.data() as AnswersData;
    const userIds = Object.keys(allAnswers);

    if (userIds.length < 2) {
      // Partner hasn't joined yet - just wait for them
      return;
    }

    // Check if both have completed all questions
    const bothFinished = userIds.every(uid => {
      const userAns = allAnswers[uid].answers as Record<string, string>;
      return Object.keys(userAns).length === stage1Questions.length;
    });

    if (!bothFinished) {
      // Wait for both to finish all questions
      return;
    }

    // Calculate scores
    let italianScore = 0;
    let hotpotScore = 0;

    userIds.forEach(uid => {
      const userAns = allAnswers[uid].answers as Record<string, string>;
      stage1Questions.forEach(q => {
        const answer = userAns[q.id];
        const option = q.options.find(o => o.value === answer);
        if (option) {
          italianScore += option.points.italian;
          hotpotScore += option.points.hotpot;
        }
      });
    });

    // Determine outcome (with deterministic tie-break using session code)
    let result: 'italian' | 'hotpot';
    if (italianScore > hotpotScore) {
      result = 'italian';
    } else if (hotpotScore > italianScore) {
      result = 'hotpot';
    } else {
      // Tie-break: use session code parity
      result = parseInt(code) % 2 === 0 ? 'italian' : 'hotpot';
    }

    // Save outcome to session (this will trigger both users' listeners)
    await updateDoc(doc(db, 'sessions', code), {
      'outcomes.stage1': result,
    });
  };

  // Waiting screen (when finished but partner hasn't)
  if (finishedAnswering && !showComparison) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-white">Czekam na partnera...</h2>
          <p className="text-pink-200 text-sm">
            Skończyłeś/aś pytania! Czekaj aż partner odpowie.
          </p>
          <div className="bg-white/10 border-4 border-white/30 p-4">
            <p className="text-white text-xs">
              Za chwilę zobaczycie razem wynik! 🍕🍲
            </p>
          </div>
          <button onClick={onComplete} className="text-pink-200 text-sm hover:text-white">
            ← Powrót do mapy
          </button>
        </div>
      </div>
    );
  }

  if (showComparison) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <h2 className="text-3xl font-bold text-white text-center">Wyniki Etapu 1</h2>

          <div className="bg-white/10 border-4 border-white/30 p-6 space-y-4">
            <h3 className="text-xl text-white font-bold text-center">Porównanie odpowiedzi</h3>
            
            {stage1Questions.map(q => (
              <div key={q.id} className="border-b-2 border-white/20 pb-3">
                <p className="text-white text-sm mb-2">{q.question}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-yellow-400">
                    TY: {q.options.find(o => o.value === answers[q.id])?.label}
                  </div>
                  <div className="text-pink-300">
                    PARTNER: {partnerAnswers && q.options.find(o => o.value === partnerAnswers[q.id])?.label}
                  </div>
                </div>
              </div>
            ))}

            {outcome && (
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 border-4 border-yellow-600 text-center">
                <p className="text-black font-bold text-lg mb-2">DECYZJA:</p>
                <p className="text-2xl font-bold text-black">
                  {outcome === 'italian' ? '🍕 WŁOSKIE!' : '🍲 HOT POT!'}
                </p>
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

  const question = stage1Questions[currentQ];

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <p className="text-pink-200 text-sm mb-2">Etap 1: Jedzenie</p>
          <p className="text-white text-xs">Pytanie {currentQ + 1}/{stage1Questions.length}</p>
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
