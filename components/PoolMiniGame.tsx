'use client';

import { useState, useEffect, useRef } from 'react';

interface PoolMiniGameProps {
  onComplete: (score: number) => void;
}

export default function PoolMiniGame({ onComplete }: PoolMiniGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [wavePosition, setWavePosition] = useState(0);
  const [jumps, setJumps] = useState(0);
  const [successfulJumps, setSuccessfulJumps] = useState(0);
  const [feedback, setFeedback] = useState<string>('');
  const animationRef = useRef<number | undefined>(undefined);
  const directionRef = useRef(1);
  const positionRef = useRef(0);

  const totalJumps = 5;

  useEffect(() => {
    if (gameState === 'playing') {
      let lastTime = Date.now();
      
      const animate = () => {
        const now = Date.now();
        const delta = now - lastTime;
        lastTime = now;
        
        // Wave moves at 40 units per second
        const speed = 0.04;
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
        
        setWavePosition(positionRef.current);
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

  const handleJump = () => {
    if (gameState !== 'playing' || jumps >= totalJumps) return;

    const currentPos = positionRef.current;
    const newJumps = jumps + 1;
    setJumps(newJumps);

    // Perfect zone is 40-60 (middle)
    let success = false;
    let feedbackText = '';
    
    if (currentPos >= 45 && currentPos <= 55) {
      success = true;
      feedbackText = '🌟 Perfekcyjny skok!';
      setSuccessfulJumps(prev => prev + 1);
    } else if (currentPos >= 35 && currentPos <= 65) {
      success = true;
      feedbackText = '👍 Dobry skok!';
      setSuccessfulJumps(prev => prev + 1);
    } else if (currentPos >= 25 && currentPos <= 75) {
      feedbackText = '😅 Prawie!';
    } else {
      feedbackText = '💦 Plusk!';
    }

    setFeedback(feedbackText);

    if (newJumps >= totalJumps) {
      setTimeout(() => {
        setSuccessfulJumps(currentSuccessful => {
          const finalScore = Math.round((currentSuccessful / totalJumps) * 100);
          setGameState('finished');
          
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }

          setTimeout(() => {
            onComplete(finalScore);
          }, 2000);
          return currentSuccessful;
        });
      }, 1000);
    } else {
      setTimeout(() => {
        setFeedback('');
      }, 800);
    }
  };

  const handleStart = () => {
    setGameState('playing');
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-b from-blue-900 to-cyan-900">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h2 className="text-xl sm:text-3xl font-bold text-white mb-2">🏊 Basen - Skoki</h2>
            <p className="text-pink-200 text-sm">Synchronizuj skoki z falami!</p>
          </div>

          <div className="bg-white/10 border-4 border-white/30 p-4 sm:p-8">
            <div className="text-center space-y-6">
              <p className="text-white text-sm sm:text-lg">
                Skacz do wody gdy fala jest w środku (niebieska strefa)!
              </p>
              <p className="text-pink-200 text-sm">
                Wykonaj {totalJumps} idealnych skoków!
              </p>
              <button onClick={handleStart} className="retro-button">
                ZACZNIJ SKAKAĆ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const finalScore = Math.round((successfulJumps / totalJumps) * 100);
    return (
      <div className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-b from-blue-900 to-cyan-900">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h2 className="text-xl sm:text-3xl font-bold text-white mb-4">Koniec zabawy w basenie!</h2>
            <div className="text-6xl font-bold text-cyan-400">{finalScore}</div>
            <p className="text-white mt-4">
              {finalScore >= 80 ? '🏆 Olimpijski skoczek!' :
               finalScore >= 60 ? '🏊 Świetna zabawa!' :
               '💦 Brawo za próbę!'}
            </p>
            <p className="text-pink-200 text-sm mt-2">Zapisuję wynik...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-b from-blue-900 to-cyan-900">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-xl sm:text-3xl font-bold text-white mb-2">🏊 Basen - Skoki</h2>
          <p className="text-pink-200 text-sm">Skok {jumps}/{totalJumps}</p>
        </div>

        <div className="bg-white/10 border-4 border-white/30 p-4 sm:p-8">
          {/* Wave indicator */}
          <div className="relative h-24 bg-blue-800 border-4 border-blue-900 rounded-lg overflow-hidden mb-6">
            {/* Perfect zone (middle) */}
            <div className="absolute top-0 bottom-0 left-[40%] w-[20%] bg-blue-400/40" />
            
            {/* Wave */}
            <div
              className="absolute top-0 bottom-0 w-2 bg-cyan-300 shadow-lg shadow-cyan-400/50"
              style={{ 
                left: `${wavePosition}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-100 to-cyan-500" />
            </div>

            {/* Zone markers */}
            <div className="absolute top-0 bottom-0 left-[45%] w-0.5 bg-blue-200 opacity-60" />
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/30" />
            <div className="absolute top-0 bottom-0 left-[55%] w-0.5 bg-blue-200 opacity-60" />
          </div>

          <button 
            onClick={handleJump} 
            className="retro-button w-full text-xl"
            disabled={jumps >= totalJumps}
          >
            🤿 SKOK!
          </button>

          {feedback && (
            <div className="mt-4 text-center">
              <p className="text-white text-xl font-bold">{feedback}</p>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-white">Udane skoki: {successfulJumps}/{jumps}</p>
        </div>
      </div>
    </div>
  );
}
