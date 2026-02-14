'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot, updateDoc, getDoc, deleteDoc, deleteField } from 'firebase/firestore';
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
  const [finishedAnswering, setFinishedAnswering] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [miniGameScore, setMiniGameScore] = useState<number | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [finalActivity, setFinalActivity] = useState<Activity | null>(null);
  const [agreementPercentage, setAgreementPercentage] = useState<number>(0);
  const [hasCompletedBefore, setHasCompletedBefore] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);
  const [partnerResetRequested, setPartnerResetRequested] = useState(false);

  useEffect(() => {
    // Check if user already completed this stage
    const checkCompletion = async () => {
      const answersSnap = await getDoc(doc(db, 'answers', code, 'stage2', 'data'));
      if (answersSnap.exists()) {
        const data = answersSnap.data() as AnswersData;
        const userData = data[userId];
        if (userData?.answers && Object.keys(userData.answers).length === stage2Questions.length) {
          // User already completed - load their data
          setAnswers(userData.answers as Record<string, string>);
          setMiniGameScore(userData.miniGameScore || null);
          setFinishedAnswering(true);
          setHasCompletedBefore(true);
        }
      }
    };
    checkCompletion();
  }, [code, userId]);

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
    // Listen to session outcome and reset requests
    const unsubscribe = onSnapshot(doc(db, 'sessions', code), (snapshot) => {
      if (snapshot.exists()) {
        const sessionData = snapshot.data();
        if (sessionData.outcomes?.stage2) {
      const outcome = sessionData.outcomes.stage2;
      
      // Check for cinema easter egg
      if (outcome === 'cinema') {
        setShowEasterEgg(true);
        setShowComparison(true);
        return;
      }
      
      setFinalActivity(outcome as Activity);
          // If bowling wins and we haven't played the mini-game yet
          if (outcome === 'bowling' && finishedAnswering && !miniGameScore && !showMiniGame && !showComparison) {
            setShowMiniGame(true);
          } else if (finishedAnswering) {
            setShowComparison(true);
          }
        } else if (showEasterEgg && showComparison) {
          // Outcome was deleted (partner clicked back from cinema easter egg)
          setShowEasterEgg(false);
          setShowComparison(false);
          setFinishedAnswering(false);
          setCurrentQ(4);
          
          // Clear q5 answer
          const newAnswers = { ...answers };
          delete newAnswers['q5'];
          setAnswers(newAnswers);
        }

        // Get agreement percentage
        if (sessionData.outcomeData?.stage2Agreement !== undefined) {
          setAgreementPercentage(sessionData.outcomeData.stage2Agreement);
        }
        
        // Check reset requests
        const resetReqs = sessionData.resetRequests?.stage2 || {};
        const partnerIds = Object.keys(sessionData.participants || {}).filter((id: string) => id !== userId);
        if (partnerIds.length > 0) {
          setPartnerResetRequested(resetReqs[partnerIds[0]] || false);
        }
        setResetRequested(resetReqs[userId] || false);
        
        // If both requested reset, perform it
        if (Object.keys(resetReqs).length === 2 && Object.values(resetReqs).every(v => v === true)) {
          performReset();
        }
      }
    });

    return () => unsubscribe();
  }, [code, userId, finishedAnswering, miniGameScore, showMiniGame, showComparison, showEasterEgg, answers]);

  const requestReset = async () => {
    await updateDoc(doc(db, 'sessions', code), {
      [`resetRequests.stage2.${userId}`]: true,
    });
  };

  const performReset = async () => {
    // Clear all state
    setAnswers({});
    setPartnerAnswers(null);
    setFinishedAnswering(false);
    setSelectedActivity(null);
    setShowEasterEgg(false);
    setShowMiniGame(false);
    setMiniGameScore(null);
    setShowComparison(false);
    setFinalActivity(null);
    setAgreementPercentage(0);
    setHasCompletedBefore(false);
    setCurrentQ(0);
    setResetRequested(false);
    setPartnerResetRequested(false);

    // Clear Firestore data
    await deleteDoc(doc(db, 'answers', code, 'stage2', 'data'));
    await updateDoc(doc(db, 'sessions', code), {
      'outcomes.stage2': deleteField(),
      'outcomeData.stage2Agreement': deleteField(),
      'resetRequests.stage2': deleteField(),
    });
  };

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
      setFinishedAnswering(true);
      calculateFinalActivity(newAnswers);
    }
  };

  const calculateFinalActivity = async (userAnswers: Record<string, string>) => {
    // Wait for partner answers
    const answersDoc = await getDoc(doc(db, 'answers', code, 'stage2', 'data'));
    if (!answersDoc.exists()) return;

    const allAnswers = answersDoc.data() as AnswersData;
    const userIds = Object.keys(allAnswers);

    if (userIds.length < 2) return;

    const user1Ans = allAnswers[userIds[0]].answers as Record<string, string>;
    const user2Ans = allAnswers[userIds[1]].answers as Record<string, string>;
    
    if (!stage2Questions.every(q => user1Ans[q.id] && user2Ans[q.id])) return;

    // Check for cinema easter egg (if anyone chose cinema in q5)
    if (user1Ans['q5'] === 'cinema' || user2Ans['q5'] === 'cinema') {
      // Save 'cinema' as outcome so both users get notified via listener
      await updateDoc(doc(db, 'sessions', code), {
        'outcomes.stage2': 'cinema',
      });
      return;
    }

    // Calculate scores
    let scores = { museum: 0, funhouse: 0, bowling: 0, pool: 0 };
    let matchingAnswers = 0;

    userIds.forEach(uid => {
      const userAns = allAnswers[uid].answers as Record<string, string>;
      stage2Questions.forEach(q => {
        const answer = userAns[q.id];
        const option = q.options.find(o => o.value === answer);
        if (option && 'points' in option) {
          const pts = option.points as any;
          scores.museum += pts.museum || 0;
          scores.funhouse += pts.funhouse || 0;
          scores.bowling += pts.bowling || 0;
          scores.pool += pts.pool || 0;
        }
      });
    });

    stage2Questions.forEach(q => {
      if (user1Ans[q.id] === user2Ans[q.id]) matchingAnswers++;
    });
    const agreement = Math.round((matchingAnswers / stage2Questions.length) * 100);

    // Determine winner
    let winner: Activity = 'museum';
    let maxScore = -1;
    (Object.entries(scores) as [Activity, number][]).forEach(([act, score]) => {
      if (score > maxScore) {
        maxScore = score;
        winner = act;
      }
    });

    // Save outcome
    await updateDoc(doc(db, 'sessions', code), {
      'outcomes.stage2': winner,
      'outcomeData.stage2Agreement': agreement,
    });
  };

  const handleActivitySelect = async (activity: Activity) => {
    // This is now used only for fallback or direct selection if we ever need it back
    // For now we keep the logic to avoid breaking other parts
    setSelectedActivity(activity);
    await setDoc(doc(db, 'answers', code, 'stage2', 'data'), {
      [userId]: {
        answers: { ...answers, finalActivity: activity },
      },
    }, { merge: true });

    if (activity === 'bowling') {
      setShowMiniGame(true);
    } else {
      setShowComparison(true);
    }
  };

  const handleMiniGameComplete = async (score: number) => {
    setMiniGameScore(score);
    setShowMiniGame(false);

    await setDoc(doc(db, 'answers', code, 'stage2', 'data'), {
      [userId]: {
        miniGameScore: score,
      },
    }, { merge: true });

    setShowComparison(true);
  };

  // Mini-game view
  if (showMiniGame) {
    return <BowlingMiniGame onComplete={handleMiniGameComplete} />;
  }

  // Waiting screen
  if (finishedAnswering && !showComparison && !showMiniGame) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center text-center">
        <div className="max-w-md w-full space-y-6">
          <div className="text-6xl mb-4 animate-bounce">⏳</div>
          <h2 className="text-2xl font-bold text-white">Obliczanie wspólnej pasji...</h2>
          <p className="text-pink-200">Czekam, aż partner dokończy wybór.</p>
        </div>
      </div>
    );
  }

  // Easter egg - Cinema rejection
  if (showEasterEgg && showComparison) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-3xl font-bold text-white mb-4">Kino? Serio?</h2>
          </div>

          <div className="bg-red-500/20 border-4 border-red-500 p-6 space-y-4">
            <SpeechBubble 
              text="Chyba żartujesz?? Nuuuda! 😴"
              autoCloseDuration={0}
            />

            <div className="text-center space-y-3">
              <p className="text-white text-sm">
                Przecież możemy obejrzeć film w domu pod kocem! 
                To miała być randka pełna akcji!
              </p>
              <div className="text-4xl">🍿❌</div>
              <p className="text-pink-300 text-xs italic">
                (Wybierzcie coś bardziej interesującego!)
              </p>
            </div>
          </div>

          <button 
            onClick={async () => {
              setShowEasterEgg(false);
              setShowComparison(false);
              setFinishedAnswering(false);
              setCurrentQ(4); // Wróć do ostatniego pytania
              
              // Clear q5 answer so user can choose again
              const newAnswers = { ...answers };
              delete newAnswers['q5'];
              setAnswers(newAnswers);
              
              // Clear outcome from Firestore so both users can re-answer
              await updateDoc(doc(db, 'sessions', code), {
                'outcomes.stage2': deleteField(),
              });
              
              await setDoc(doc(db, 'answers', code, 'stage2', 'data'), {
                [userId]: {
                  answers: newAnswers,
                },
              }, { merge: true });
            }}
            className="retro-button w-full bg-yellow-500 hover:bg-yellow-600"
          >
            😅 Ups, wybierzmy coś innego!
          </button>

          <button onClick={onComplete} className="text-center text-pink-200 text-sm hover:text-white w-full">
            ← Powrót do mapy
          </button>
        </div>
      </div>
    );
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
            
            {/* Reset button */}
            <div className="mt-4 space-y-2">
              {!resetRequested && !partnerResetRequested && (
                <button
                  onClick={requestReset}
                  className="retro-button w-full bg-red-600 hover:bg-red-700"
                >
                  🔄 Chcę spróbować ponownie
                </button>
              )}
              
              {resetRequested && !partnerResetRequested && (
                <div className="text-center p-3 bg-yellow-500/20 border-4 border-yellow-400">
                  <p className="text-yellow-300 text-sm">⏳ Czekam na partnera...</p>
                  <p className="text-white/60 text-xs mt-1">Proszę partnera o kliknięcie reset</p>
                </div>
              )}
              
              {!resetRequested && partnerResetRequested && (
                <div className="text-center p-3 bg-pink-500/20 border-4 border-pink-400">
                  <p className="text-pink-300 text-sm">💬 Partner chce spróbować ponownie</p>
                  <button
                    onClick={requestReset}
                    className="retro-button mt-2 bg-pink-600 hover:bg-pink-700"
                  >
                    ✓ Zgadzam się na reset
                  </button>
                </div>
              )}
              
              {resetRequested && partnerResetRequested && (
                <div className="text-center p-3 bg-green-500/20 border-4 border-green-400">
                  <p className="text-green-300 text-sm">✓ Reset za chwilę...</p>
                </div>
              )}
            </div>
          </div>

          <button onClick={onComplete} className="retro-button w-full">
            Powrót do mapy
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

        <div className="flex gap-3">
          {currentQ > 0 && (
            <button 
              onClick={() => setCurrentQ(currentQ - 1)} 
              className="retro-button flex-1 text-sm bg-gray-400"
            >
              ← Cofnij
            </button>
          )}
          <button 
            onClick={onComplete} 
            className="text-center text-pink-200 text-sm hover:text-white flex-1"
          >
            Powrót do mapy
          </button>
        </div>
      </div>
    </div>
  );
}
