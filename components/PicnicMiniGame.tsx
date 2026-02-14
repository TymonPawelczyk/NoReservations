'use client';

import { useState, useEffect } from 'react';

interface PicnicMiniGameProps {
  onComplete: (score: number) => void;
}

const foodItems = ['🧀', '🥖', '🍷', '🍇', '🥐', '🥗', '🍓', '🍰'];

export default function PicnicMiniGame({ onComplete }: PicnicMiniGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'memorize' | 'playing' | 'finished'>('ready');
  const [targetSequence, setTargetSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);

  const maxRounds = 5;

  const generateSequence = (length: number) => {
    const sequence: string[] = [];
    for (let i = 0; i < length; i++) {
      const randomItem = foodItems[Math.floor(Math.random() * foodItems.length)];
      sequence.push(randomItem);
    }
    return sequence;
  };

  const startNewRound = () => {
    const sequenceLength = round + 2; // Start with 3, then 4, 5, etc.
    const newSequence = generateSequence(sequenceLength);
    setTargetSequence(newSequence);
    setPlayerSequence([]);
    setGameState('memorize');
    setShowFeedback(null);

    // After 3 seconds, hide the sequence
    setTimeout(() => {
      setGameState('playing');
    }, 2000 + sequenceLength * 500);
  };

  const handleFoodClick = (food: string) => {
    if (gameState !== 'playing') return;

    const newPlayerSequence = [...playerSequence, food];
    setPlayerSequence(newPlayerSequence);

    // Check if this item is correct
    if (food !== targetSequence[playerSequence.length]) {
      // Wrong!
      setShowFeedback('wrong');
      setTimeout(() => {
        if (round < maxRounds) {
          setRound(round + 1);
          startNewRound();
        } else {
          finishGame();
        }
      }, 1500);
      return;
    }

    // Check if sequence is complete
    if (newPlayerSequence.length === targetSequence.length) {
      // Correct!
      setShowFeedback('correct');
      const points = 100;
      setScore(score + points);
      
      setTimeout(() => {
        if (round < maxRounds) {
          setRound(round + 1);
          startNewRound();
        } else {
          finishGame();
        }
      }, 1500);
    }
  };

  const finishGame = () => {
    setGameState('finished');
    setTimeout(() => {
      onComplete(Math.round((score / (maxRounds * 100)) * 100));
    }, 2000);
  };

  const handleStart = () => {
    startNewRound();
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-b from-pink-900 to-red-900">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">🧺 Piknik w Domu</h2>
            <p className="text-pink-200 text-sm">Ułóż jedzenie na kocu!</p>
          </div>

          <div className="bg-white/10 border-4 border-white/30 p-8">
            <div className="text-center space-y-6">
              <p className="text-white text-lg">
                Zapamiętaj kolejność jedzenia i ułóż je tak samo na kocu!
              </p>
              <p className="text-pink-200 text-sm">
                Każda runda będzie coraz trudniejsza 🍷
              </p>
              <button onClick={handleStart} className="retro-button">
                ZACZNIJ PIKNIK
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const finalScore = Math.round((score / (maxRounds * 100)) * 100);
    return (
      <div className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-b from-pink-900 to-red-900">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Piknik zakończony!</h2>
            <div className="text-6xl font-bold text-pink-400">{finalScore}</div>
            <p className="text-white mt-4">
              {finalScore >= 80 ? '🍾 Perfekcyjny piknik!' :
               finalScore >= 60 ? '🧀 Pyszna zabawa!' :
               '🍷 Smaczne było!'}
            </p>
            <p className="text-pink-200 text-sm mt-2">Zapisuję wynik...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-b from-pink-900 to-red-900">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">🧺 Piknik w Domu</h2>
          <p className="text-pink-200 text-sm">Runda {round}/{maxRounds}</p>
        </div>

        <div className="bg-white/10 border-4 border-white/30 p-6">
          {gameState === 'memorize' && (
            <div className="space-y-4">
              <p className="text-white text-center font-bold">Zapamiętaj kolejność:</p>
              <div className="flex justify-center gap-2 flex-wrap min-h-[80px] items-center">
                {targetSequence.map((food, index) => (
                  <div 
                    key={index}
                    className="text-5xl animate-bounce"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {food}
                  </div>
                ))}
              </div>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="space-y-4">
              <p className="text-white text-center font-bold">
                Ułóż jedzenie ({playerSequence.length}/{targetSequence.length}):
              </p>
              
              {/* Player's sequence */}
              <div className="flex justify-center gap-2 flex-wrap min-h-[60px] items-center bg-orange-900/30 p-3 rounded border-2 border-orange-500">
                {playerSequence.map((food, index) => (
                  <div key={index} className="text-4xl">
                    {food}
                  </div>
                ))}
                {playerSequence.length === 0 && (
                  <p className="text-orange-300 text-sm">Wybierz jedzenie poniżej...</p>
                )}
              </div>

              {/* Available food */}
              <div className="grid grid-cols-4 gap-3">
                {foodItems.map((food, index) => (
                  <button
                    key={index}
                    onClick={() => handleFoodClick(food)}
                    className="text-5xl hover:scale-110 transition-transform bg-white/10 p-3 rounded border-2 border-white/30 hover:border-pink-400"
                  >
                    {food}
                  </button>
                ))}
              </div>

              {showFeedback && (
                <div className="text-center mt-4">
                  <p className={`text-2xl font-bold ${
                    showFeedback === 'correct' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {showFeedback === 'correct' ? '✓ Idealnie!' : '✗ Ups, nie ta kolejność!'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-white">Wynik: {score}/{maxRounds * 100}</p>
        </div>
      </div>
    </div>
  );
}
