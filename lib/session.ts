import { AvatarKey } from './avatars';

// Session document structure
export interface SessionData {
  code: string;
  createdAt: string; // ISO timestamp
  startAt: string; // ISO timestamp (when stage 1 unlocks)
  stage: 1 | 2 | 3;
  stageUnlockedAt: string; // ISO timestamp
  ready: Record<string, boolean>; // uid -> ready status
  participants: Record<string, Participant>;
  outcomes?: {
    stage1?: 'italian' | 'hotpot' | 'sushi';
    stage2?: 'museum' | 'walk' | 'bowling' | 'pool' | 'picnic' | 'cinema';
  };
  outcomeData?: {
    stage1Agreement?: number;
  };
  resetRequests?: {
    stage1?: Record<string, boolean>;
    stage2?: Record<string, boolean>;
    stage3?: Record<string, boolean>;
  };
}

export interface Participant {
  displayName: string;
  avatarKey: AvatarKey;
  lastSeenAt: string; // ISO timestamp
}

// Answer document structure per stage
export interface AnswersData {
  [uid: string]: {
    answers: Record<string, string | number>; // questionId -> answer
    miniGameScore?: number; // For bowling mini-game
    quizScore?: number; // For stage 3 quiz
  };
}

// Generate 6-digit code
export function generateSessionCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate unique user ID (simple random for MVP)
export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Check if stage should unlock based on time
export function shouldUnlockByTime(stageUnlockedAt: string): boolean {
  const unlockTime = new Date(stageUnlockedAt).getTime();
  const now = Date.now();
  return now >= unlockTime;
}

// Check if both users are ready
export function areBothReady(ready: Record<string, boolean>): boolean {
  const readyStates = Object.values(ready);
  return readyStates.length === 2 && readyStates.every(r => r === true);
}
