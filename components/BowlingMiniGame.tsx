'use client';

import { useState, useEffect, useRef } from 'react';

interface BowlingMiniGameProps {
  onComplete: (score: number) => void;
}

export default function BowlingMiniGame({ onComplete }: BowlingMiniGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [barPosition, setBarPosition] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [clickedPosition, setClickedPosition] = useState<number | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const directionRef = useRef(1);
  const positionRef = useRef(0);

  useEffect(() => {
    if (gameState === 'playing') {
      let lastTime = Date.now();
      
      const animate = () => {
        const now = Date.now();
        const delta = now - lastTime;
        lastTime = now;
        
        // Move 50 units per second for smooth, consistent speed
        const speed = 0.05; // units per millisecond
        const movement = delta * speed * directionRef.current;
        
        positionRef.current += movement;
        
        // Bounce at edges
        if (positionRef.current >= 100) {
          positionRef.current = 100;
          directionRef.current = -1;
        } else if (positionRef.current <= 0) {
          positionRef.current = 0;
          directionRef.current = 1;
        }
        
        setBarPosition(positionRef.current);
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [gameState]);

  const handleStart = () => {
    setBarPosition(0);
    positionRef.current = 0;
    directionRef.current = 1;
    setClickedPosition(null);
    setResult(null);
    setGameState('playing');
  };

  const handleClick = () => {
    if (gameState !== 'playing') return;

    // Use ref value for most accurate position
    const currentPosition = positionRef.current;
    setClickedPosition(currentPosition);
    
    // Calculate score based on how close to green zone (40-60)
    let score: number;
    if (currentPosition >= 40 && currentPosition <= 60) {
      score = 100; // Perfect!
    } else if (currentPosition >= 30 && currentPosition <= 70) {
      score = 80; // Good
    } else if (currentPosition >= 20 && currentPosition <= 80) {
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
              <div className="relative h-20 bg-gray-800 border-4 border-black rounded-lg overflow-hidden">
                {/* Green zone */}
                <div 
                  className="absolute top-0 bottom-0 left-[40%] w-[20%] bg-green-500/40"
                />
                
                {/* Moving bar (only when playing) */}
                {gameState === 'playing' && (
                  <div
                    className="absolute top-0 bottom-0 w-1.5 bg-yellow-400 shadow-lg shadow-yellow-500/50"
                    style={{ 
                      left: `${barPosition}%`,
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-yellow-200 to-yellow-600" />
                  </div>
                )}
                
                {/* Clicked position marker (when finished) */}
                {gameState === 'finished' && clickedPosition !== null && (
                  <div
                    className="absolute top-0 bottom-0 w-2 bg-red-500 shadow-lg shadow-red-500/50"
                    style={{ 
                      left: `${clickedPosition}%`,
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl">
                      📍
                    </div>
                  </div>
                )}

                {/* Zone markers */}
                <div className="absolute top-0 bottom-0 left-[40%] w-0.5 bg-green-300 opacity-60" />
                <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-green-300 opacity-60" />
                
                {/* Center indicator */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20" />
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
