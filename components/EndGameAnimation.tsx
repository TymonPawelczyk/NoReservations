'use client';

import { useEffect, useState } from 'react';
import Avatar from './Avatar';
import { AvatarKey } from '@/lib/avatars';

interface EndGameAnimationProps {
  player1Avatar: AvatarKey;
  player2Avatar: AvatarKey;
  player1Name: string;
  player2Name: string;
  onComplete: () => void;
}

export default function EndGameAnimation({
  player1Avatar,
  player2Avatar,
  player1Name,
  player2Name,
  onComplete,
}: EndGameAnimationProps) {
  const [animationPhase, setAnimationPhase] = useState<'fade-in' | 'walking' | 'hearts' | 'message' | 'fade-out'>('fade-in');
  const [showHearts, setShowHearts] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // Animation timeline
    const timeline = [
      { delay: 0, action: () => setAnimationPhase('fade-in') },
      { delay: 500, action: () => setAnimationPhase('walking') },
      { delay: 2000, action: () => {
        setAnimationPhase('hearts');
        setShowHearts(true);
      }},
      { delay: 3500, action: () => {
        setAnimationPhase('message');
        setShowMessage(true);
      }},
      { delay: 6000, action: () => setAnimationPhase('fade-out') },
      { delay: 7000, action: () => onComplete() },
    ];

    const timeouts = timeline.map(({ delay, action }) =>
      setTimeout(action, delay)
    );

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-purple-900 via-pink-900 to-red-900 transition-opacity duration-1000 ${
        animationPhase === 'fade-in' ? 'opacity-0 animate-fade-in' : 'opacity-100'
      } ${animationPhase === 'fade-out' ? 'opacity-0' : ''}`}
    >
      {/* Starry background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-200 rounded-full animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center space-y-8 p-4">
        {/* Title */}
        <div className={`text-center transition-all duration-1000 ${
          animationPhase === 'fade-in' ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
        }`}>
          <h1 className="text-yellow-300 text-xl sm:text-3xl mb-2 pixel-glow">
            Gratulacje!
          </h1>
          <p className="text-pink-200 text-xs sm:text-sm">
            Ukończyliście wszystkie etapy!
          </p>
        </div>

        {/* Avatars walking together */}
        <div className="relative w-full max-w-md h-40 sm:h-48">
          {/* Road/path */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-gray-700 to-gray-800 border-t-4 border-white/30">
            <div className="h-1 bg-yellow-400/50 mt-2"></div>
            <div className="h-1 bg-yellow-400/50 mt-6"></div>
          </div>

          {/* Walking avatars container */}
          <div className={`absolute bottom-16 left-1/2 -translate-x-1/2 flex items-end gap-4 transition-all duration-[2000ms] ${
            animationPhase === 'walking' || animationPhase === 'hearts' || animationPhase === 'message'
              ? 'translate-x-8 sm:translate-x-16'
              : '-translate-x-full'
          }`}>
            {/* Player 1 */}
            <div className="flex flex-col items-center">
              <div className={`transition-transform duration-300 ${
                animationPhase === 'walking' || animationPhase === 'hearts' || animationPhase === 'message'
                  ? 'animate-bounce-walk'
                  : ''
              }`}>
                <Avatar
                  avatarKey={player1Avatar}
                  emotion="happy"
                  size={80}
                  animated={true}
                  flipHorizontal={true}
                />
              </div>
              <div className="mt-2 text-white text-[8px] sm:text-xs font-bold bg-black/50 px-2 py-1">
                {player1Name}
              </div>
            </div>

            {/* Heart between them */}
            <div className={`flex items-center justify-center transition-all duration-500 ${
              showHearts ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}>
              <div className="text-4xl sm:text-6xl animate-pulse-heart">
                ❤️
              </div>
            </div>

            {/* Player 2 */}
            <div className="flex flex-col items-center">
              <div className={`transition-transform duration-300 ${
                animationPhase === 'walking' || animationPhase === 'hearts' || animationPhase === 'message'
                  ? 'animate-bounce-walk-delayed'
                  : ''
              }`}>
                <Avatar
                  avatarKey={player2Avatar}
                  emotion="happy"
                  size={80}
                  animated={true}
                />
              </div>
              <div className="mt-2 text-white text-[8px] sm:text-xs font-bold bg-black/50 px-2 py-1">
                {player2Name}
              </div>
            </div>
          </div>

          {/* Floating hearts */}
          {showHearts && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-xl sm:text-2xl animate-float-heart"
                  style={{
                    left: `${20 + i * 10}%`,
                    bottom: '20%',
                    animationDelay: `${i * 0.2}s`,
                  }}
                >
                  💕
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Success message */}
        <div className={`text-center max-w-md transition-all duration-1000 ${
          showMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="bg-white/10 border-4 border-pink-400 p-4 sm:p-6 backdrop-blur-sm">
            <p className="text-pink-200 text-xs sm:text-sm leading-relaxed mb-3">
              🌟 Przeszliście razem przez wszystkie etapy randki! 🌟
            </p>
            <p className="text-yellow-300 text-[10px] sm:text-xs">
              To dopiero początek waszej wspólnej przygody...
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <span className="text-2xl animate-bounce" style={{ animationDelay: '0s' }}>✨</span>
              <span className="text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>💑</span>
              <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-in;
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }

        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }

        @keyframes bounce-walk {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-bounce-walk {
          animation: bounce-walk 0.6s ease-in-out infinite;
        }

        .animate-bounce-walk-delayed {
          animation: bounce-walk 0.6s ease-in-out infinite;
          animation-delay: 0.3s;
        }

        @keyframes pulse-heart {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }

        .animate-pulse-heart {
          animation: pulse-heart 1s ease-in-out infinite;
        }

        @keyframes float-heart {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-120px) rotate(15deg);
            opacity: 0;
          }
        }

        .animate-float-heart {
          animation: float-heart 2s ease-out forwards;
        }

        .pixel-glow {
          text-shadow: 0 0 10px rgba(253, 224, 71, 0.8),
                       0 0 20px rgba(253, 224, 71, 0.5);
        }
      `}</style>
    </div>
  );
}
