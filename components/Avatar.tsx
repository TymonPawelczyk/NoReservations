'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { AVATARS, AvatarKey, AvatarEmotion } from '@/lib/avatars';

interface AvatarProps {
  avatarKey: AvatarKey;
  emotion?: AvatarEmotion;
  size?: number;
  className?: string;
  animated?: boolean;
}

export default function Avatar({ 
  avatarKey, 
  emotion = 'open', 
  size = 120,
  className = '',
  animated = false
}: AvatarProps) {
  const [currentEmotion, setCurrentEmotion] = useState<AvatarEmotion>(emotion);

  useEffect(() => {
    setCurrentEmotion(emotion);
  }, [emotion]);

  useEffect(() => {
    if (!animated) return;

    const interval = setInterval(() => {
      // Randomly blink or change expression slightly
      setCurrentEmotion(prev => {
        if (prev === 'closed') return emotion;
        return Math.random() > 0.1 ? 'closed' : emotion;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [animated, emotion]);

  const src = AVATARS[avatarKey]?.[currentEmotion] || AVATARS.tymon.open;

  return (
    <div className={`pixel-art flex justify-center items-center mx-auto ${className}`} style={{ width: size, height: size }}>
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
