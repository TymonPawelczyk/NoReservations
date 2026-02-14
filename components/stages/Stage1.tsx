'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, deleteDoc, deleteField, runTransaction } from 'firebase/firestore';
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
  const [outcome, setOutcome] = useState<'italian' | 'hotpot' | 'sushi' | null>(null);
  const [finishedAnswering, setFinishedAnswering] = useState(false);
  const [hasCompletedBefore, setHasCompletedBefore] = useState(false);
  const [agreementPercentage, setAgreementPercentage] = useState<number>(0);
  const [resetRequested, setResetRequested] = useState(false);
  const [partnerResetRequested, setPartnerResetRequested] = useState(false);

  useEffect(() => {
    // Check if user already completed this stage
    const checkCompletion = async () => {
      const answersDoc = await getDoc(doc(db, 'answers', code, 'stage1', 'data'));
      if (answersDoc.exists()) {
        const data = answersDoc.data() as AnswersData;
        const userData = data[userId];
        if (userData?.answers && Object.keys(userData.answers).length === stage1Questions.length) {
          // User already completed - load their answers and show comparison
          setAnswers(userData.answers as Record<string, string>);
          setFinishedAnswering(true);
          setHasCompletedBefore(true);
        }
      }
    };
    checkCompletion();
  }, [code, userId]);

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
    // Listen to session outcome and reset requests
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
        
        // Get agreement percentage
        if (sessionData.outcomeData?.stage1Agreement !== undefined) {
          setAgreementPercentage(sessionData.outcomeData.stage1Agreement);
        }
        
        // Check reset requests
        const resetReqs = sessionData.resetRequests?.stage1 || {};
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
  }, [code, finishedAnswering, userId]);

  const requestReset = async () => {
    await updateDoc(doc(db, 'sessions', code), {
      [`resetRequests.stage1.${userId}`]: true,
    });
  };

  const performReset = async () => {
    // Clear all state
    setAnswers({});
    setPartnerAnswers(null);
    setShowComparison(false);
    setOutcome(null);
    setFinishedAnswering(false);
    setHasCompletedBefore(false);
    setCurrentQ(0);
    setAgreementPercentage(0);
    setResetRequested(false);
    setPartnerResetRequested(false);

    // Clear Firestore data
    await deleteDoc(doc(db, 'answers', code, 'stage1', 'data'));
    await updateDoc(doc(db, 'sessions', code), {
      'outcomes.stage1': deleteField(),
      'outcomeData.stage1Agreement': deleteField(),
      'resetRequests.stage1': deleteField(),
    });
  };

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
    try {
      await runTransaction(db, async (transaction) => {
        const sessionRef = doc(db, 'sessions', code);
        const sessionDoc = await transaction.get(sessionRef);
        
        // Check if outcome already exists - if yes, skip calculation
        if (sessionDoc.exists() && sessionDoc.data().outcomes?.stage1) {
          return; // Already calculated by the other user
        }

        // Wait for partner answers
        const answersRef = doc(db, 'answers', code, 'stage1', 'data');
        const answersDoc = await transaction.get(answersRef);
        if (!answersDoc.exists()) return;

        const allAnswers = answersDoc.data() as AnswersData;
        const userIds = Object.keys(allAnswers);

        if (userIds.length < 2) {
          // Partner hasn't joined yet - just wait for them
          return;
        }

        // Check if BOTH users have completed ALL questions
        const user1Ans = allAnswers[userIds[0]].answers as Record<string, string>;
        const user2Ans = allAnswers[userIds[1]].answers as Record<string, string>;
        
        const user1Complete = stage1Questions.every(q => user1Ans[q.id] !== undefined);
        const user2Complete = stage1Questions.every(q => user2Ans[q.id] !== undefined);
        
        if (!user1Complete || !user2Complete) {
          // Not both finished yet - wait
          return;
        }

        // Calculate scores
        let italianScore = 0;
        let hotpotScore = 0;
        let sushiScore = 0;
        let matchingAnswers = 0;

        userIds.forEach(uid => {
          const userAns = allAnswers[uid].answers as Record<string, string>;
          stage1Questions.forEach(q => {
            const answer = userAns[q.id];
            const option = q.options.find(o => o.value === answer);
            if (option) {
              italianScore += option.points.italian;
              hotpotScore += option.points.hotpot;
              sushiScore += option.points.sushi || 0;
            }
          });
        });

        // Calculate agreement percentage
        stage1Questions.forEach(q => {
          if (user1Ans[q.id] === user2Ans[q.id]) {
            matchingAnswers++;
          }
        });
        const agreement = Math.round((matchingAnswers / stage1Questions.length) * 100);

        // Determine outcome (highest score wins, with deterministic tie-break)
        let result: 'italian' | 'hotpot' | 'sushi';
        const maxScore = Math.max(italianScore, hotpotScore, sushiScore);
        
        if (maxScore === italianScore && italianScore > hotpotScore && italianScore > sushiScore) {
          result = 'italian';
        } else if (maxScore === hotpotScore && hotpotScore > italianScore && hotpotScore > sushiScore) {
          result = 'hotpot';
        } else if (maxScore === sushiScore && sushiScore > italianScore && sushiScore > hotpotScore) {
          result = 'sushi';
        } else {
          // Tie-break: use session code modulo 3
          const codeNum = parseInt(code) % 3;
          result = codeNum === 0 ? 'italian' : codeNum === 1 ? 'hotpot' : 'sushi';
        }

        // Save outcome and agreement to session (this will trigger both users' listeners)
        transaction.update(sessionRef, {
          'outcomes.stage1': result,
          'outcomeData.stage1Agreement': agreement,
        });
      });
    } catch (error) {
      console.error('Error calculating outcome:', error);
      // Transaction failed - might be because outcome was already set by the other user
      // This is OK, the listener will pick it up
    }
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
              Za chwilę zobaczycie razem wynik! 🍕🍲🍣
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
            
            {/* Agreement percentage */}
            <div className={`p-3 border-4 text-center ${
              agreementPercentage >= 75 ? 'bg-green-500/20 border-green-400' :
              agreementPercentage >= 50 ? 'bg-yellow-500/20 border-yellow-400' :
              'bg-red-500/20 border-red-400'
            }`}>
              <p className="text-white font-bold text-lg">
                {agreementPercentage}% zgodności odpowiedzi
              </p>
              <p className="text-white/80 text-xs mt-1">
                {agreementPercentage >= 75 ? '🎉 Świetna kompatybilność!' :
                 agreementPercentage >= 50 ? '😊 Dobry początek' :
                 '🤔 Różne gusta'}
              </p>
            </div>
            
            {stage1Questions.map(q => {
              const myAnswer = answers[q.id];
              const partnerAnswer = partnerAnswers?.[q.id];
              const isMatch = myAnswer === partnerAnswer;
              
              return (
                <div key={q.id} className={`border-4 p-3 ${
                  isMatch ? 'border-green-400 bg-green-500/10' : 'border-white/20 bg-white/5'
                }`}>
                  <p className="text-white text-sm mb-2 flex items-center gap-2 break-words">
                    {isMatch && '✓'} {q.question}
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-start gap-2">
                      <span className={`text-xs font-semibold shrink-0 ${isMatch ? 'text-green-300' : 'text-yellow-400'}`}>
                        TY:
                      </span>
                      <span className={`text-xs break-words flex-1 ${isMatch ? 'text-green-300 font-bold' : 'text-white'}`}>
                        {q.options.find(o => o.value === myAnswer)?.label}
                      </span>
                      {isMatch && <span className="text-lg shrink-0">✓</span>}
                    </div>
                    <div className="flex items-start gap-2">
                      <span className={`text-xs font-semibold shrink-0 ${isMatch ? 'text-green-300' : 'text-pink-300'}`}>
                        PARTNER:
                      </span>
                      <span className={`text-xs break-words flex-1 ${isMatch ? 'text-green-300 font-bold' : 'text-white'}`}>
                        {partnerAnswers && q.options.find(o => o.value === partnerAnswer)?.label}
                      </span>
                      {!isMatch && <span className="text-lg shrink-0">✗</span>}
                    </div>
                  </div>
                </div>
              );
            })}

            {outcome && (
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 border-4 border-yellow-600 text-center">
                <p className="text-black font-bold text-lg mb-2">DECYZJA:</p>
                <p className="text-2xl font-bold text-black">
                  {outcome === 'italian' && '🍕 WŁOSKIE!'}
                  {outcome === 'hotpot' && '🍲 HOT POT!'}
                  {outcome === 'sushi' && '🍣 SUSHI!'}
                </p>
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
