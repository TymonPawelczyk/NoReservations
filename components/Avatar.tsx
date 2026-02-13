'use client';

import Image from 'next/image';
import { AVATARS, AvatarKey, AvatarEmotion } from '@/lib/avatars';

interface AvatarProps {
  avatarKey: AvatarKey;
  emotion?: AvatarEmotion;
  size?: number;
  className?: string;
}

export default function Avatar({ 
  avatarKey, 
  emotion = 'open', 
  size = 120,
  className = '' 
}: AvatarProps) {
  const src = AVATARS[avatarKey]?.[emotion] || AVATARS.tymon.open;

  return (
    <div className={`pixel-art ${className}`}>
      <Image
        src={src}
        alt={`Avatar ${avatarKey}`}
        width={size}
        height={size}
        className="pixel-art"
        unoptimized
      />
    </div>
  );
}
