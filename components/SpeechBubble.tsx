'use client';

import { useEffect, useState } from 'react';

interface SpeechBubbleProps {
  text: string;
  onClose?: () => void;
  autoCloseDuration?: number;
  className?: string;
}

export default function SpeechBubble({ 
  text, 
  onClose, 
  autoCloseDuration = 3000,
  className = '' 
}: SpeechBubbleProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoCloseDuration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [autoCloseDuration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`speech-bubble text-black text-xs ${className}`}>
      <p>{text}</p>
    </div>
  );
}
