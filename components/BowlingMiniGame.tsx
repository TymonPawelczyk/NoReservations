'use client';

import { useState, useEffect, useRef } from 'react';

interface BowlingMiniGameProps {
  onComplete: (score: number) => void;
}

export default function BowlingMiniGame({ onComplete }: BowlingMiniGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [barPosition, setBarPosition] = useState(0);
  const [direction, setDirection] = useState(1);
  const [result, setResult] = useState<number | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (gameState === 'playing') {
      const animate = () => {
        setBarPosition(prev => {
          let next = prev + direction * 2;
          if (next >= 100) {
            setDirection(-1);
            return 100;
          }
          if (next <= 0) {
            setDirection(1);
            return 0;
          }
          return next;
        });
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [gameState, direction]);

  const handleStart = () => {
    setGameState('playing');
  };

  const handleClick = () => {
    if (gameState !== 'playing') return;

    // Calculate score based on how close to green zone (40-60)
    let score: number;
    if (barPosition >= 40 && barPosition <= 60) {
      score = 100; // Perfect!
    } else if (barPosition >= 30 && barPosition <= 70) {
      score = 80; // Good
    } else if (barPosition >= 20 && barPosition <= 80) {
      score = 60; // OK
    } else {
      score = 30; // Weak
    }

    setResult(score);
    setGameState('finished');

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setTimeout(() => {
      onComplete(score);
    }, 2000);
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-b from-blue-900 to-purple-900">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">🎳 Mini Kręgle</h2>
          <p className="text-pink-200 text-sm">Kliknij w zielonej strefie!</p>
        </div>

        <div className="bg-white/10 border-4 border-white/30 p-8">
          {gameState === 'ready' && (
            <div className="text-center space-y-6">
              <p className="text-white text-lg">Naciśnij START i złap pasek w zielonej strefie!</p>
              <button onClick={handleStart} className="retro-button">
                START
              </button>
            </div>
          )}

          {(gameState === 'playing' || gameState === 'finished') && (
            <div className="space-y-6">
              {/* Timing bar */}
              <div className="relative h-16 bg-gray-800 border-4 border-black">
                {/* Green zone */}
                <div 
                  className="absolute top-0 bottom-0 left-[40%] w-[20%] bg-green-500 opacity-50"
                />
                
                {/* Moving bar */}
                <div
                  className="absolute top-0 bottom-0 w-2 bg-yellow-400 border-2 border-yellow-600 transition-all"
                  style={{ left: `${barPosition}%` }}
                />

                {/* Zone markers */}
                <div className="absolute top-0 bottom-0 left-[40%] w-[1px] bg-white opacity-30" />
                <div className="absolute top-0 bottom-0 left-[60%] w-[1px] bg-white opacity-30" />
              </div>

              {gameState === 'playing' && (
                <button onClick={handleClick} className="retro-button w-full text-lg">
                  KLIKNIJ!
                </button>
              )}

              {gameState === 'finished' && result !== null && (
                <div className="text-center space-y-4">
                  <div className={`text-6xl font-bold ${
                    result === 100 ? 'text-green-400' :
                    result >= 80 ? 'text-yellow-400' :
                    result >= 60 ? 'text-orange-400' :
                    'text-red-400'
                  }`}>
                    {result}
                  </div>
                  <p className="text-white text-lg">
                    {result === 100 ? '🎉 PERFEKCYJNIE!' :
                     result >= 80 ? '👍 Świetnie!' :
                     result >= 60 ? '😊 Nieźle!' :
                     '😅 Bywało lepiej...'}
                  </p>
                  <p className="text-pink-200 text-sm">Zapisuję wynik...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
