'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot, getDoc, updateDoc, deleteDoc, deleteField } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { stage3Questions } from '@/lib/questions';
import { AnswersData } from '@/lib/session';

interface Stage3Props {
  code: string;
  userId: string;
  onComplete: () => void;
}

export default function Stage3({ code, userId, onComplete }: Stage3Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [partnerAnswers, setPartnerAnswers] = useState<Record<string, string> | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [myScore, setMyScore] = useState(0);
  const [partnerScore, setPartnerScore] = useState(0);
  const [finishedAnswering, setFinishedAnswering] = useState(false);
  const [partnerFinished, setPartnerFinished] = useState(false);
  const [hasCompletedBefore, setHasCompletedBefore] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);
  const [partnerResetRequested, setPartnerResetRequested] = useState(false);

  useEffect(() => {
    // Check if user already completed this stage
    const checkCompletion = async () => {
      const answersSnap = await getDoc(doc(db, 'answers', code, 'stage3', 'data'));
      if (answersSnap.exists()) {
        const data = answersSnap.data() as AnswersData;
        const userData = data[userId];
        if (userData?.quizScore !== undefined && Object.keys(userData.answers || {}).length === stage3Questions.length) {
          // User already completed - load their data and show results
          setAnswers(userData.answers as Record<string, string>);
          setMyScore(userData.quizScore);
          setFinishedAnswering(true);
          setHasCompletedBefore(true);
        }
      }
    };
    checkCompletion();
  }, [code, userId]);

  useEffect(() => {
    // Listen to answers
    const unsubscribe = onSnapshot(doc(db, 'answers', code, 'stage3', 'data'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AnswersData;
        const partnerIds = Object.keys(data).filter(id => id !== userId);
        if (partnerIds.length > 0) {
          const partnerData = data[partnerIds[0]];
          setPartnerAnswers(partnerData.answers as Record<string, string>);
          setPartnerScore(partnerData.quizScore || 0);
          
          // Check if partner finished (has all answers)
          const partnerAnswerCount = Object.keys(partnerData.answers || {}).length;
          if (partnerAnswerCount >= stage3Questions.length && partnerData.quizScore !== undefined) {
            setPartnerFinished(true);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [code, userId]);

  // Auto-show results when both finished
  useEffect(() => {
    if (finishedAnswering && partnerFinished) {
      setShowResults(true);
    }
  }, [finishedAnswering, partnerFinished]);

  const requestReset = async () => {
    await updateDoc(doc(db, 'sessions', code), {
      [`resetRequests.stage3.${userId}`]: true,
    });
  };

  const performReset = async () => {
    // Clear all state
    setAnswers({});
    setPartnerAnswers(null);
    setShowResults(false);
    setMyScore(0);
    setPartnerScore(0);
    setFinishedAnswering(false);
    setPartnerFinished(false);
    setHasCompletedBefore(false);
    setCurrentQ(0);
    setResetRequested(false);
    setPartnerResetRequested(false);

    // Clear Firestore data
    await deleteDoc(doc(db, 'answers', code, 'stage3', 'data'));
    await updateDoc(doc(db, 'sessions', code), {
      'resetRequests.stage3': deleteField(),
    });
  };

  // Listen to reset requests
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'sessions', code), (snapshot) => {
      if (snapshot.exists()) {
        const sessionData = snapshot.data();
        
        // Check reset requests
        const resetReqs = sessionData.resetRequests?.stage3 || {};
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
  }, [code, userId]);

  const handleAnswer = async (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentQ < stage3Questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Calculate score
      const score = calculateScore(newAnswers);
      setMyScore(score);

      await setDoc(doc(db, 'answers', code, 'stage3', 'data'), {
        [userId]: {
          answers: newAnswers,
          quizScore: score,
        },
      }, { merge: true });

      setFinishedAnswering(true);
    }
  };

  const calculateScore = (userAnswers: Record<string, string>): number => {
    let correct = 0;
    stage3Questions.forEach(q => {
      const answer = userAnswers[q.id];
      const option = q.options.find(o => o.value === answer);
      if (option?.correct) {
        correct++;
      }
    });
    return correct;
  };

  // Waiting screen (when finished but partner hasn't)
  if (finishedAnswering && !showResults) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-white">Czekam na partnera...</h2>
          <p className="text-pink-200 text-sm">
            Skończyłeś/aś quiz! Czekaj aż partner odpowie.
          </p>
          <div className="bg-white/10 border-4 border-white/30 p-4">
            <p className="text-white text-sm">Twój wynik: {myScore}/{stage3Questions.length}</p>
            <p className="text-white/70 text-xs mt-2">
              Za chwilę zobaczycie razem wyniki i nagrody! 🏆
            </p>
          </div>
          <button onClick={onComplete} className="text-pink-200 text-sm hover:text-white">
            ← Powrót do mapy
          </button>
        </div>
      </div>
    );
  }

  // Results view
  if (showResults) {
    const hasPassedMassage = myScore >= Math.ceil(stage3Questions.length * 0.6);
    const partnerPassedMassage = partnerScore >= Math.ceil(stage3Questions.length * 0.6);
    const threshold = Math.ceil(stage3Questions.length * 0.6);

    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <h2 className="text-3xl font-bold text-white text-center">Wyniki Quizu!</h2>

          <div className="bg-white/10 border-4 border-white/30 p-6 space-y-4">
            {/* Scores */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-yellow-400 font-bold text-sm">TY</p>
                <p className="text-4xl font-bold text-white">{myScore}/{stage3Questions.length}</p>
              </div>
              <div className="text-center">
                <p className="text-pink-300 font-bold text-sm">PARTNER</p>
                <p className="text-4xl font-bold text-white">{partnerScore}/{stage3Questions.length}</p>
              </div>
            </div>

            {/* Rewards */}
            <div className="mt-6 space-y-3">
              <h3 className="text-white font-bold text-center">🏆 NAGRODY</h3>

              {/* Massage reward */}
              <div className={`p-4 border-4 text-center ${
                hasPassedMassage 
                  ? 'bg-green-500/30 border-green-500' 
                  : 'bg-gray-500/30 border-gray-500'
              }`}>
                <p className="text-2xl mb-2">💆</p>
                <p className="text-white font-bold">Masaż</p>
                <p className="text-xs text-white/70 mt-1">
                  {hasPassedMassage ? '✓ Odblokowałeś!' : `✗ Potrzebujesz ${threshold}+/${stage3Questions.length}`}
                </p>
              </div>

              {/* Cinema reward (alternative) */}
              <div className="p-4 border-4 bg-purple-500/30 border-purple-500 text-center">
                <p className="text-2xl mb-2">🎬</p>
                <p className="text-white font-bold">Film w kinie</p>
                <p className="text-xs text-white/70 mt-1">
                  Alternatywa (zawsze dostępna!)
                </p>
              </div>
            </div>

            {/* Question breakdown */}
            <div className="mt-6 pt-4 border-t-2 border-white/20">
              <h4 className="text-white text-sm font-bold mb-3">Twoje odpowiedzi:</h4>
              {stage3Questions.map((q, idx) => {
                const myAnswer = answers[q.id];
                const myOption = q.options.find(o => o.value === myAnswer);
                const isCorrect = myOption?.correct;

                return (
                  <div key={q.id} className="text-xs mb-2 pb-2 border-b border-white/10">
                    <p className="text-white/70 mb-1">{idx + 1}. {q.question}</p>
                    <p className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                      {isCorrect ? '✓' : '✗'} {myOption?.label}
                      {!isCorrect && (
                        <span className="text-green-400 ml-2">
                          (Poprawna: {q.options.find(o => o.correct)?.label})
                        </span>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
            
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
  const question = stage3Questions[currentQ];

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <p className="text-pink-200 text-sm mb-2">Etap 3: Quiz wiedzy</p>
          <p className="text-white text-xs">Pytanie {currentQ + 1}/{stage3Questions.length}</p>
          <p className="text-yellow-400 text-xs mt-1">Zdobądź {Math.ceil(stage3Questions.length * 0.6)}+/{stage3Questions.length} na masaż!</p>
        </div>

        <div className="bg-white/10 border-4 border-white/30 p-6">
          <h3 className="text-white text-lg font-bold mb-6 text-center">{question.question}</h3>

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
