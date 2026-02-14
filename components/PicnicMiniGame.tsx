'use client';

import { useState } from 'react';

interface PicnicMiniGameProps {
  onComplete: (score: number) => void;
}

const foodItems = ['🧀', '🥖', '🍷', '🍇', '🥐', '🥗', '🍓', '🍰'];

// Round configs: [sequenceLength per round]
const roundConfigs = [3, 3, 4, 5];
const maxRounds = roundConfigs.length;

export default function PicnicMiniGame({ onComplete }: PicnicMiniGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'memorize' | 'playing' | 'result' | 'finished'>('ready');
  const [targetSequence, setTargetSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [round, setRound] = useState(0); // 0-indexed
  const [score, setScore] = useState(0);
  const [roundResult, setRoundResult] = useState<'correct' | 'wrong' | null>(null);

  const generateSequence = (length: number) => {
    const sequence: string[] = [];
    const available = [...foodItems];
    for (let i = 0; i < length; i++) {
      const idx = Math.floor(Math.random() * available.length);
      sequence.push(available[idx]);
      available.splice(idx, 1); // no duplicates
    }
    return sequence;
  };

  const startRound = (roundIndex: number) => {
    const seqLength = roundConfigs[roundIndex];
    const newSequence = generateSequence(seqLength);
    setTargetSequence(newSequence);
    setPlayerSequence([]);
    setRoundResult(null);
    setRound(roundIndex);
    setGameState('memorize');
  };

  const handleReadyToAnswer = () => {
    setGameState('playing');
  };

  const handleFoodClick = (food: string) => {
    if (gameState !== 'playing' || roundResult) return;
    const newPlayerSequence = [...playerSequence, food];
    setPlayerSequence(newPlayerSequence);
  };

  const handleUndo = () => {
    if (gameState !== 'playing' || roundResult || playerSequence.length === 0) return;
    setPlayerSequence(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (playerSequence.length !== targetSequence.length) return;

    const isCorrect = playerSequence.every((food, i) => food === targetSequence[i]);
    if (isCorrect) {
      setRoundResult('correct');
      setScore(prev => prev + 100);
    } else {
      setRoundResult('wrong');
    }
    setGameState('result');
  };

  const handleNextRound = () => {
    const nextRound = round + 1;
    if (nextRound < maxRounds) {
      startRound(nextRound);
    } else {
      setGameState('finished');
      // Read final score via functional updater to get current value
      setTimeout(() => {
        setScore(currentScore => {
          const finalScore = Math.round((currentScore / (maxRounds * 100)) * 100);
          onComplete(finalScore);
          return currentScore;
        });
      }, 2000);
    }
  };

  const handleStart = () => {
    startRound(0);
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-b from-pink-900 to-red-900">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h2 className="text-xl sm:text-3xl font-bold text-white mb-2">🧺 Piknik w Domu</h2>
            <p className="text-pink-200 text-sm">Ułóż jedzenie na kocu!</p>
          </div>

          <div className="bg-white/10 border-4 border-white/30 p-4 sm:p-8">
            <div className="text-center space-y-6">
              <p className="text-white text-sm sm:text-lg">
                Zapamiętaj kolejność jedzenia i ułóż je tak samo na kocu!
              </p>
              <p className="text-pink-200 text-sm">
                {maxRounds} rundy, coraz trudniejsze 🍷
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
            <h2 className="text-xl sm:text-3xl font-bold text-white mb-4">Piknik zakończony!</h2>
            <div className="text-6xl font-bold text-pink-400">{finalScore}</div>
            <p className="text-white mt-4">
              {finalScore >= 75 ? '🍾 Perfekcyjny piknik!' :
               finalScore >= 50 ? '🧀 Pyszna zabawa!' :
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
          <h2 className="text-xl sm:text-3xl font-bold text-white mb-2">🧺 Piknik w Domu</h2>
          <p className="text-pink-200 text-sm">Runda {round + 1}/{maxRounds}</p>
        </div>

        <div className="bg-white/10 border-4 border-white/30 p-3 sm:p-6">
          {/* Memorize phase */}
          {gameState === 'memorize' && (
            <div className="space-y-6">
              <p className="text-white text-center font-bold">Zapamiętaj kolejność:</p>
              <div className="flex justify-center gap-3 flex-wrap min-h-[80px] items-center">
                {targetSequence.map((food, index) => (
                  <div key={index} className="text-3xl sm:text-5xl">{food}</div>
                ))}
              </div>
              <button onClick={handleReadyToAnswer} className="retro-button w-full">
                Zapamiętałem! ▶
              </button>
            </div>
          )}

          {/* Playing phase */}
          {gameState === 'playing' && (
            <div className="space-y-4">
              <p className="text-white text-center font-bold">
                Ułóż jedzenie ({playerSequence.length}/{targetSequence.length}):
              </p>
              
              {/* Player's sequence */}
              <div className="flex justify-center gap-2 flex-wrap min-h-[60px] items-center bg-orange-900/30 p-3 rounded border-2 border-orange-500">
                {playerSequence.map((food, index) => (
                  <div key={index} className="text-2xl sm:text-4xl">{food}</div>
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
                    disabled={playerSequence.length >= targetSequence.length}
                    className="text-3xl sm:text-5xl hover:scale-110 transition-transform bg-white/10 p-2 sm:p-3 rounded border-2 border-white/30 hover:border-pink-400 disabled:opacity-30 disabled:hover:scale-100"
                  >
                    {food}
                  </button>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                {playerSequence.length > 0 && (
                  <button onClick={handleUndo} className="retro-button flex-1 text-sm bg-gray-500">
                    ← Cofnij
                  </button>
                )}
                {playerSequence.length === targetSequence.length && (
                  <button onClick={handleSubmit} className="retro-button flex-1">
                    Zatwierdź ✓
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Result phase */}
          {gameState === 'result' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className={`text-3xl font-bold ${
                  roundResult === 'correct' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {roundResult === 'correct' ? '✓ Idealnie!' : '✗ Ups, nie ta kolejność!'}
                </p>
              </div>

              {/* Show correct vs player answer */}
              <div className="space-y-2">
                <div className="text-center">
                  <p className="text-pink-200 text-xs mb-1">Poprawna kolejność:</p>
                  <div className="flex justify-center gap-2">
                    {targetSequence.map((food, i) => (
                      <span key={i} className="text-3xl">{food}</span>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-pink-200 text-xs mb-1">Twoja kolejność:</p>
                  <div className="flex justify-center gap-2">
                    {playerSequence.map((food, i) => (
                      <span key={i} className={`text-3xl ${
                        food === targetSequence[i] ? '' : 'opacity-40'
                      }`}>{food}</span>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={handleNextRound} className="retro-button w-full">
                {round + 1 < maxRounds ? 'Następna runda ▶' : 'Podsumowanie ▶'}
              </button>
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
