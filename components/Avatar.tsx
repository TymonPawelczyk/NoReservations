'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { AVATARS, AvatarKey, AvatarEmotion } from '@/lib/avatars';

interface AvatarProps {
  avatarKey: AvatarKey;
  emotion?: AvatarEmotion;
  size?: number;
  className?: string;
  animated?: boolean;
  clickable?: boolean;
}

export default function Avatar({
  avatarKey,
  emotion = 'open',
  size = 120,
  className = '',
  animated = false,
  clickable = false
}: AvatarProps) {
  const [currentEmotion, setCurrentEmotion] = useState<AvatarEmotion>(emotion);
  const surpriseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSurprised, setIsSurprised] = useState(false);

  useEffect(() => {
    setCurrentEmotion(emotion);
  }, [emotion]);

  useEffect(() => {
    if (!animated) return;

    const interval = setInterval(() => {
      // Randomly blink (closed ~10% of the time)
      setCurrentEmotion(prev => {
        if (prev === 'closed') return emotion;
        return Math.random() < 0.1 ? 'closed' : emotion;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [animated, emotion]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (surpriseTimeoutRef.current) {
        clearTimeout(surpriseTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    if (!clickable) return;

    // Clear any existing timeout to handle multiple clicks
    if (surpriseTimeoutRef.current) {
      clearTimeout(surpriseTimeoutRef.current);
    }

    // Set surprised state
    setIsSurprised(true);
    setCurrentEmotion('surprised');

    // Reset to original emotion after 1.5 seconds
    surpriseTimeoutRef.current = setTimeout(() => {
      setIsSurprised(false);
      setCurrentEmotion(emotion);
      surpriseTimeoutRef.current = null;
    }, 1500);
  };

  const src = AVATARS[avatarKey]?.[currentEmotion] || AVATARS.tymon.open;

  return (
    <div
      className={`pixel-art flex justify-center items-center mx-auto ${clickable ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: size, height: size }}
      onClick={handleClick}
    >
      <Image
        src={src}
        alt={`Avatar ${avatarKey}`}
        width={size}
        height={size}
        className="pixel-art object-contain"
        unoptimized
      />
    </div>
  );
}
