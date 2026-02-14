'use client';

import { useState, useEffect, useRef } from 'react';

interface WalkMiniGameProps {
  onComplete: (score: number) => void;
}

const scenery = ['🌸', '🦋', '🌈', '🐿️', '🌺', '🦜', '🌻', '🦔'];

export default function WalkMiniGame({ onComplete }: WalkMiniGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [showScenery, setShowScenery] = useState(false);
  const [currentScenery, setCurrentScenery] = useState('');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [roundResult, setRoundResult] = useState<'great' | 'good' | 'slow' | 'early' | null>(null);
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const totalRounds = 5;

  const startNextRound = () => {
    if (currentRound >= totalRounds) {
      setGameState('finished');
      const finalScore = Math.round((score / (totalRounds * 100)) * 100);
      setTimeout(() => {
        onComplete(finalScore);
      }, 2000);
      return;
    }

    setRoundResult(null);
    setReactionTime(null);
    
    // Random delay before showing scenery (1-3 seconds)
    const delay = 1000 + Math.random() * 2000;
    
    timeoutRef.current = setTimeout(() => {
      setCurrentScenery(scenery[Math.floor(Math.random() * scenery.length)]);
      setShowScenery(true);
      startTimeRef.current = Date.now();
    }, delay);
  };

  const handleClick = () => {
    // Early click penalty
    if (!showScenery && !roundResult && gameState === 'playing') {
      // Cancel the scheduled scenery appearance
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Apply penalty
      const penalty = 20;
      setScore(Math.max(0, score - penalty));
      setRoundResult('early');
      setCurrentRound(currentRound + 1);
      
      setTimeout(() => {
        startNextRound();
      }, 1500);
      return;
    }
    
    if (!showScenery) return;

    const reactionMs = Date.now() - startTimeRef.current;
    setReactionTime(reactionMs);
    setShowScenery(false);

    let points = 0;
    let result: 'great' | 'good' | 'slow' = 'slow';
    
    if (reactionMs < 400) {
      points = 100;
      result = 'great';
    } else if (reactionMs < 700) {
      points = 70;
      result = 'good';
    } else {
      points = 40;
      result = 'slow';
    }

    setScore(score + points);
    setRoundResult(result);
    setCurrentRound(currentRound + 1);

    setTimeout(() => {
      startNextRound();
    }, 1500);
  };

  const handleStart = () => {
    setGameState('playing');
    startNextRound();
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-b from-green-900 to-teal-900">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">🚶 Spacer po Parku</h2>
            <p className="text-pink-200 text-sm">Zbieraj niespodzianki!</p>
          </div>

          <div className="bg-white/10 border-4 border-white/30 p-8">
            <div className="text-center space-y-6">
              <p className="text-white text-lg">
                Kliknij ekran gdy tylko zobaczysz niespodziankę podczas spaceru!
              </p>
              <p className="text-pink-200 text-sm">
                Im szybciej zareagujesz, tym więcej punktów!
              </p>
              <p className="text-red-300 text-xs">
                ⚠️ Uwaga: Kliknięcie za wcześnie = kara -20 punktów!
              </p>
              <button onClick={handleStart} className="retro-button">
                START SPACERU
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const finalScore = Math.round((score / (totalRounds * 100)) * 100);
    return (
      <div className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-b from-green-900 to-teal-900">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Koniec spaceru!</h2>
            <div className="text-6xl font-bold text-green-400">{finalScore}</div>
            <p className="text-white mt-4">
              {finalScore >= 80 ? '🌟 Świetny refleks!' :
               finalScore >= 60 ? '👍 Niezłe oko!' :
               '😊 Miły spacer!'}
            </p>
            <p className="text-pink-200 text-sm mt-2">Zapisuję wynik...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-b from-green-900 to-teal-900">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">🚶 Spacer po Parku</h2>
          <p className="text-pink-200 text-sm">Runda {currentRound + 1}/{totalRounds}</p>
        </div>

        <div 
          onClick={handleClick}
          className="bg-white/10 border-4 border-white/30 p-12 cursor-pointer hover:bg-white/20 transition-all min-h-[300px] flex items-center justify-center"
        >
          {showScenery ? (
            <div className="text-center">
              <div className="text-9xl animate-bounce">{currentScenery}</div>
              <p className="text-white mt-4 text-xl font-bold">KLIKNIJ!</p>
            </div>
          ) : roundResult ? (
            <div className="text-center space-y-3">
              <p className={`text-4xl font-bold ${
                roundResult === 'great' ? 'text-green-400' :
                roundResult === 'good' ? 'text-yellow-400' :
                roundResult === 'early' ? 'text-red-500' :
                'text-orange-400'
              }`}>
                {roundResult === 'great' && '⚡ Błyskawiczny!'}
                {roundResult === 'good' && '👍 Dobrze!'}
                {roundResult === 'slow' && '🐢 Szybciej...'}
                {roundResult === 'early' && '❌ Za wcześnie! -20'}
              </p>
              {reactionTime !== null && roundResult !== 'early' && (
                <p className="text-white text-sm">{reactionTime}ms</p>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-white text-xl">Czekaj na niespodziankę...</p>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-white">Wynik: {Math.round((score / (totalRounds * 100)) * 100)}</p>
        </div>
      </div>
    </div>
  );
}
